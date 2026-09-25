import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderSite } from "./render.mjs";

const displayReplacements = [
  ["token-gremlin-https-x-com-tokengremlin", "aeon-daybreak-binwalk-extraction"]
];

function rewriteDisplayPaths(source) {
  return displayReplacements.reduce(
    (result, [search, replacement]) => result.replaceAll(search, replacement),
    source
  );
}

// Document pages are regenerated on every build so renamed documents leave no stale pages.
async function removeDocumentPages(outDir) {
  for (const entry of await readdir(outDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const page = path.join(outDir, entry.name, "index.html");
    if (await stat(page).then(() => true, () => false)) await rm(path.join(outDir, entry.name), { recursive: true });
  }
}

export async function buildSite({ sourceRoot, outFile, categories }) {
  const documents = [];

  for (const category of categories) {
    for (const file of category.files) {
      try {
        const source = rewriteDisplayPaths(
          await readFile(path.join(sourceRoot, file.path), "utf8")
        );
        documents.push({ ...file, category: category.label, source });
      } catch (error) {
        throw new Error(`Unable to read ${file.path}: ${error.message}`, {
          cause: error
        });
      }
    }
  }

  const outDir = path.dirname(outFile);
  await mkdir(outDir, { recursive: true });
  await removeDocumentPages(outDir);
  const status = await readFile(path.join(sourceRoot, "outputs/status.json"), "utf8").then(JSON.parse, () => null);
  for (const page of renderSite({ categories, documents, status })) {
    const file = page.path === "index.html" ? outFile : path.join(outDir, page.path);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, page.html, "utf8");
  }
}
