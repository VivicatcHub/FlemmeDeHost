"use client";

import { useEffect, useRef, useState } from "react";
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
  return Math.ceil(width) + 1;
}

export default function Directory({ projects, children }) {
  const [query, setQuery] = useState("");
  const [textWidth, setTextWidth] = useState(null);
  const measureRef = useRef(null);

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

  const needle = query.trim().toLowerCase();
  const shown = needle
    ? projects.filter((p) =>
        `${p.name} ${p.desc}`.toLowerCase().includes(needle),
      )
    : projects;

  return (
    <main className="home">
      <header className="top">
        <a className="brand" href="/">
          <Logo size={44} />
          Flemme de Host
        </a>
        <label className="search">
          <SearchIcon />
          <span className="sr-only">Rechercher un projet</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un projet…"
          />
        </label>
      </header>

      {children}

      {shown.length > 0 ? (
        <ul
          className="projects"
          style={textWidth ? { "--text-width": `${textWidth}px` } : undefined}
        >
          {shown.map((project) => (
            <li key={project.url}>
              <a className="card" href={project.url}>
                <span className="tile-wrap">
                  <span className="halo" aria-hidden="true" />
                  <span className="tile">
                    {project.logo ? (
                      <img src={project.logo} alt="" />
                    ) : (
                      project.initials
                    )}
                  </span>
                </span>
                <span className="text">
                  <span className="name">{project.name}</span>
                  {project.desc && <span className="desc">{project.desc}</span>}
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
