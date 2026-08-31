import { createHash } from "node:crypto";
import { access, readFile, readdir } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { unzipSync } from "fflate";
import sharp from "sharp";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const webRoot = join(root, "public", "generated");
const artifactsRoot = join(root, "artifacts");
const downloadsRoot = join(root, "public", "downloads");
const data = JSON.parse(await readFile(join(root, "brand", "runes.json"), "utf8"));
const manifest = JSON.parse(await readFile(join(webRoot, "manifest.json"), "utf8"));
const downloadManifest = JSON.parse(await readFile(join(downloadsRoot, "manifest.json"), "utf8"));
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
const expectedPackages = ["complete", "logo", "social", "apple", "windows", "web", "presentation"];

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
  const icns = await readFile(join(artifactsRoot, entity.slug, "apple", "app-icon.icns"));
  assert(icns.subarray(0, 4).toString() === "icns", `${entity.slug} ICNS header is invalid`);
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

assert(downloadManifest.identities.length === entities.length, "Download identity count differs");
for (const entity of entities) {
  const entry = downloadManifest.identities.find((candidate) => candidate.slug === entity.slug);
  assert(entry, `Download manifest is missing ${entity.slug}`);
  assert(
    JSON.stringify(Object.keys(entry.packages).sort()) === JSON.stringify(expectedPackages.toSorted()),
    `${entity.slug} download package contract differs`,
  );
  for (const [group, pack] of Object.entries(entry.packages)) {
    const source = join(root, "public", pack.path);
    const content = await readFile(source);
    assert(content.byteLength === pack.bytes, `${entity.slug}/${group} download size differs`);
    assert(
      createHash("sha256").update(content).digest("hex") === pack.sha256,
      `${entity.slug}/${group} download checksum differs`,
    );
    const entries = Object.keys(unzipSync(content));
    assert(entries.length === pack.files, `${entity.slug}/${group} download file count differs`);
    if (group === "complete") {
      assert(entries.includes(`${entity.slug}/apple/app-icon.icns`), `${entity.slug} complete pack lacks ICNS`);
      assert(entries.includes(`${entity.slug}/windows/icon.ico`), `${entity.slug} complete pack lacks ICO`);
    }
  }
}

const familyContent = await readFile(join(root, "public", downloadManifest.family.path));
assert(familyContent.byteLength === downloadManifest.family.bytes, "Family download size differs");
assert(
  createHash("sha256").update(familyContent).digest("hex") === downloadManifest.family.sha256,
  "Family download checksum differs",
);
assert(
  Object.keys(unzipSync(familyContent)).length === downloadManifest.family.files,
  "Family download file count differs",
);

process.stdout.write(`${JSON.stringify({ identities: entities.length, publicSvg: entities.length * expectedSvg.length, artifacts: artifactFiles.length, downloadPackages: entities.length * expectedPackages.length + 1, fontDependentTextNodes: 0 }, null, 2)}\n`);
