// Numbers in narrative prose come from the data, never from typed text, so they can't go
// stale when a refresh changes the records. Pages write tokens; the build fills them in:
//
//   {{count:settings kind=setting documented=null}}   records in outputs/settings.json
//                                                      matching every filter
//   {{value:capture-summary cli.tools}}               a value from outputs/<file>.json
//
// Filters are dotted paths into a record (kind, group, documented, details.hidden, ...)
// compared with a literal: `true`, `false`, `null`, `*` (present and non-empty), a number,
// or a word (use quotes for spaces: group="Safe env keys"). An unknown file, path, or
// malformed token fails the build.
import { readFileSync } from "node:fs";
import path from "node:path";

const token = /\{\{(count|value):([a-z0-9-]+)((?:\s+[^\s}]+(?:="[^"]*")?)*)\s*\}\}/g;

function at(object, dotted) {
  return dotted.split(".").reduce((value, key) => (value == null ? undefined : value[key]), object);
}

function matches(actual, expected) {
  if (expected === "*") return actual !== undefined && actual !== null && actual !== "" && !(Array.isArray(actual) && !actual.length);
  if (expected === "null") return actual === undefined || actual === null;
  if (expected === "true" || expected === "false") return actual === (expected === "true");
  if (/^-?\d+(\.\d+)?$/.test(expected)) return actual === Number(expected);
  return String(actual) === expected;
}

function format(value) {
  if (typeof value === "number") return value.toLocaleString("en-US");
  if (Array.isArray(value)) return value.map(format).join(", ");
  if (value === undefined || value === null || typeof value === "object") throw new Error("not a printable value");
  return String(value);
}

export function expandFacts(markdown, sourceRoot, where) {
  const files = new Map();
  const load = name => {
    if (!files.has(name)) {
      try { files.set(name, JSON.parse(readFileSync(path.join(sourceRoot, "outputs", `${name}.json`), "utf8"))); }
      catch (error) { throw new Error(`${where}: {{…:${name}}} needs outputs/${name}.json (${error.message})`); }
    }
    return files.get(name);
  };
  return markdown.replace(token, (whole, kind, name, rest) => {
    const args = [...rest.matchAll(/([^\s=]+)(?:=(?:"([^"]*)"|(\S+)))?/g)].map(m => ({ key: m[1], value: m[2] ?? m[3] }));
    const data = load(name);
    if (kind === "value") {
      if (args.length !== 1 || args[0].value !== undefined) throw new Error(`${where}: ${whole} needs exactly one path`);
      const value = at(data, args[0].key);
      if (value === undefined) throw new Error(`${where}: ${whole}: ${args[0].key} is not in outputs/${name}.json`);
      try { return format(value); } catch (error) { throw new Error(`${where}: ${whole}: ${error.message}`); }
    }
    if (!Array.isArray(data.items)) throw new Error(`${where}: ${whole}: outputs/${name}.json has no items`);
    if (args.some(a => a.value === undefined)) throw new Error(`${where}: ${whole}: filters are path=value`);
    return format(data.items.filter(item => args.every(a => matches(at(item, a.key), a.value))).length);
  });
}
