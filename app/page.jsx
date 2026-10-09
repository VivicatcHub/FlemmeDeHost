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

function initials(name) {
  const words = name
    .replace(/'s\b/g, "")
    .split(/\s+/)
    .filter((w) => /^[a-z0-9]/i.test(w));
  const letters =
    words.length > 1 ? words[0][0] + words[1][0] : words[0].slice(0, 2);
  return letters.toUpperCase();
}

function host(url) {
  const u = new URL(url);
  return (u.hostname + u.pathname).replace(/\/$/, "");
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
    <Directory projects={items}>
      <section className="hero">
        <p className="count">{items.length} projets en ligne</p>
        <h1>
          Mes projets perso, hébergés <span>quelque part</span>.
        </h1>
        <p className="lead">
          L'annuaire de tout ce que j'ai codé puis mis en ligne. Un clic, et
          vous y êtes.
        </p>
      </section>
    </Directory>
  );
}
