import crypto from "node:crypto";
import { byteOffset } from "./asar.mjs";
import {
  callExtracted,
  declaratorName,
  decodeLiteral,
  enclosingFunction,
  innermostLiteral,
  insideLiteral,
  literalsOf
} from "./js-scan.mjs";
import {
  distinctBranches,
  fullContextOnlyHeadings,
  functionHelperPrompts,
  staticHelperPrompts,
  voicePrompts
} from "../prompts.mjs";

export class AnchorError extends Error {}

const sha256 = value => crypto.createHash("sha256").update(value).digest("hex");

function occurrences(asar, spec) {
  const hits = asar.findPhrase(spec.anchor);
  if (!hits.length) throw new AnchorError(`[${spec.id}] anchor not found in any app script: "${spec.anchor}"`);
  const found = [];
  // Provenance order: the renderer bundle first, then main-process bundles.
  const rank = entry => `${entry.path.startsWith("webview/") ? 0 : 1}${entry.path}`;
  for (const { entry } of hits.sort((a, b) => rank(a.entry).localeCompare(rank(b.entry)))) {
    const text = asar.textOf(entry);
    for (let at = text.indexOf(spec.anchor); at >= 0; at = text.indexOf(spec.anchor, at + 1)) {
      found.push({ entry, source: text, index: at });
    }
  }
  return found;
}

// Several matches are acceptable only when they all yield the same text.
function agree(spec, results) {
  const distinct = new Set(results.map(result => result.text));
  if (distinct.size !== 1) {
    const places = results.map(result => `${result.file}@${result.offset}`).join(", ");
    throw new AnchorError(`[${spec.id}] anchor matched ${results.length} places with ${distinct.size} different texts: ${places}`);
  }
  return results[0];
}

function extractLiteral(asar, spec) {
  const results = occurrences(asar, spec).map(({ entry, source, index }) => {
    const literal = innermostLiteral(literalsOf(source), index);
    if (!literal) throw new AnchorError(`[${spec.id}] anchor in ${entry.path} is not inside a string literal`);
    if (literal.substitutions) throw new AnchorError(`[${spec.id}] literal in ${entry.path} has substitutions; it is no longer a static prompt`);
    const text = decodeLiteral(source, literal);
    return {
      text,
      file: entry.path,
      fileSha256: asar.fileSha256(entry),
      identifier: declaratorName(source, literal),
      offset: byteOffset(source, literal.start + 1),
      endOffset: byteOffset(source, literal.end - 1)
    };
  });
  const result = agree(spec, results);
  if (!result.text.includes(spec.anchor)) throw new AnchorError(`[${spec.id}] decoded text lost its anchor`);
  return { ...spec, ...result };
}

// The function that references the anchor literal's variable and takes every
// option in `spec.params`; null when this file only holds the literal.
function builderFor(spec, entry, source, index) {
  const literal = innermostLiteral(literalsOf(source), index);
  const name = literal && declaratorName(source, literal);
  if (!name) throw new AnchorError(`[${spec.id}] anchor literal in ${entry.path} is not assigned to a variable`);
  const builders = new Map();
  const escaped = name.replace(/\$/g, "\\$");
  for (const match of source.matchAll(new RegExp(`(?<![\\w$.#])${escaped}(?![\\w$=])`, "g"))) {
    if (insideLiteral(source, match.index)) continue;
    let fn;
    try {
      fn = enclosingFunction(source, match.index);
    } catch {
      continue;
    }
    if (spec.params.every(param => new RegExp(`[({,]${param}\\b`).test(fn.params))) builders.set(fn.start, fn);
  }
  if (builders.size > 1) throw new AnchorError(`[${spec.id}] ${builders.size} functions in ${entry.path} build from ${name}`);
  return builders.values().next().value ?? null;
}

function extractFunctionPrompt(asar, spec) {
  const found = occurrences(asar, spec).map(({ entry, source, index }) => {
    let fn;
    try {
      fn = spec.via === "builder" ? builderFor(spec, entry, source, index) : enclosingFunction(source, index);
    } catch (error) {
      if (error instanceof AnchorError) throw error;
      throw new AnchorError(`[${spec.id}] ${error.message} in ${entry.path}`);
    }
    return fn && { entry, source, fn };
  }).filter(Boolean);
  if (!found.length) throw new AnchorError(`[${spec.id}] no function builds a prompt from the anchor "${spec.anchor}"`);
  const results = found.map(({ entry, source, fn }) => {
    for (const param of spec.params ?? []) {
      if (!new RegExp(`[({,]${param}\\b`).test(fn.params)) {
        throw new AnchorError(`[${spec.id}] ${fn.name} in ${entry.path} no longer takes option ${param}`);
      }
    }
    let called;
    try {
      called = callExtracted(source, fn.source, spec.args, { label: `[${spec.id}] ${fn.name}` });
    } catch (error) {
      throw new AnchorError(`${error.message} (${entry.path})`);
    }
    const text = spec.wrap ? spec.wrap(called.text) : called.text;
    return {
      text,
      name: fn.name,
      file: entry.path,
      fileSha256: asar.fileSha256(entry),
      offset: byteOffset(source, fn.start)
    };
  });
  const result = agree(spec, results);
  if (!result.text.includes(spec.anchor)) throw new AnchorError(`[${spec.id}] extracted text does not contain "${spec.anchor}"`);
  return { ...spec, ...result, field: spec.field(result.name) };
}

export function extractAppPrompts(asar) {
  const staticHelpers = staticHelperPrompts.map(spec => extractLiteral(asar, spec));
  const functionHelpers = functionHelperPrompts.map(spec => extractFunctionPrompt(asar, spec));
  const voice = voicePrompts.map(spec => extractLiteral(asar, spec));

  const byId = new Map(functionHelpers.map(item => [item.id, item]));
  for (const group of distinctBranches) {
    const texts = group.map(id => byId.get(id).text);
    if (new Set(texts).size !== texts.length) {
      throw new AnchorError(`branches ${group.join(", ")} produced identical text; a branch option no longer has an effect`);
    }
  }
  const defaultContext = byId.get("desktop-context-default").text;
  const fullContext = byId.get("desktop-context-full").text;
  for (const heading of fullContextOnlyHeadings) {
    if (!fullContext.includes(heading)) throw new AnchorError(`full desktop context lacks "${heading}"; a builder option was renamed or removed`);
    if (defaultContext.includes(heading)) throw new AnchorError(`default desktop context unexpectedly contains "${heading}"`);
  }

  for (const item of [...staticHelpers, ...functionHelpers, ...voice]) item.sha256 = sha256(item.text);
  return { staticHelpers, functionHelpers, voice };
}
