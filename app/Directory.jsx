"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Logo from "./Logo";

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      className="arrow"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

// A single very long name or description must not force every card wide.
const MAX_TEXT_WIDTH = 320;

function fold(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/ß/g, "ss")
    .replace(/['’]/g, "");
}

function words(text) {
  return fold(text)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

// The platform domain (vercel.app, github.io…) is shared by almost every
// project, so only the first label and the path are worth matching.
function hostKeywords(host) {
  const [domain, ...path] = host.split("/");
  return [domain.split(".")[0], ...path].join(" ");
}

function searchIndex(project) {
  const text = words(
    `${project.name} ${project.desc} ${hostKeywords(project.host)}`,
  );
  return { text: text.join(" "), squashed: text.join("") };
}

// Every typed word must appear somewhere, in any order ("order mcu");
// failing that, compare with all spacing removed ("todo" → "To Do").
function matches(index, terms) {
  return (
    terms.every((t) => index.text.includes(t)) ||
    index.squashed.includes(terms.join(""))
  );
}

function isTyping(el) {
  return (
    el instanceof HTMLElement &&
    (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))
  );
}

function measureTextWidth(box) {
  let width = 0;
  for (const name of box.querySelectorAll(".name")) {
    width = Math.max(width, name.scrollWidth);
  }
  for (const desc of box.querySelectorAll(".desc")) {
    desc.style.width = "max-content";
    const full = Math.ceil(desc.getBoundingClientRect().width);
    const twoLines = 2 * parseFloat(getComputedStyle(desc).lineHeight) + 1;
    let lo = Math.ceil(full / 2);
    let hi = full;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      desc.style.width = `${mid}px`;
      if (desc.offsetHeight <= twoLines) hi = mid;
      else lo = mid + 1;
    }
    width = Math.max(width, lo);
  }
  return Math.min(Math.ceil(width) + 1, MAX_TEXT_WIDTH);
}

export default function Directory({ projects, initialTextWidth, children }) {
  const [query, setQuery] = useState("");
  const [textWidth, setTextWidth] = useState(null);
  const [launching, setLaunching] = useState(null);
  const [brokenLogos, setBrokenLogos] = useState(() => new Set());
  const measureRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      const slash = e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey;
      const cmdK = e.key === "k" && (e.ctrlKey || e.metaKey);
      if ((slash && !isTyping(e.target)) || cmdK) {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const reset = () => setLaunching(null);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  const launch = (e, url) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return;
    setLaunching(url);
  };

  useEffect(() => {
    let alive = true;
    const fit = () =>
      alive && setTextWidth(measureTextWidth(measureRef.current));
    fit();
    document.fonts?.ready.then(fit);
    return () => {
      alive = false;
    };
  }, [projects]);

  const indexes = useMemo(() => projects.map(searchIndex), [projects]);
  const terms = words(query);
  const searching = terms.length > 0;
  const shown = searching
    ? projects.filter((_, i) => matches(indexes[i], terms))
    : projects;

  const clearSearch = () => {
    setQuery("");
    searchRef.current?.focus();
  };

  const openFirst = (e) => {
    e.preventDefault();
    if (!searching || shown.length === 0) return;
    setLaunching(shown[0].url);
    window.location.assign(shown[0].url);
  };

  const listRef = useRef(null);
  const cards = () => [...(listRef.current?.querySelectorAll(".card") ?? [])];

  const onSearchKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      cards()[0]?.focus();
    } else if (e.key === "Escape") {
      if (query) setQuery("");
      else e.currentTarget.blur();
    }
  };

  // Arrow keys walk the cards in reading order; Up from the first one
  // returns to the search field.
  const onListKey = (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const list = cards();
    const i = list.indexOf(document.activeElement);
    if (i === -1) return;
    e.preventDefault();
    const next = i + (e.key === "ArrowDown" ? 1 : -1);
    if (next < 0) searchRef.current?.focus();
    else list[Math.min(next, list.length - 1)].focus();
  };

  return (
    <main className="home">
      <header className="top">
        <a className="brand" href="/">
          <Logo size={44} />
          Flemme de Host
        </a>
        <form className="search" role="search" onSubmit={openFirst}>
          <SearchIcon />
          <label htmlFor="project-search" className="sr-only">
            Rechercher un projet
          </label>
          <input
            id="project-search"
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onSearchKey}
            placeholder="Rechercher un projet…"
            autoComplete="off"
            enterKeyHint="go"
            aria-describedby="search-status"
          />
          {searching ? (
            <>
              <span className="search-count mono" aria-hidden="true">
                {shown.length}/{projects.length}
              </span>
              {shown.length > 0 && (
                <kbd className="search-enter mono" aria-hidden="true">
                  ↵
                </kbd>
              )}
              <button
                type="button"
                className="search-clear"
                onClick={clearSearch}
                aria-label="Effacer la recherche"
              >
                <ClearIcon />
              </button>
            </>
          ) : (
            <kbd className="search-key mono" aria-hidden="true">
              /
            </kbd>
          )}
        </form>
      </header>

      <p id="search-status" className="sr-only" aria-live="polite">
        {searching
          ? shown.length === 0
            ? "Aucun projet trouvé."
            : `${shown.length} ${shown.length > 1 ? "projets" : "projet"} sur ${projects.length}. Entrée ouvre ${shown[0].name}.`
          : ""}
      </p>

      {children}

      <h2 className="sr-only">Projets</h2>

      {shown.length > 0 ? (
        <ul
          ref={listRef}
          onKeyDown={onListKey}
          className="projects"
          style={{ "--text-width": `${textWidth ?? initialTextWidth}px` }}
        >
          {shown.map((project, i) => (
            <li key={project.url}>
              <a
                className="card"
                href={project.url}
                data-launching={launching === project.url || undefined}
                data-target={(searching && i === 0) || undefined}
                onClick={(e) => launch(e, project.url)}
              >
                <span className="tile-wrap">
                  <span className="halo" aria-hidden="true" />
                  <span className="tile">
                    {project.logo && !brokenLogos.has(project.url) ? (
                      <img
                        src={project.logo}
                        alt=""
                        onError={() =>
                          setBrokenLogos((s) => new Set(s).add(project.url))
                        }
                      />
                    ) : (
                      project.initials
                    )}
                  </span>
                </span>
                <span className="text">
                  <span className="name">{project.name}</span>
                  {project.desc && <span className="desc">{project.desc}</span>}
                  <span className="host mono">{project.host}</span>
                </span>
                <ArrowIcon />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty">
          <strong>Rien par ici.</strong>
          <span>
            {projects.length === 0
              ? "Aucun projet pour le moment."
              : `Aucun projet ne correspond à « ${query.trim()} ».`}
          </span>
          {projects.length > 0 && (
            <button type="button" className="clear" onClick={clearSearch}>
              Effacer la recherche
            </button>
          )}
        </div>
      )}

      <div className="card measure" ref={measureRef} aria-hidden="true">
        {projects.map((project) => (
          <span className="text" key={project.url}>
            <span className="name">{project.name}</span>
            {project.desc && <span className="desc">{project.desc}</span>}
          </span>
        ))}
      </div>

      <footer className="bottom">
        <span>Flemme de Host · fait avec juste assez de motivation</span>
        <span className="mono">Made by Vivicaty</span>
      </footer>
    </main>
  );
}
