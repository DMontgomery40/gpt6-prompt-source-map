import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const script = path.resolve(import.meta.dirname, "..", "session-anatomy.mjs");

test("session anatomy never publishes personal content, ids, paths or the time zone", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "anatomy-"));
  const secrets = {
    memory: "SECRET-MEMORY the user prefers a very specific private workflow for their clinic",
    skill: "- `r7` = `/Users/someone/private-skills/clinic-billing`",
    agents: "SECRET-AGENTS never mention the acquisition target named in these instructions",
    email: "reach me at someone.private@example.com for the private thing we discussed",
    cwd: "/Users/someone/Documents/Codex/2026-09-25/secret-project",
    timezone: "America/Denver",
    account: "acct-0000-secret-account", user: "user-secret-creator-id", session: "01a0dbb9-0000-secret"
  };
  const msg = (role, text) => ({ type: "response_item", payload: { type: "message", role, content: [{ type: "input_text", text }] } });
  const rows = [
    { type: "session_meta", payload: { id: secrets.session, session_id: secrets.session, creator_user_id: secrets.user, creator_account_id: secrets.account, cwd: secrets.cwd, timestamp: "2026-09-26T03:19:00.000Z", base_instructions: { text: "You are a test model with a sufficiently long base instruction line.", provenance: { type: "model", model: "gpt-6-astra" } } } },
    msg("developer", `<app-context>\n# Codex desktop context\nUse work/ for drafts. Deliverables go to ${secrets.cwd}/outputs only.\nContact line: ${secrets.email}\n</app-context>`),
    msg("developer", `## Memory\n${secrets.memory}\n${secrets.email}`),
    msg("developer", `<skills_instructions>\n## Skills\n${secrets.skill}\n</skills_instructions>`),
    msg("user", `# AGENTS.md instructions\n${secrets.agents}`),
    msg("user", `<environment_context>\n<cwd>${secrets.cwd}</cwd>\n<timezone>${secrets.timezone}</timezone>\n</environment_context>`),
    { type: "turn_context", payload: { model: "gpt-6-astra", effort: "high", cwd: secrets.cwd, timezone: secrets.timezone, cyber_access_program: "secret-program", sandbox_policy: { type: "read-only" }, collaboration_mode: { mode: "default" } } },
    msg("user", "the user's actual prompt"),
    msg("assistant", "first reply")
  ];
  const log = path.join(dir, "rollout.jsonl");
  fs.writeFileSync(log, rows.map(r => JSON.stringify(r)).join("\n"));
  const out = path.join(dir, "page.md");
  const run = spawnSync(process.execPath, [script, log], { env: { ...process.env, SESSION_ANATOMY_OUT: out }, encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  const page = fs.readFileSync(out, "utf8");
  for (const [name, value] of Object.entries(secrets)) {
    const probe = name === "memory" || name === "agents" ? value.slice(0, 20) : name === "skill" ? "private-skills" : value;
    assert.ok(!page.includes(probe), `${name} leaked into the page`);
  }
  assert.ok(!page.includes("secret-program"), "account-specific setting leaked");
  assert.match(page, /Deliverables go to <path> only\./, "run-time text is shown with the path masked");
  assert.match(page, /captured on 2026-09-25/, "the capture date is the local date, not UTC");
  assert.match(page, /of the user's own content, not shown/);
});
