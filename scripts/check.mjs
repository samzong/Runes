import { createHash } from "node:crypto";
import { access, readFile, readdir } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const webRoot = join(root, "public", "generated");
const artifactsRoot = join(root, "artifacts");
const data = JSON.parse(await readFile(join(root, "brand", "runes.json"), "utf8"));
const manifest = JSON.parse(await readFile(join(webRoot, "manifest.json"), "utf8"));
const entities = [data.master, ...data.projects];
const manifestEntities = [manifest.master, ...manifest.projects];
const expectedSvg = [
  "app-icon.svg",
  "badge.svg",
  "horizontal.svg",
  "mark-duotone.svg",
  "mark-inverse.svg",
  "mark.svg",
  "menubar.svg",
  "og.svg",
  "social-avatar.svg",
  "stacked.svg",
  "title-slide.svg",
  "x-header.svg",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function files(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await files(path)));
    else output.push(path);
  }
  return output;
}

async function assertRaster(path, width, height) {
  const metadata = await sharp(path).metadata();
  assert(metadata.width === width && metadata.height === height, `${relative(root, path)} is ${metadata.width}x${metadata.height}, expected ${width}x${height}`);
}

assert(entities.length === data.projects.length + 1, "System identity count does not match project count");
assert(manifestEntities.length === entities.length, "Manifest identity count does not match source data");

for (const entity of entities) {
  const directory = join(webRoot, entity.slug);
  const names = (await readdir(directory)).sort();
  assert(JSON.stringify(names) === JSON.stringify(expectedSvg), `${entity.slug} public SVG contract differs`);
  for (const name of names) {
    const source = await readFile(join(directory, name), "utf8");
    assert(source.startsWith("<svg"), `${entity.slug}/${name} is not an SVG`);
    assert(!source.includes("<text"), `${entity.slug}/${name} contains a font-dependent text node`);
    assert(!source.includes("undefined"), `${entity.slug}/${name} contains an unresolved value`);
  }

  await assertRaster(join(artifactsRoot, entity.slug, "social", "avatar-1024.png"), 1024, 1024);
  await assertRaster(join(artifactsRoot, entity.slug, "social", "open-graph-1200x630.png"), 1200, 630);
  await assertRaster(join(artifactsRoot, entity.slug, "presentation", "title-slide-1920x1080.png"), 1920, 1080);
  await access(join(artifactsRoot, entity.slug, "windows", "icon.ico"));
  if (process.platform === "darwin") await access(join(artifactsRoot, entity.slug, "apple", "app-icon.icns"));
}

const expectedSums = new Map(
  (await readFile(join(artifactsRoot, "SHA256SUMS"), "utf8"))
    .trim()
    .split("\n")
    .map((line) => [line.slice(66), line.slice(0, 64)]),
);
const artifactFiles = (await files(artifactsRoot)).filter((path) => !path.endsWith("SHA256SUMS"));
assert(expectedSums.size === artifactFiles.length, "Checksum manifest does not cover every artifact");
for (const path of artifactFiles) {
  const name = relative(artifactsRoot, path);
  const actual = createHash("sha256").update(await readFile(path)).digest("hex");
  assert(expectedSums.get(name) === actual, `Checksum mismatch: ${name}`);
}

process.stdout.write(`${JSON.stringify({ identities: entities.length, publicSvg: entities.length * expectedSvg.length, artifacts: artifactFiles.length, fontDependentTextNodes: 0 }, null, 2)}\n`);
