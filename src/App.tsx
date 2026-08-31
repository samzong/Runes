import { useMemo, useState } from "react";
import { ArrowDownToLine, GitFork } from "lucide-react";

import { Button } from "@/components/ui/button";
import data from "@/brand/runes.json";

const identities = [data.master, ...data.projects];
const categories = [
  ["all", "All"],
  ["system", "System"],
  ["core", "Core"],
  ["mac", "Mac"],
  ["dev", "Developer"],
  ["infra", "Infrastructure"],
] as const;
const variants = [
  ["mark.svg", "Mono"],
  ["mark-duotone.svg", "Duotone"],
  ["badge.svg", "Field"],
  ["app-icon.svg", "App"],
  ["menubar.svg", "Menu bar"],
] as const;
const sizes = [16, 32, 64, 128] as const;
const downloadGroups = [
  ["logo", "Logo suite", "Mono · inverse · duotone · lockups"],
  ["social", "Social", "Avatar · Open Graph · X header"],
  ["apple", "Apple", "App · Dock · menu bar · ICNS"],
  ["windows", "Windows", "ICO · five exact PNG sizes"],
  ["web", "Web", "SVG · favicon · touch · PWA"],
  ["presentation", "Presentation", "1920×1080 title artwork"],
] as const;
const artifactCount = identities.length * 38 + 1;

export default function App() {
  const [selectedSlug, setSelectedSlug] = useState("runes");
  const [variant, setVariant] = useState<(typeof variants)[number][0]>("badge.svg");
  const [filter, setFilter] = useState<(typeof categories)[number][0]>("all");
  const [size, setSize] = useState<(typeof sizes)[number]>(64);
  const selected = identities.find((identity) => identity.slug === selectedSlug) ?? data.master;
  const filtered = useMemo(
    () => identities.filter((identity) => filter === "all" || identity.category === filter),
    [filter],
  );
  const asset = `/generated/${selected.slug}/${variant}`;
  const variantLabel = variants.find(([value]) => value === variant)?.[1] ?? "SVG";
  const downloadPackage = (group: string) =>
    `/downloads/${selected.slug}/${selected.slug}-${group}.zip`;

  return (
    <main>
      <header className="topbar">
        <a className="brand-link" href="#top" aria-label="Runes home">
          <img src="/generated/runes/mark-inverse.svg" alt="" width={28} height={28} />
          <strong>RUNES</strong>
        </a>
        <a className="topbar-note" href="#downloads">DOWNLOAD ASSETS</a>
        <a className="github-link" href="https://github.com/samzong/Runes" target="_blank" rel="noreferrer">
          <GitFork aria-hidden="true" />
          GitHub
        </a>
      </header>

      <section className="workbench" id="top">
        <div className="workbench-copy">
          <span className="eyebrow">ONE AUTHOR / {data.projects.length} PROJECTS / EVERY SURFACE</span>
          <h1>One alphabet.<br />Every surface.</h1>
          <p>
            Runes turns a 7×7 project character into social avatars, transparent marks, app icons,
            menu bar templates, favicons, Windows resources, presentation covers, and website themes.
          </p>
          <div className="system-stats" aria-label="System statistics">
            <span><strong>{identities.length}</strong> identities</span>
            <span><strong>{artifactCount.toLocaleString("en-US")}</strong> generated artifacts</span>
            <span><strong>7×7</strong> source grid</span>
          </div>
        </div>

        <div className="specimen-panel">
          <div className="panel-label"><span>LIVE SPECIMEN</span><span>{selected.name}</span></div>
          <div className={`specimen-stage variant-${variant.replace(".svg", "")}`}>
            <img src={asset} alt={`${selected.name} ${variant.replace(".svg", "")} preview`} width={size} height={size} />
          </div>
          <div className="control-group" aria-label="Logo variant">
            {variants.map(([value, label]) => (
              <Button key={value} variant={variant === value ? "default" : "outline"} size="lg" aria-pressed={variant === value} onClick={() => setVariant(value)}>
                {label}
              </Button>
            ))}
          </div>
          <div className="size-row">
            <span>SIZE TEST</span>
            <div className="control-group" aria-label="Preview size">
              {sizes.map((value) => (
                <Button key={value} variant={size === value ? "default" : "ghost"} size="sm" aria-pressed={size === value} onClick={() => setSize(value)}>
                  {value}px
                </Button>
              ))}
            </div>
            <a className="download-link" href={asset} download>
              <ArrowDownToLine aria-hidden="true" /> SVG
            </a>
          </div>
        </div>
      </section>

      <section className="surface-strip" aria-label={`${selected.name} platform previews`}>
        <article className="surface social-surface">
          <span>GITHUB / X</span>
          <div className="avatar-mask"><img src={`/generated/${selected.slug}/social-avatar.svg`} alt="" width={1024} height={1024} /></div>
        </article>
        <article className="surface dock-surface">
          <span>DOCK / IOS</span>
          <div className="app-mask"><img src={`/generated/${selected.slug}/app-icon.svg`} alt="" width={1024} height={1024} /></div>
        </article>
        <article className="surface menu-surface">
          <span>MACOS MENU BAR</span>
          <div className="fake-menubar"><i /><i /><i /><img src={`/generated/${selected.slug}/menubar.svg`} alt="" width={16} height={16} /></div>
        </article>
        <article className="surface browser-surface">
          <span>BROWSER</span>
          <div className="fake-browser"><img src={`/generated/${selected.slug}/app-icon.svg`} alt="" width={18} height={18} /><b>runes.dev</b></div>
        </article>
        <article className="surface deck-surface">
          <span>PRESENTATION</span>
          <img src={`/generated/${selected.slug}/title-slide.svg`} alt="" width={1920} height={1080} />
        </article>
      </section>

      <section className="downloads" id="downloads">
        <div className="download-heading">
          <div>
            <span className="eyebrow">ASSET DEPOT / {selected.name}</span>
            <h2>Take the system.</h2>
          </div>
          <p>
            Download one working file, a platform-specific pack, the complete identity, or the
            entire Runes family. Every archive is generated from the same 7×7 source.
          </p>
        </div>
        <div className="download-primary">
          <a className="download-action current" href={asset} download>
            <span>CURRENT SVG</span>
            <ArrowDownToLine aria-hidden="true" />
            <strong>{selected.name} / {variantLabel}</strong>
            <small>Editable vector · transparent where applicable</small>
          </a>
          <a className="download-action complete" href={downloadPackage("complete")} download>
            <span>THIS RUNE</span>
            <ArrowDownToLine aria-hidden="true" />
            <strong>{selected.name} complete pack</strong>
            <small>38 assets · SVG · PNG · ICO · ICNS</small>
          </a>
          <a className="download-action family" href="/downloads/runes-complete.zip" download>
            <span>THE WHOLE FAMILY</span>
            <ArrowDownToLine aria-hidden="true" />
            <strong>All {identities.length} Runes</strong>
            <small>{artifactCount.toLocaleString("en-US")} production assets · ZIP</small>
          </a>
        </div>
        <div className="download-platforms" aria-label={`${selected.name} platform downloads`}>
          {downloadGroups.map(([group, label, detail]) => (
            <a key={group} className="download-platform" href={downloadPackage(group)} download>
              <span>{label}</span>
              <ArrowDownToLine aria-hidden="true" />
              <small>{detail}</small>
            </a>
          ))}
        </div>
      </section>

      <section className="catalog" id="catalog">
        <div className="section-heading">
          <div>
            <span className="eyebrow dark">THE PERSONAL ALPHABET</span>
            <h2>{identities.length} identities.<br />One construction.</h2>
          </div>
          <p>Select any Rune to inspect it across real product surfaces. Color is an application layer; the canonical identity remains black or white.</p>
        </div>
        <div className="filter-row" aria-label="Filter identities">
          {categories.map(([value, label]) => (
            <Button key={value} variant={filter === value ? "default" : "outline"} size="lg" aria-pressed={filter === value} onClick={() => setFilter(value)}>
              {label}
            </Button>
          ))}
        </div>
        <article className="rune-inspector">
          <div>
            <span className="eyebrow dark">DESIGN REASON / {selected.category}</span>
            <h3>{selected.name}</h3>
          </div>
          <p>{selected.rationale}</p>
          <a href={selected.source} target="_blank" rel="noreferrer">PROJECT SOURCE</a>
        </article>
        <div className="rune-grid">
          {filtered.map((identity, index) => (
            <button className={`rune-card ${selected.slug === identity.slug ? "selected" : ""}`} key={identity.slug} type="button" onClick={() => setSelectedSlug(identity.slug)}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <img src={`/generated/${identity.slug}/mark-duotone.svg`} alt={`${identity.name} Rune`} width={64} height={64} />
              <div><strong>{identity.name}</strong><small>{identity.tagline}</small></div>
            </button>
          ))}
        </div>
      </section>

      <section className="contracts">
        <div className="section-heading compact">
          <div><span className="eyebrow dark">OUTPUT CONTRACT</span><h2>Designed once.<br />Shipped correctly.</h2></div>
          <p>Platform assets are generated from the same source geometry with explicit safe areas, masks, color roles, and deterministic filenames.</p>
        </div>
        <div className="contract-grid">
          {[
            ["Social", "1024 avatar · 1200×630 OG · 1500×500 X header", "Field color with a centered, circle-safe Rune."],
            ["Apple apps", "1024 square source · ICNS · Dock PNG", "Unmasked square layers; Apple applies the rounded system mask."],
            ["Menu bar", "16px + 32px @2x template PNG · SVG", "Black plus alpha only, ready for NSImage template rendering."],
            ["Windows", "ICO with 16 · 24 · 32 · 48 · 256", "Exact target sizes reduce shell and taskbar resampling."],
            ["Web", "SVG · 16/32 favicon · 180 touch · 192/512 PWA", "Transparent and field-backed variants are both included."],
            ["Presentation", "1920×1080 title slide · vector lockups", "A branded field, outlined wordmark, and export-safe composition."],
          ].map(([title, output, note], index) => (
            <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><strong>{output}</strong><p>{note}</p></article>
          ))}
        </div>
      </section>

      <section className="palette-section">
        <div><span className="eyebrow">COLOR IS CONTEXT</span><h2>The Rune stays.<br />The field can move.</h2></div>
        <div className="swatches">
          {[
            ["INK", "#0A0A09"],
            ["PAPER", "#F2F0E9"],
            ["FIELD BLUE", "#225CFF"],
            ["SIGNAL ACID", "#D8FF38"],
            ["SIGNAL ORANGE", "#FF5A36"],
            ["ELECTRIC VIOLET", "#7B61FF"],
          ].map(([label, color]) => <div key={label} style={{ background: color }} className={label === "INK" || label.includes("BLUE") || label.includes("VIOLET") ? "light-label" : ""}><strong>{label}</strong><span>{color}</span></div>)}
        </div>
      </section>

      <footer><img src="/generated/runes/mark.svg" alt="" width={28} height={28} /><strong>RUNES</strong><span>AN OPEN-SOURCE PERSONAL IDENTITY SYSTEM BY SAMZONG</span><a href="https://github.com/samzong/Runes">SOURCE</a></footer>
    </main>
  );
}
