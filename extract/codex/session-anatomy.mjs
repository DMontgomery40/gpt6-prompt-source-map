#!/usr/bin/env node
// "What a desktop turn contains": one Codex/ChatGPT desktop session log, in the order the model
// received it, with personal content removed. Run by hand on a session the owner chooses; the
// watcher never reads session logs.
//
// Every line of every injected message is classified:
//   published  – already on this site (linked to the page that has it)
//   shipped    – found verbatim in the installed app or its CLI, but not yet on the site (shown)
//   assembled  – in neither; shown only for message kinds that carry no personal content,
//                with paths and e-mail addresses masked
//   personal   – memories, installed skills, AGENTS.md: counted, never shown
//
// Usage: node extract/codex/session-anatomy.mjs <rollout.jsonl>   (writes outputs/desktop-turn-anatomy.md)

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { codexApp } from "./lib/app-layout.mjs";
import { privacyScan } from "./lib/privacy.mjs";
import { categories } from "../../site/src/catalog.mjs";

const repo = path.resolve(import.meta.dirname, "..", "..");
const log = process.argv[2];
if (!log || !fs.existsSync(log)) { console.error("usage: session-anatomy.mjs <rollout.jsonl>"); process.exit(2); }
const rows = fs.readFileSync(log, "utf8").split("\n").filter(Boolean).map(line => JSON.parse(line));

const squash = text => text.replace(/\s+/g, " ").trim();
const mask = text => text
  .replace(/\/(?:Users|home|private\/var)\/[^\s`'")\]]+/g, "<path>")
  .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g, "<email>");
const fmt = n => n.toLocaleString("en-US");

// Site corpus: every published page, with the slug to link to.
const pages = categories.flatMap(c => c.files).filter(f => f.path.endsWith(".md") && f.slug && fs.existsSync(path.join(repo, f.path)))
  .filter(f => f.path !== "outputs/desktop-turn-anatomy.md")
  .map(f => ({ slug: f.slug, title: f.title, text: squash(fs.readFileSync(path.join(repo, f.path), "utf8")) }));
const pageOf = line => { const s = squash(line); return s.length >= 25 ? pages.find(p => p.text.includes(s)) : null; };

// Shipped bytes: the app's asar and every CLI executable.
const app = codexApp();
const binDir = path.dirname(app.entrypoint);
const shippedBytes = [app.asar, app.binary, ...fs.readdirSync(binDir).map(n => path.join(binDir, n)).filter(f => f !== app.entrypoint)].map(f => fs.readFileSync(f));
const shipped = line => { const s = line.trim(); if (s.length < 25) return false; const b = Buffer.from(s); return shippedBytes.some(buf => buf.includes(b)); };

// Message kinds: which carry personal content, and a readable name.
const KINDS = [
  [/^<app-context>/, "App context", false],
  [/^## Memory/, "Memory", true],
  [/^<skills_instructions>/, "Skills", true],
  [/^<permissions instructions>/, "Permissions", false],
  [/^<collaboration_mode>/, "Collaboration mode", false],
  [/^<recommended_plugins>/, "Recommended plugins", false],
  [/^<multi_agent_role>/, "Multi-agent role", false],
  [/^<multi_agent_mode>/, "Multi-agent mode", false],
  [/^# AGENTS\.md instructions/, "AGENTS.md instructions", true],
  [/^<environment_context>/, "Environment context", false]
];
const kindOf = text => KINDS.find(([re]) => re.test(text.trim())) ?? [null, "Other context", true];

const fence = text => "`".repeat(Math.max(3, 1 + Math.max(0, ...[...text.matchAll(/`+/g)].map(m => m[0].length))));
function describe(text, personal) {
  const lines = text.split("\n");
  const runs = [];
  let pending = [];
  for (const line of lines) {
    // Blank and short lines (headings, tags) are too short to attribute; they join the text around them.
    if (squash(line).length < 25) { if (runs.length) runs.at(-1).lines.push(line); else pending.push(line); continue; }
    const page = pageOf(line);
    const kind = page ? "published" : shipped(line) ? "shipped" : personal ? "personal" : "assembled";
    const last = runs.at(-1);
    if (last && last.kind === kind && (kind !== "published" || last.page === page)) last.lines.push(line);
    else { runs.push({ kind, page, lines: [...pending, line] }); pending = []; }
  }
  const out = [];
  for (const run of runs) {
    const body = run.lines.join("\n").replace(/\n+$/, "");
    const count = run.lines.filter(l => l.trim()).length;
    if (run.kind === "published") out.push(runs.length === 1 ? `Every line is published on [${run.page.title}](../${run.page.slug}/).` : `${count === 1 ? "One line" : `${fmt(count)} lines`} published on [${run.page.title}](../${run.page.slug}/).`, "");
    else if (run.kind === "personal") out.push(`*${count === 1 ? "One line" : `${fmt(count)} lines`} of the user's own content, not shown.*`, "");
    else {
      const shown = mask(body); const f = fence(shown);
      out.push(run.kind === "shipped" ? "Shipped in the app, not yet on this site:" : "Assembled at run time (paths and e-mail addresses masked):", "", `${f}text`, shown, f, "");
    }
  }
  return out;
}

const meta = rows.find(r => r.type === "session_meta").payload;
const turn = rows.find(r => r.type === "turn_context").payload;
const world = rows.find(r => r.type === "world_state")?.payload?.state ?? {};
const firstAssistant = rows.findIndex(r => r.payload?.type === "message" && r.payload.role === "assistant");
const injected = rows.slice(0, firstAssistant).filter(r => r.type === "response_item" && r.payload?.type === "message" && ["developer", "user"].includes(r.payload.role))
  .flatMap(r => r.payload.content.map(c => ({ role: r.payload.role, text: c.text ?? "" })));
const firstUserPrompt = injected.findLast(m => m.role === "user");

const cli = execFileSync(app.entrypoint, ["--version"], { encoding: "utf8" }).trim();
const plist = key => execFileSync("/usr/libexec/PlistBuddy", ["-c", `Print ${key}`, app.plist], { encoding: "utf8" }).trim();
// The log stores UTC; the capture date is the user's local date (the zone itself is not published).
const date = new Date(meta.timestamp).toLocaleDateString("en-CA", { timeZone: turn.timezone || "UTC" });
const lines = [
  "# What a desktop turn contains", "",
  `Source: one Codex/ChatGPT desktop session captured on ${date} (ChatGPT desktop ${plist("CFBundleShortVersionString")}, build ${plist("CFBundleVersion")}; ${cli}; model \`${turn.model}\`).`, "",
  "The desktop app writes every session to a log on the user's machine. This page is generated from one of those logs and shows what the model received before its first reply, in order: the base instructions, the developer messages, the user's context, the turn settings, and then the user's message. Text that is already on this site links to its page. Text that ships in the app but was not on the site yet is shown in full. Text assembled when the session started is shown with paths and e-mail addresses masked. The user's own memories, installed skills and AGENTS.md files are counted, never shown.", "",
  "This is one session. Other accounts, models, settings, plugins and projects change parts of it.", "",
  "## Base instructions", "",
  "### Base instructions", "",
  `Source: the session's base instructions, provenance \`${meta.base_instructions?.provenance?.type ?? "unknown"}\` (\`${meta.base_instructions?.provenance?.model ?? "?"}\`), ${fmt(meta.base_instructions.text.length)} characters.`, "",
  ...describe(meta.base_instructions.text, false),
  "## Developer messages", ""
];
let n = 0;
const developer = injected.filter(m => m.role === "developer");
for (const message of developer) {
  const [, name, personal] = kindOf(message.text);
  lines.push(`### ${++n}. ${name}`, "", `Source: developer message ${n} of ${developer.length}, ${fmt(message.text.length)} characters.`, "", ...describe(message.text, personal));
}
lines.push("## The user's context", "");
for (const message of injected.filter(m => m.role === "user" && m !== firstUserPrompt)) {
  const [, name, personal] = kindOf(message.text);
  lines.push(`### ${name}`, "", `Source: user-role context message, ${fmt(message.text.length)} characters.`, "");
  if (name === "Environment context") {
    const tags = [...new Set([...message.text.matchAll(/<(\w+)>/g)].map(m => m[1]).filter(t => t !== "environment_context"))];
    lines.push(`Fields: ${tags.map(t => `\`${t}\``).join(", ")}. Their values (working directory, date, time zone, file system and workspace roots) describe the user's machine and are not shown.`, "");
  } else lines.push(...describe(message.text, personal));
}
const shownSettings = ["model", "effort", "summary", "personality", "approval_policy", "approvals_reviewer", "multi_agent_version", "realtime_active"];
lines.push("## Turn settings", "", "### Turn context", "", "Source: the session's turn context for the first turn.", "",
  "| Setting | Value in this session |", "| --- | --- |",
  ...shownSettings.filter(k => k in turn).map(k => `| \`${k}\` | \`${turn[k]}\` |`),
  `| \`sandbox_policy\` | \`${turn.sandbox_policy?.type}\` |`,
  `| \`collaboration_mode\` | \`${turn.collaboration_mode?.mode}\` |`, "",
  `Also present, values not shown because they may describe the account or machine: ${Object.keys(turn).filter(k => !shownSettings.includes(k) && !["sandbox_policy", "collaboration_mode"].includes(k)).map(k => `\`${k}\``).join(", ")}.`, "",
  "### World state", "", "Source: the session's world state, the per-thread record of which context sections are active.", "",
  "| Section | In this session |", "| --- | --- |",
  ...Object.entries(world).map(([k, v]) => `| \`${k}\` | ${typeof v === "boolean" ? (v ? "on" : "off") : typeof v === "string" ? (k === "model" ? `\`${v}\`` : v ? "set" : "empty") : Object.keys(v).length ? "present" : "empty"} |`), "");
const calls = rows.filter(r => ["custom_tool_call", "function_call"].includes(r.payload?.type)).map(r => r.payload.name);
const counts = Object.entries(calls.reduce((a, n) => ({ ...a, [n]: (a[n] ?? 0) + 1 }), {}));
const reasoning = rows.filter(r => r.payload?.type === "reasoning");
lines.push("## After the first message", "", "### Tools and reasoning", "", "Source: the rest of the session log.", "",
  `Tools the model called in this session: ${counts.map(([k, v]) => `\`${k}\` (${v})`).join(", ")}. Their definitions are on [Tool manifest (live)](../tool-manifest/). Arguments and results are not shown.`, "",
  `Reasoning items: ${reasoning.length}, all stored encrypted; ${reasoning.filter(r => r.payload.summary?.length).length} carry a readable summary, not shown.`, "");

const page = `${lines.join("\n").trimEnd()}\n`;
// Refuse anything identifying: ids from the log, the log's own path, and the privacy rules.
for (const secret of [meta.creator_user_id, meta.creator_account_id, meta.session_id, meta.id, meta.cwd, turn.cwd, turn.timezone].filter(Boolean)) {
  if (page.includes(secret)) throw new Error("refusing to write: the page contains an id or path from the session log");
}
privacyScan(new Map([["desktop-turn-anatomy.md", page]]));
const outFile = process.env.SESSION_ANATOMY_OUT || path.join(repo, "outputs/desktop-turn-anatomy.md");
fs.writeFileSync(outFile, page);
const kinds = page.match(/^(Shipped in the app|Assembled at run time|\*.* of the user's own content)/gm) ?? [];
console.log(JSON.stringify({ written: path.relative(repo, outFile), developer_messages: developer.length, shipped_runs: kinds.filter(k => k.startsWith("Shipped")).length, assembled_runs: kinds.filter(k => k.startsWith("Assembled")).length, personal_runs: kinds.filter(k => k.startsWith("*")).length }));
