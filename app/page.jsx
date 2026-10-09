import fs from "node:fs";
import path from "node:path";
import projects from "@/projects.json";
import Directory from "./Directory";

const LOGO_DIR = path.join(process.cwd(), "public", "logos");
const LOGO_EXTS = ["svg", "png", "webp", "jpg", "jpeg"];

function slugify(name) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function findLogo(project) {
  if (project.logo) return project.logo;
  const slug = slugify(project.name);
  const ext = LOGO_EXTS.find((e) =>
    fs.existsSync(path.join(LOGO_DIR, `${slug}.${e}`)),
  );
  return ext ? `/logos/${slug}.${ext}` : null;
}

const SMALL_WORDS = new Set([
  "of",
  "the",
  "and",
  "de",
  "du",
  "des",
  "la",
  "le",
  "les",
  "et",
]);

function initials(name) {
  const all = name
    .replace(/'s\b/g, "")
    .split(/\s+/)
    .filter((w) => /^[a-z0-9]/i.test(w));
  const big = all.filter((w) => !SMALL_WORDS.has(w.toLowerCase()));
  const words = big.length > 0 ? big : all;
  const letters =
    words.length > 1 ? words[0][0] + words[1][0] : words[0].slice(0, 2);
  return letters.toUpperCase();
}

// Rough server-side guess of the width Directory measures on the client
// (widest name, or narrowest two-line width of the widest description), so
// the grid ships with the right column count instead of reflowing on load.
const NAME_PX_PER_CHAR = 8.7;
const DESC_PX_PER_CHAR = 7.5;
const NAME_ARROW_ROOM = 22;
const MAX_TEXT_WIDTH = 320; // keep in sync with Directory.jsx

function estimateTextWidth(projects) {
  let width = 0;
  for (const p of projects) {
    width = Math.max(width, p.name.length * NAME_PX_PER_CHAR + NAME_ARROW_ROOM);
    if (p.desc) {
      width = Math.max(width, Math.ceil(p.desc.length / 2) * DESC_PX_PER_CHAR);
    }
  }
  return Math.min(Math.ceil(width), MAX_TEXT_WIDTH);
}

function host(url) {
  const u = new URL(url);
  return (u.hostname.replace(/^www\./, "") + u.pathname).replace(/\/$/, "");
}

export default function Home() {
  const items = projects.map((project) => ({
    name: project.name,
    url: project.url,
    desc: project.desc ?? "",
    host: host(project.url),
    initials: initials(project.name),
    logo: findLogo(project),
  }));

  return (
    <Directory projects={items} initialTextWidth={estimateTextWidth(projects)}>
      <section className="hero">
        <h1>
          Mes projets perso, hébergés <span>quelque part</span>.
        </h1>
        <p className="count">
          {items.length} {items.length > 1 ? "projets" : "projet"} en ligne
        </p>
      </section>
    </Directory>
  );
}
