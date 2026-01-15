import { IconBrandLinkedin, IconBrandGithub, IconMail } from '@tabler/icons-react';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import './Liv.scss';
import { Link } from 'react-router-dom';

import projects from '../../copy/projects.json';
import Work, { Lightbox } from '../Work/Work';

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined'
      ? window.matchMedia(`(max-width:${breakpoint}px)`).matches
      : false,
  );
  useEffect(() => {
    const mql = window.matchMedia(`(max-width:${breakpoint}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener?.('change', handler);
    mql.addListener?.(handler);
    return () => {
      mql.removeEventListener?.('change', handler);
      mql.removeListener?.(handler);
    };
  }, [breakpoint]);
  return isMobile;
}

export default function Liv() {
  const containerRef = useRef(null);
  const heroEndRef = useRef(null);
  const [projIndex, setProjIndex] = useState(null);
  const closeProject = () => setProjIndex(null);
  const nextProject = () => setProjIndex((i) => (i == null ? 0 : (i + 1) % projects.length));
  const prevProject = () =>
    setProjIndex((i) => (i == null ? 0 : (i - 1 + projects.length) % projects.length));

  const [compact, setCompact] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile(768);

  const [showToTop, setShowToTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowToTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

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

  // [filter] Selected pills (by label)
  const [selected] = useState(new Set());

  // [filter] Filtered projects (OR logic across selected objective labels)
  const filteredProjects = useMemo(() => {
    if (selected.size === 0) return projects;
    return projects.filter((p) => {
      const labels = (p.objectives || []).map((o) => o.label);
      // show if any selected label is in the project's objectives
      for (const lab of selected) {
        if (labels.includes(lab)) return true;
      }
      return false;
    });
  }, [selected]);

  return (
    <div id="container" ref={containerRef} data-mobile={isMobile ? 'true' : 'false'}>
      {/* HERO */}
      <section id="hero" aria-label="Hero">
        <div className="hero-bg" aria-hidden="true" />
        <div ref={heroEndRef} className="hero-sentinel" aria-hidden="true" />
      </section>

      {/* INTRO OVERLAY / CARD */}
      <section
        id="content-overlay"
        className={`overlay ${!isMobile && compact ? 'overlay--compact' : !isMobile ? 'overlay--hero' : 'overlay--mobile'}`}
        data-mounted={mounted}
        aria-label="Intro, projects, and links"
      >
        <div id="inner-left">
          <h1 className={`title ${!isMobile && compact ? 'title--compact' : 'title--hero'}`}>
            Olivia Steinmetz
          </h1>

          <h2>[Current Professional Work]</h2>

          <h5 id="right" style={{ marginBottom: 16 }}>
            Currently leading front-end, design, and product work <br />
            for digital initiatives @{' '}
            <a href="https://barnesfoundation.org/" target="_blank" rel="noopener noreferrer">
              the Barnes Foundation
            </a>
          </h5>

          <p className="muted" id="right" style={{ maxWidth: 520, marginBottom: 16 }}>
            I design and build brand-driven, human-centered, conversion-focused digital products –
            from research and UX strategy to interface design and implementation.
          </p>

          <p className="muted" id="right" style={{ marginBottom: 8 }}>
            Outside of product and design work, I&apos;m also an active freelance double bassist.
          </p>

          {!isMobile && !compact && (
            <>
              <a className="scroll-cue" href="#work" aria-label="Scroll to work">
                ↓ View professional work
              </a>

              <br />
            </>
          )}
        </div>
      </section>

      {/* CONTACT */}
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
          href="mailto:olivia@example.com"
          aria-label="Email"
          title="Email"
        >
          <IconMail size={40} stroke={2} color="white" />
        </a>
      </section>

      {/* WORK */}
      <section id="work" aria-label="Selected work">
        <div className="work-inner">
          {/* [filter] pass filteredProjects to Work (if Work accepts a prop); else leave as-is */}
          <Work projects={filteredProjects} />
        </div>
      </section>

      {projIndex != null && (
        <Lightbox
          items={projects}
          index={projIndex}
          onClose={closeProject}
          onNext={nextProject}
          onPrev={prevProject}
        />
      )}

      {/* PROJECTS */}
      <section
        id="list"
        className="list-section"
        aria-label="List of Projects, Former Work, Clients, and Collaborators"
      >
        {/* <h2>[Projects]</h2> */}

        {/* [filter] Pills */}
        {/* <div className="filters" role="group" aria-label="Filter projects by learning objectives"> */}
        {/* Category chips (static labels) */}
        {/* <div className="filters-row">
            <span className="filters-label">Filter:</span>
            {objectiveFilters.map((f) => {
              const active = selected.has(f.label);
              return (
                <button
                  key={f.label}
                  type="button"
                  className={`pill ${active ? 'pill--active' : ''}`}
                  onClick={() => toggleFilter(f.label)}
                  style={{
                    // background for active, border/text for inactive
                    backgroundColor: active ? f.color : 'transparent',
                    borderColor: f.color,
                    color: active ? '#0B0E14' : f.color,
                  }}
                  aria-pressed={active ? 'true' : 'false'}
                  title={`${f.category} • ${f.label}`}
                >
                  <span
                    className="pill-dot"
                    aria-hidden="true"
                    style={{ backgroundColor: f.color }}
                  />
                  {f.label}
                </button>
              );
            })}
            {objectiveFilters.length > 0 && (
              <button
                type="button"
                className="pill pill--reset"
                onClick={clearFilters}
                aria-label="Clear all filters"
                title="Clear all filters"
              >
                Clear
              </button>
            )}
          </div> */}
        {/* </div> */}

        {/* [filter] Filtered list of titles opens the correct (original) index
        {filteredProjects.map((p, i) => (
          <h5 key={p.title || i} id="right">
            <button
              type="button"
              className="project-title-btn as-link"
              onClick={() => openFilteredProject(i)}
              aria-label={`Open ${p.title}`}
            >
              {p.title}
            </button>
          </h5>
        ))} */}

        <h2>[Former Work + Clients + Collaborators]</h2>
        <h5 id="right">
          Accenture
          <br />
          <a href="https://alliedmedia.org/" target="_blank" rel="noopener noreferrer">
            Allied Media Projects
          </a>
          <br />
          <a href="https://caldergardens.org/" target="_blank" rel="noopener noreferrer">
            Calder Gardens
          </a>
          <br />
          <a href="https://www.capitalone.com/" target="_blank" rel="noopener noreferrer">
            Capital One
          </a>
          <br />
          Children&apos;s Hospital of Philadelphia Neurovascular Imaging Lab
          <br />
          <a href="https://www.curtis.edu/" target="_blank" rel="noopener noreferrer">
            Curtis Institute of Music
          </a>
          <br />
          <a href="https://designforamerica.com/" target="_blank" rel="noopener noreferrer">
            Design for America
          </a>
          <br />
          <a href="https://www.vanderbilt.edu/dive/" target="_blank" rel="noopener noreferrer">
            Design as an Immersive Vanderbilt Experience (DIVE)
          </a>
          <br />
          <a href="https://designjustice.org/" target="_blank" rel="noopener noreferrer">
            Design Justice Network
          </a>
          <br />
          KPMG
          <br />
          <a href="https://www.cnm.org/" target="_blank" rel="noopener noreferrer">
            Nashville Center for Nonprofit Management
          </a>
          <br />
          <a
            href="https://newjerseychamberorchestra.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            New Jersey Chamber Orchestra
          </a>
          <br />
          <a
            href="https://music.sas.upenn.edu/ensembles/penn-symphony-orchestra"
            target="_blank"
            rel="noopener noreferrer"
          >
            Penn Symphony Orchestra
          </a>
          <br />
          <a href="https://pennsylvaniasinfonia.org/" target="_blank" rel="noopener noreferrer">
            Pennsylvania Sinfonia Orchestra
          </a>
          <br />
          <a href="https://www.networkfornewmusic.org/" target="_blank" rel="noopener noreferrer">
            Philadelphia Network for New Music
          </a>
          <br />
          <a href="https://pyomusic.org/" target="_blank" rel="noopener noreferrer">
            Philadelphia Youth Orchestra
          </a>
          <br />
          <a href="https://settlementmusic.org/" target="_blank" rel="noopener noreferrer">
            Settlement Music School
          </a>
          <br />
          <a href="https://www.symphonyinc.org/" target="_blank" rel="noopener noreferrer">
            Symphony in C
          </a>
          <br />
          <a
            href="https://boyer.temple.edu/academics/ensemble/temple-university-composers-orchestra"
            target="_blank"
            rel="noopener noreferrer"
          >
            Temple Composers Orchestra
          </a>
          <br />
          <a
            href="https://boyer.temple.edu/academics/ensemble/temple-university-symphony-orchestra"
            target="_blank"
            rel="noopener noreferrer"
          >
            Temple University Orchestra
          </a>
          <br />
          <a href="https://utahmetropolitanballet.org/" target="_blank" rel="noopener noreferrer">
            Utah Metropolitan Ballet
          </a>
          <br />
          Vanderbilt Memory & Alzheimer’s Center
          <br />
          Vanderbilt Programming Board (VPB)
          <br />
          <a href="https://www.vanderbilt.edu/thewondry/" target="_blank" rel="noopener noreferrer">
            Wond&apos;ry Center for Innovation and Entrepreneurship
          </a>
        </h5>
      </section>

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
