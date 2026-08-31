import { createHash } from "node:crypto";
import {
  access,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { IconIcns } from "@shockpkg/icon-encoder";
import { openSync } from "fontkit";
import pngToIco from "png-to-ico";
import sharp from "sharp";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const webRoot = join(root, "public", "generated");
const artifactsRoot = join(root, "artifacts");
const data = JSON.parse(await readFile(join(root, "brand", "runes.json"), "utf8"));
const tokens = JSON.parse(await readFile(join(root, "brand", "tokens.json"), "utf8"));
const font = openSync(
  join(root, "node_modules", "@fontsource", "ubuntu-mono", "files", "ubuntu-mono-latin-700-normal.woff2"),
);
const entities = [data.master, ...data.projects];

const xml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const signalSet = (project) => new Set(project.signal.map(([x, y]) => `${x},${y}`));

function gridPath(project, mode = "all") {
  const signal = signalSet(project);
  return project.grid
    .flatMap((row, y) =>
      [...row].flatMap((cell, x) => {
        if (cell !== "1") return [];
        const isSignal = signal.has(`${x},${y}`);
        if (mode === "signal" && !isSignal) return [];
        if (mode === "primary" && isSignal) return [];
        return [`M${4 + x * 8} ${4 + y * 8}h8v8h-8Z`];
      }),
    )
    .join("");
}

function markBody(project, primary, signal = primary) {
  if (primary === signal) return `<path fill="${primary}" d="${gridPath(project)}"/>`;
  return `<path fill="${primary}" d="${gridPath(project, "primary")}"/><path fill="${signal}" d="${gridPath(project, "signal")}"/>`;
}

function svg(width, height, body, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${xml(label)}">${body}</svg>\n`;
}

function wordmark(name) {
  const run = font.layout(name);
  let pen = 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const glyphs = run.glyphs.map((glyph, index) => {
    const position = run.positions[index];
    const x = pen + position.xOffset;
    const y = position.yOffset;
    const box = glyph.path.bbox;
    minX = Math.min(minX, x + box.minX);
    minY = Math.min(minY, y + box.minY);
    maxX = Math.max(maxX, x + box.maxX);
    maxY = Math.max(maxY, y + box.maxY);
    pen += position.xAdvance;
    return { glyph, x, y };
  });
  const inner = glyphs
    .map(
      ({ glyph, x, y }) =>
        `<path transform="translate(${(x - minX).toFixed(3)} ${(maxY + y).toFixed(3)}) scale(1 -1)" d="${glyph.path.toSVG()}"/>`,
    )
    .join("");
  return { width: maxX - minX, height: maxY - minY, inner };
}

function markSvg(project, primary, signal = primary) {
  return svg(64, 64, markBody(project, primary, signal), `${project.name} Rune`);
}

function horizontalSvg(project, word, ink) {
  const wordHeight = 32;
  const scale = wordHeight / word.height;
  const width = 80 + word.width * scale;
  const y = (64 - wordHeight) / 2;
  const body = `${markBody(project, ink)}<g fill="${ink}" transform="translate(80 ${y.toFixed(3)}) scale(${scale.toFixed(6)})">${word.inner}</g>`;
  return svg(Number(width.toFixed(3)), 64, body, `${project.name} horizontal lockup`);
}

function stackedSvg(project, word, ink) {
  const scale = Math.min(28 / word.height, 220 / word.width);
  const wordWidth = word.width * scale;
  const wordHeight = word.height * scale;
  const width = Math.max(64, wordWidth);
  const height = 80 + wordHeight;
  const body = `<g transform="translate(${((width - 64) / 2).toFixed(3)} 0)">${markBody(project, ink)}</g><g fill="${ink}" transform="translate(${((width - wordWidth) / 2).toFixed(3)} 80) scale(${scale.toFixed(6)})">${word.inner}</g>`;
  return svg(Number(width.toFixed(3)), Number(height.toFixed(3)), body, `${project.name} stacked lockup`);
}

function fieldSignal(accent) {
  return accent === "acid" ? tokens.color.blue : tokens.color.acid;
}

function squareFieldSvg(project, size, label) {
  const accent = tokens.color[project.accent];
  const scale = size / 102.4;
  const inset = (size - 64 * scale) / 2;
  const body = `<rect width="${size}" height="${size}" fill="${accent}"/><g transform="translate(${inset} ${inset}) scale(${scale})">${markBody(project, tokens.color.ink, fieldSignal(project.accent))}</g>`;
  return svg(size, size, body, label);
}

function wideFieldSvg(project, word, width, height, label) {
  const accent = tokens.color[project.accent];
  const markScale = height / 110;
  const markSize = 64 * markScale;
  const markX = height * 0.12;
  const markY = (height - markSize) / 2;
  const wordScale = Math.min((height * 0.2) / word.height, (width - markX - markSize - height * 0.22) / word.width);
  const wordX = markX + markSize + height * 0.1;
  const wordY = (height - word.height * wordScale) / 2;
  const rails = Array.from({ length: 7 }, (_, index) => `<rect x="${width - 42 - index * 18}" y="0" width="1" height="${height}" fill="${tokens.color.ink}" opacity=".12"/>`).join("");
  const body = `<rect width="${width}" height="${height}" fill="${accent}"/>${rails}<g transform="translate(${markX} ${markY}) scale(${markScale})">${markBody(project, tokens.color.ink, fieldSignal(project.accent))}</g><g fill="${tokens.color.ink}" transform="translate(${wordX} ${wordY}) scale(${wordScale})">${word.inner}</g>`;
  return svg(width, height, body, label);
}

async function render(source, destination, width, height = width) {
  await sharp(Buffer.from(source)).resize(width, height, { fit: "fill" }).png({ compressionLevel: 9 }).toFile(destination);
}

async function writeSvg(directory, name, source) {
  await writeFile(join(directory, name), source);
}

async function buildProject(project) {
  const word = wordmark(project.name);
  const accent = tokens.color[project.accent];
  const publicDir = join(webRoot, project.slug);
  const artifactDir = join(artifactsRoot, project.slug);
  const logoDir = join(artifactDir, "logo");
  const socialDir = join(artifactDir, "social");
  const webDir = join(artifactDir, "web");
  const appleDir = join(artifactDir, "apple");
  const menuDir = join(appleDir, "menubar");
  const iconsetDir = join(appleDir, "Runes.iconset");
  const windowsDir = join(artifactDir, "windows");
  const presentationDir = join(artifactDir, "presentation");
  await Promise.all([publicDir, logoDir, socialDir, webDir, appleDir, menuDir, iconsetDir, windowsDir, presentationDir].map((directory) => mkdir(directory, { recursive: true })));

  const sources = {
    "mark.svg": markSvg(project, tokens.color.ink),
    "mark-inverse.svg": markSvg(project, tokens.color.white),
    "mark-duotone.svg": markSvg(project, tokens.color.ink, accent),
    "horizontal.svg": horizontalSvg(project, word, tokens.color.ink),
    "stacked.svg": stackedSvg(project, word, tokens.color.ink),
    "badge.svg": squareFieldSvg(project, 1024, `${project.name} field badge`),
    "app-icon.svg": squareFieldSvg(project, 1024, `${project.name} app icon source`),
    "social-avatar.svg": squareFieldSvg(project, 1024, `${project.name} social avatar`),
    "menubar.svg": markSvg(project, "#000000"),
    "og.svg": wideFieldSvg(project, word, 1200, 630, `${project.name} Open Graph image`),
    "x-header.svg": wideFieldSvg(project, word, 1500, 500, `${project.name} X header`),
    "title-slide.svg": wideFieldSvg(project, word, 1920, 1080, `${project.name} presentation title slide`),
  };

  for (const [name, source] of Object.entries(sources)) await writeSvg(publicDir, name, source);
  for (const name of ["mark.svg", "mark-inverse.svg", "mark-duotone.svg", "horizontal.svg", "stacked.svg", "badge.svg"]) await writeSvg(logoDir, name, sources[name]);

  await Promise.all([
    render(sources["social-avatar.svg"], join(socialDir, "avatar-1024.png"), 1024),
    render(sources["og.svg"], join(socialDir, "open-graph-1200x630.png"), 1200, 630),
    render(sources["x-header.svg"], join(socialDir, "x-header-1500x500.png"), 1500, 500),
    render(sources["app-icon.svg"], join(appleDir, "app-icon-1024.png"), 1024),
    render(sources["app-icon.svg"], join(appleDir, "dock-icon-1024.png"), 1024),
    render(sources["title-slide.svg"], join(presentationDir, "title-slide-1920x1080.png"), 1920, 1080),
    render(sources["menubar.svg"], join(menuDir, `${project.name}Template.png`), 16),
    render(sources["menubar.svg"], join(menuDir, `${project.name}Template@2x.png`), 32),
    render(sources["app-icon.svg"], join(webDir, "apple-touch-icon-180.png"), 180),
    render(sources["app-icon.svg"], join(webDir, "pwa-192.png"), 192),
    render(sources["app-icon.svg"], join(webDir, "pwa-512.png"), 512),
    render(sources["app-icon.svg"], join(webDir, "favicon-16.png"), 16),
    render(sources["app-icon.svg"], join(webDir, "favicon-32.png"), 32),
  ]);
  await writeSvg(webDir, "favicon.svg", sources["app-icon.svg"]);
  await writeSvg(webDir, "favicon-transparent.svg", sources["mark.svg"]);

  const windowsSizes = [16, 24, 32, 48, 256];
  const windowsFiles = [];
  for (const size of windowsSizes) {
    const destination = join(windowsDir, `icon-${size}.png`);
    await render(sources["app-icon.svg"], destination, size);
    windowsFiles.push(destination);
  }
  await writeFile(join(windowsDir, "icon.ico"), await pngToIco(windowsFiles));

  const iconset = [
    [16, "icon_16x16.png"],
    [32, "icon_16x16@2x.png"],
    [32, "icon_32x32.png"],
    [64, "icon_32x32@2x.png"],
    [128, "icon_128x128.png"],
    [256, "icon_128x128@2x.png"],
    [256, "icon_256x256.png"],
    [512, "icon_256x256@2x.png"],
    [512, "icon_512x512.png"],
    [1024, "icon_512x512@2x.png"],
  ];
  for (const [size, name] of iconset) await render(sources["app-icon.svg"], join(iconsetDir, name), size);

  const icns = new IconIcns();
  icns.toc = true;
  const icnsSources = [
    ["icon_32x32@2x.png", "ic12"],
    ["icon_128x128.png", "ic07"],
    ["icon_128x128@2x.png", "ic13"],
    ["icon_256x256.png", "ic08"],
    ["icon_16x16.png", "ic04"],
    ["icon_256x256@2x.png", "ic14"],
    ["icon_512x512.png", "ic09"],
    ["icon_32x32.png", "ic05"],
    ["icon_512x512@2x.png", "ic10"],
    ["icon_16x16@2x.png", "ic11"],
  ];
  for (const [name, type] of icnsSources) {
    await icns.addFromPng(await readFile(join(iconsetDir, name)), [type], true);
  }
  await writeFile(join(appleDir, "app-icon.icns"), icns.encode());

  return {
    slug: project.slug,
    name: project.name,
    category: project.category,
    accent: project.accent,
    source: project.source,
    files: { public: Object.keys(sources), icns: "macos", windows: windowsSizes },
  };
}

function validate() {
  const slugs = new Set();
  const grids = new Set();
  for (const project of entities) {
    if (slugs.has(project.slug)) throw new Error(`Duplicate slug: ${project.slug}`);
    slugs.add(project.slug);
    if (project.grid.length !== 7 || project.grid.some((row) => !/^[01]{7}$/.test(row))) throw new Error(`Invalid grid: ${project.slug}`);
    const signature = project.grid.join("");
    if (grids.has(signature)) throw new Error(`Duplicate Rune: ${project.slug}`);
    grids.add(signature);
    if (!tokens.color[project.accent]) throw new Error(`Unknown accent: ${project.slug}`);
    for (const [x, y] of project.signal) if (project.grid[y]?.[x] !== "1") throw new Error(`Signal outside Rune: ${project.slug} ${x},${y}`);
  }
}

validate();
await Promise.all([rm(webRoot, { recursive: true, force: true }), rm(artifactsRoot, { recursive: true, force: true })]);
await Promise.all([mkdir(webRoot, { recursive: true }), mkdir(artifactsRoot, { recursive: true })]);
const manifest = [];
for (const project of entities) manifest.push(await buildProject(project));
const manifestText = `${JSON.stringify({ system: data.system, version: data.version, master: manifest[0], projects: manifest.slice(1) }, null, 2)}\n`;
await Promise.all([
  writeFile(join(webRoot, "manifest.json"), manifestText),
  writeFile(join(artifactsRoot, "manifest.json"), manifestText),
  writeFile(join(root, "public", "favicon.svg"), await readFile(join(webRoot, "runes", "app-icon.svg"))),
  writeFile(join(root, "public", "og.svg"), await readFile(join(webRoot, "runes", "og.svg"))),
]);

const files = async (directory) => {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await files(path)));
    else output.push(path);
  }
  return output;
};
const sums = [];
for (const path of (await files(artifactsRoot)).sort()) {
  if (path.endsWith("SHA256SUMS")) continue;
  const hash = createHash("sha256").update(await readFile(path)).digest("hex");
  sums.push(`${hash}  ${relative(artifactsRoot, path)}`);
}
await writeFile(join(artifactsRoot, "SHA256SUMS"), `${sums.join("\n")}\n`);
await access(join(webRoot, "recall", "mark.svg"));
process.stdout.write(`${JSON.stringify({ identities: manifest.length, projects: data.projects.length, publicAssets: manifest.length * 12, artifacts: sums.length, output: artifactsRoot }, null, 2)}\n`);
