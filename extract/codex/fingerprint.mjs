#!/usr/bin/env node
// Cheap hourly check: prints one JSON line identifying the installed inputs,
// {"app_build", "cli_sha256", "catalog_sha256", "asar_size", "asar_mtime"}.
// When it matches the previous run's line, refresh.mjs has nothing new to read.
//
// catalog_sha256 hashes `codex debug models` with fetch/account keys removed at
// every depth and object keys sorted (see canonicalCatalog in lib/catalog.mjs).
// app.asar is only stat'ed, never read, to stay well under two seconds.
//
// Exit: 0 success; 2 the app, CLI or catalog can't be found; 1 anything else.

import crypto from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { canonicalCatalog, SourceError } from "./lib/catalog.mjs";

const appPath = process.env.CODEX_APP_PATH || "/Applications/ChatGPT.app";
const asarPath = path.join(appPath, "Contents/Resources/app.asar");
const binaryPath = path.join(appPath, "Contents/Resources/codex");
const plistPath = path.join(appPath, "Contents/Info.plist");

function fingerprint() {
  for (const required of [asarPath, binaryPath, plistPath]) {
    if (!fs.existsSync(required)) throw new SourceError(`missing ${path.relative(appPath, required)} under ${path.basename(appPath)}`);
  }
  const appBuild = execFileSync("/usr/libexec/PlistBuddy", ["-c", "Print CFBundleVersion", plistPath], { encoding: "utf8" }).trim();
  const cliSha256 = crypto.createHash("sha256").update(fs.readFileSync(binaryPath)).digest("hex");

  const result = spawnSync(binaryPath, ["debug", "models"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 60_000 });
  if (result.error || result.status !== 0) {
    throw new SourceError(`codex debug models failed: ${result.error?.message ?? result.stderr.trim().slice(0, 500)}`);
  }
  let catalog;
  try {
    catalog = JSON.parse(result.stdout);
  } catch (error) {
    throw new SourceError(`codex debug models did not return JSON: ${error.message}`);
  }

  const asar = fs.statSync(asarPath);
  return {
    app_build: appBuild,
    cli_sha256: cliSha256,
    catalog_sha256: crypto.createHash("sha256").update(canonicalCatalog(catalog)).digest("hex"),
    asar_size: asar.size,
    asar_mtime: asar.mtime.toISOString()
  };
}

try {
  console.log(JSON.stringify(fingerprint()));
} catch (error) {
  console.error(`fingerprint failed: ${error.message}`);
  process.exit(error instanceof SourceError ? 2 : 1);
}
