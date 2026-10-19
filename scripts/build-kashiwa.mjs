import { copyFile, mkdir, readdir, rename, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteRoot = path.join(root, "sites", "kashiwa");
const outputRoot = path.join(siteRoot, "dist");
const temporaryRoot = path.join(siteRoot, ".dist-tmp");
const maxAssetSize = 25 * 1024 * 1024;
const ignoredDirectories = new Set(["dist", ".dist-tmp", "node_modules", "src"]);
const copiedFiles = new Map();

async function findPublicDirectories(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const directories = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || ignoredDirectories.has(entry.name)) continue;

    const entryPath = path.join(directory, entry.name);
    if (entry.name === "public") {
      directories.push(entryPath);
      continue;
    }

    directories.push(...await findPublicDirectories(entryPath));
  }

  return directories;
}

async function copyDirectory(source, destination, ignoredEntries = new Set()) {
  const entries = await readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === ".DS_Store" || ignoredEntries.has(entry.name)) continue;

    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, destinationPath);
      continue;
    }

    if (!entry.isFile()) {
      throw new Error(`Unsupported filesystem entry: ${path.relative(root, sourcePath)}`);
    }

    const file = await stat(sourcePath);
    if (file.size > maxAssetSize) {
      throw new Error(`Asset exceeds 25 MiB and must be stored in R2: ${path.relative(root, sourcePath)}`);
    }

    const relativeDestination = path.relative(temporaryRoot, destinationPath);
    const previousSource = copiedFiles.get(relativeDestination);
    if (previousSource) {
      throw new Error(`Duplicate output path ${relativeDestination}: ${previousSource} and ${path.relative(root, sourcePath)}`);
    }

    copiedFiles.set(relativeDestination, path.relative(root, sourcePath));
    await mkdir(path.dirname(destinationPath), { recursive: true });
    await copyFile(sourcePath, destinationPath);
  }
}

await rm(temporaryRoot, { recursive: true, force: true });

try {
  const publicDirectories = await findPublicDirectories(siteRoot);
  publicDirectories.sort((a, b) => a.localeCompare(b));

  if (publicDirectories.length === 0) {
    throw new Error("No public directories found under sites/kashiwa");
  }

  for (const publicDirectory of publicDirectories) {
    const projectDirectory = path.dirname(publicDirectory);
    const relativeProject = path.relative(siteRoot, projectDirectory);
    const isHomepage = relativeProject === "homepage";
    const isLegacyRoot = relativeProject === "";
    const destination = isHomepage ? temporaryRoot : path.join(temporaryRoot, relativeProject);
    const ignoredEntries = isLegacyRoot ? new Set(["index.html", "_app"]) : new Set();
    await copyDirectory(publicDirectory, destination, ignoredEntries);
    console.log(`${path.relative(root, publicDirectory)} -> ${path.relative(root, destination)}`);
  }

  await rm(outputRoot, { recursive: true, force: true });
  await rename(temporaryRoot, outputRoot);
  console.log(`Built ${copiedFiles.size} files in ${path.relative(root, outputRoot)}`);
} catch (error) {
  await rm(temporaryRoot, { recursive: true, force: true });
  throw error;
}
