import { execFileSync } from "node:child_process";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(root, "r2-assets", "kashiwa");
const wrangler = path.join(root, "node_modules", "wrangler", "bin", "wrangler.js");
const config = path.join(root, "sites", "kashiwa", "wrangler.jsonc");
const bucket = "co-place-pmtiles";

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === ".DS_Store") continue;

    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    } else {
      throw new Error(`Unsupported filesystem entry: ${path.relative(root, entryPath)}`);
    }
  }

  return files;
}

const files = await listFiles(sourceRoot);
files.sort((a, b) => a.localeCompare(b));

if (files.length === 0) {
  throw new Error("No files found under r2-assets/kashiwa");
}

for (const file of files) {
  const key = path.relative(sourceRoot, file).split(path.sep).join("/");
  console.log(`Uploading ${key}`);
  execFileSync(process.execPath, [
    wrangler,
    "r2",
    "object",
    "put",
    `${bucket}/${key}`,
    "--file",
    file,
    "--content-type",
    "application/vnd.pmtiles",
    "--cache-control",
    "public, max-age=3600",
    "--local",
    "--force",
    "--config",
    config,
  ], {
    cwd: root,
    stdio: "inherit",
  });
}

console.log(`Uploaded ${files.length} files to the local ${bucket} bucket`);
