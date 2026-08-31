import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { zipSync } from "fflate";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const artifactsRoot = join(root, "artifacts");
const downloadsRoot = join(root, "public", "downloads");
const data = JSON.parse(await readFile(join(root, "brand", "runes.json"), "utf8"));
const entities = [data.master, ...data.projects];
const fixedTime = new Date("2000-01-01T00:00:00.000Z");
const groups = ["logo", "social", "apple", "windows", "web", "presentation"];

function archivePath(from, to) {
  return relative(from, to).split(sep).join("/");
}

async function files(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await files(path)));
    else output.push(path);
  }
  return output.sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));
}

async function archive(entries) {
  const input = {};
  for (const [name, source] of entries) {
    input[name] = [await readFile(source), { mtime: fixedTime }];
  }
  return zipSync(input, { level: 9, mtime: fixedTime });
}

async function writePackage(directory, filename, entries) {
  const output = await archive(entries);
  const destination = join(directory, filename);
  await writeFile(destination, output);
  return {
    path: `/${archivePath(join(root, "public"), destination)}`,
    bytes: output.byteLength,
    files: entries.length,
    sha256: createHash("sha256").update(output).digest("hex"),
  };
}

await rm(downloadsRoot, { recursive: true, force: true });
await mkdir(downloadsRoot, { recursive: true });

const identities = [];
for (const entity of entities) {
  const sourceRoot = join(artifactsRoot, entity.slug);
  const destination = join(downloadsRoot, entity.slug);
  await mkdir(destination, { recursive: true });
  const sourceFiles = await files(sourceRoot);
  const completeEntries = sourceFiles.map((source) => [
    `${entity.slug}/${archivePath(sourceRoot, source)}`,
    source,
  ]);
  const packages = {
    complete: await writePackage(destination, `${entity.slug}-complete.zip`, completeEntries),
  };
  for (const group of groups) {
    const groupRoot = join(sourceRoot, group);
    const groupFiles = await files(groupRoot);
    const entries = groupFiles.map((source) => [
      `${entity.slug}/${group}/${archivePath(groupRoot, source)}`,
      source,
    ]);
    packages[group] = await writePackage(destination, `${entity.slug}-${group}.zip`, entries);
  }
  identities.push({ slug: entity.slug, packages });
}

const familySources = await files(artifactsRoot);
const familyEntries = familySources.map((source) => [
  `Runes/${archivePath(artifactsRoot, source)}`,
  source,
]);
const family = await writePackage(downloadsRoot, "runes-complete.zip", familyEntries);
const manifest = {
  system: data.system,
  version: data.version,
  family,
  identities,
};
await writeFile(join(downloadsRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

const downloadFiles = await files(downloadsRoot);
const totalBytes = (
  await Promise.all(downloadFiles.map(async (path) => (await stat(path)).size))
).reduce((sum, size) => sum + size, 0);
process.stdout.write(`${JSON.stringify({ packages: identities.length * 7 + 1, files: downloadFiles.length, totalBytes }, null, 2)}\n`);
