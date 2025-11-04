// src/pages/Academic/Academic.tsx
'use client';

import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import '../Liv/Liv.scss';
import { IconBrandLinkedin, IconBrandGithub, IconMail } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../auth';
import { INTERESTS, PROJECTS, REFLECTIONS } from '../../copy/constants';
// import { listReflections } from '../../lib/api'; // Firestore fully disabled

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined'
      ? window.matchMedia(`(max-width:${breakpoint}px)`).matches
      : false,
  );
  useEffect(() => {
    const mql = window.matchMedia(`(max-width:${breakpoint}px)`);
    const handler = (e: { matches: boolean | ((prevState: boolean) => boolean) }) =>
      setIsMobile(e.matches);
    mql.addEventListener?.('change', handler);
    mql.addListener?.(handler); // Safari fallback
    return () => {
      mql.removeEventListener?.('change', handler);
      mql.removeListener?.(handler);
    };
  }, [breakpoint]);
  return isMobile;
}

/** color by category group */
function colorForCategory(category: string) {
  if (category.startsWith('Knowledge')) return '#5E81AC'; // blue
  if (category.startsWith('Competence')) return '#A3BE8C'; // green
  if (category.startsWith('Judgement')) return '#D08770'; // orange
  if (category.startsWith('Local outcomes — Competence')) return '#B48EAD'; // purple
  if (category.startsWith('Local outcomes — Judgement')) return '#EBCB8B'; // yellow
  return '#888888';
}

export default function Academic() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const heroEndRef = useRef<HTMLDivElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [compact, setCompact] = useState(false);
  const isMobile = useIsMobile(768);

  const [showToTop, setShowToTop] = useState(false);
  const { token } = useAuth?.() || { token: null };

  // no Firestore: reflect directly from constants
  const reflections = REFLECTIONS;

  useEffect(() => {
    const onScroll = () => setShowToTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleToTop = useCallback(() => window.scrollTo({ top: 0, behavior: 'smooth' }), []);

  useEffect(() => {
    if (isMobile) {
      setCompact(false);
      setMounted(true);
      return;
    }
    setCompact(false);
    const raf = requestAnimationFrame(() => {
      setMounted(true);
      const node = heroEndRef.current;
      if (!node) return;

      const io = new IntersectionObserver(([entry]) => setCompact(!entry.isIntersecting), {
        root: null,
        rootMargin: '0px 0px -1px 0px',
        threshold: 0,
      });
      io.observe(node);
      return () => io.disconnect();
    });
    return () => cancelAnimationFrame(raf);
  }, [isMobile]);

  // Selected objective labels (Set)
  const [selected] = useState<Set<string>>(new Set());

  // Filtered projects (OR across selected labels). If none selected -> all.
  const filteredProjects = useMemo(() => {
    if (selected.size === 0) return PROJECTS;
    return PROJECTS.filter((p) => {
      const labels = (p.objectives || []).map((o) => o.label);
      for (const lab of selected) {
        if (labels.includes(lab)) return true;
      }
      return false;
    });
  }, [selected]);

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div id="container" ref={containerRef} data-mobile={isMobile ? 'true' : 'false'}>
      {/* HERO */}
      <section id="hero" aria-label="Hero">
        <div className="hero-bg" aria-hidden="true" />
        <div ref={heroEndRef as any} className="hero-sentinel" aria-hidden="true" />
      </section>

      {/* OVERLAY CARD */}
      <section
        id="content-overlay"
        className={`overlay ${!isMobile && compact ? 'overlay--compact' : !isMobile ? 'overlay--hero' : 'overlay--mobile'}`}
        data-mounted={mounted}
        aria-label="Academic intro and quick links"
      >
        <div id="inner-left">
          <h1 className={`title ${!isMobile && compact ? 'title--compact' : 'title--hero'}`}>
            Olivia Steinmetz
          </h1>
          {/* INTERESTS — right-aligned list */}
          <h2>[Research Interests]</h2>
          <h5 id="right">
            {INTERESTS.filter(Boolean).map((t, i, arr) => (
              <span key={t}>
                {t}
                {i < arr.length - 1 ? <br /> : null}
              </span>
            ))}
          </h5>

          <a className="scroll-cue" href="/" aria-label="Back to main portfolio">
            ← View professional work
          </a>
          <br />

          {!isMobile && !compact && (
            <a className="scroll-cue" href="#projects" aria-label="Scroll to academic projects">
              ↓ View research and reflections
            </a>
          )}
        </div>
      </section>

      {/* CONTACT — bottom-right icons */}
      <section
        id="content-overlay"
        className={`bottom-right ${isMobile ? 'bottom-right--mobile' : ''}`}
        aria-label="Contact links"
      >
        <a
          className="contact-icon"
          href="https://www.linkedin.com/in/livsteinmetz/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          title="LinkedIn"
        >
          <IconBrandLinkedin size={40} stroke={2} color="white" />
        </a>
        <a
          className="contact-icon"
          href="https://github.com/livsteinmetz"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          title="GitHub"
        >
          <IconBrandGithub size={40} stroke={2} color="white" />
        </a>
        <a
          className="contact-icon"
          href="mailto:olivia.r.steinmetz@gmail.com"
          aria-label="Email"
          title="Email"
        >
          <IconMail size={40} stroke={2} color="white" />
        </a>
      </section>

      {/* PROGRAM OBJECTIVES — grouped, right-aligned */}
      <section id="list" className="list-section">
        {/* PROJECTS — right column list; shows tags under title; filters apply */}
        <h2 id="projects">[Projects]</h2>

        {filteredProjects.map((p, i) => (
          <div key={p.title}>
            <h5 id="right" style={{ marginBottom: 6 }}>
              <button
                type="button"
                className="project-title-btn as-link"
                onClick={() => setOpenIndex(i)}
                aria-label={`Open ${p.title}`}
                title={p.title}
              >
                {p.title}
              </button>
            </h5>
            {/* tags inline */}
            {Array.isArray(p.tags) && p.tags.length > 0 && (
              <div id="right" className="muted" style={{ marginBottom: 18 }}>
                {p.tags.map((t, idx) => (
                  <span key={`${p.title}-tag-${t}-${idx}`}>
                    {t}
                    {p.tags && idx < p.tags.length - 1 ? ' • ' : ''}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* empty state when no match */}
        {filteredProjects.length === 0 && (
          <h5 id="right" className="muted">
            No projects match the selected objectives.
          </h5>
        )}

        {/* ---- MY REFLECTIONS (direct from constants) ---- */}
        <h2>[Reflections]</h2>
        {/* Optional admin quick-link; safe to leave or remove */}
        {token && (
          <Link to="/admin/new" className="as-link" style={{ marginLeft: 8 }}>
            + New
          </Link>
        )}

        {reflections.length === 0 && (
          <h5 id="right" className="muted">
            No reflections yet.
          </h5>
        )}

        {reflections.map((r) => {
          const tagChips = String(r.tags || '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);

          return (
            <article
              key={r.id}
              className="reading-card"
              style={{
                border: '1px solid #2b2f36',
                borderRadius: 14,
                padding: 16,
                marginBottom: 16,
                background: 'rgba(20,22,28,0.6)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.03) inset',
              }}
            >
              <header style={{ marginBottom: 8 }}>
                <h5
                  id="right"
                  style={{
                    margin: 0,
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <strong>{r.title}</strong>
                  {r.type && (
                    <span
                      style={{
                        fontSize: 12,
                        padding: '2px 8px',
                        borderRadius: 999,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.06)',
                        display: 'inline-block',
                      }}
                      title={`Type: ${r.type}`}
                    >
                      {r.type}
                    </span>
                  )}
                </h5>

                {token && (
                  <div id="right" style={{ marginTop: 6 }}>
                    <Link
                      to={`/admin/edit/${r.id}`}
                      className="as-link"
                      aria-label={`Edit ${r.title}`}
                      title="Edit"
                    >
                      ✎ Edit
                    </Link>
                  </div>
                )}
              </header>

              {tagChips.length > 0 && (
                <div id="right" style={{ margin: '8px 0 12px' }}>
                  {tagChips.map((t) => (
                    <span
                      key={`${r.id}-${t}`}
                      style={{ fontSize: 12, opacity: 0.85, marginRight: 8, color: 'white' }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {r.summary && (
                <p id="right" className="muted" style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
                  {r.summary}
                </p>
              )}

              {/* Show full reflection text if provided */}
              {'reflection' in r && r.reflection && (
                <p id="right" style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}>
                  {r.reflection}
                </p>
              )}
            </article>
          );
        })}
      </section>

      {/* LIGHTBOX — includes tags + objectives */}
      {openIndex != null && (
        <button
          type="button"
          className="lb-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenIndex(null);
          }}
          aria-label="Close details"
        >
          <div
            className="lb-stage"
            role="dialog"
            aria-modal="true"
            aria-label={filteredProjects[openIndex].title}
          />
          <div id="content-overlay" className="overlay overlay--compact">
            <div id="inner">
              <h2 className="lb-title">{filteredProjects[openIndex].title}</h2>

              {/* Tags */}
              {filteredProjects[openIndex].tags?.length ? (
                <p className="lb-body" style={{ marginTop: 6 }}>
                  <strong>Tags: </strong>
                  {filteredProjects[openIndex].tags.join(' • ')}
                </p>
              ) : null}

              {/* Summary */}
              <p className="lb-body">{filteredProjects[openIndex].summary}</p>

              {/* Objectives */}
              {filteredProjects[openIndex].objectives?.length ? (
                <div className="lightbox-takeaways">
                  <h6>Objectives mapped</h6>
                  <ul>
                    {filteredProjects[openIndex].objectives.map((o, j) => (
                      <li key={`${o.label}-${j}`}>
                        <span>{o.label}</span>
                        <span className="muted" style={{ marginLeft: 8 }}>
                          [{o.category}]
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
          <button className="lb-close" aria-label="Close" onClick={() => setOpenIndex(null)}>
            ×
          </button>
        </button>
      )}

      {/* TO TOP */}
      <button
        type="button"
        className={`to-top ${showToTop ? 'is-visible' : ''}`}
        onClick={handleToTop}
        aria-label="Scroll to top"
        title="Scroll to top"
      >
        <span aria-hidden="true">↑</span>
      </button>
    </div>
  );
}
