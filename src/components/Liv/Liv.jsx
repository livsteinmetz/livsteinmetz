import React, { useEffect, useRef, useState } from 'react';
import './Liv.scss';
import { IconBrandLinkedin, IconBrandGithub, IconMail } from '@tabler/icons-react';

import projects from '../../copy/projects.json';
import Work, { Lightbox } from '../Work/Work';

export default function Liv() {
  const containerRef = useRef(null);
  const heroEndRef = useRef(null);
  const [projIndex, setProjIndex] = useState(null);
  const openProject = (i) => setProjIndex(i);
  const closeProject = () => setProjIndex(null);
  const nextProject = () => setProjIndex((i) => (i == null ? 0 : (i + 1) % projects.length));
  const prevProject = () =>
    setProjIndex((i) => (i == null ? 0 : (i - 1 + projects.length) % projects.length));

  // Start full-screen
  const [compact, setCompact] = useState(false);
  // For disabling transitions on very first paint
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Ensure "hero" state on first paint
    setCompact(false);
    const raf = requestAnimationFrame(() => {
      setMounted(true); // enable transitions AFTER first paint

      const node = heroEndRef.current;
      if (!node) return;

      const io = new IntersectionObserver(
        ([entry]) => {
          // When sentinel leaves viewport => compact
          setCompact(!entry.isIntersecting);
        },
        {
          root: null,
          // small negative bottom margin prevents premature compaction on load
          rootMargin: '0px 0px -1px 0px',
          threshold: 0,
        },
      );

      io.observe(node);
      // cleanup
      return () => io.disconnect();
    });

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div id="container" ref={containerRef}>
      {/* HERO */}
      <section id="hero" aria-label="Hero">
        <div className="hero-bg" aria-hidden="true" />
        <div ref={heroEndRef} className="hero-sentinel" aria-hidden="true" />
      </section>

      <section
        id="content-overlay"
        className={`overlay ${compact ? 'overlay--compact' : 'overlay--hero'}`}
        data-mounted={mounted} // used to kill transitions on initial paint
        aria-label="Intro, projects, and links"
      >
        <div id="inner-left">
          <h1 className={`title ${compact ? 'title--compact' : 'title--hero'}`}>
            Olivia Steinmetz
          </h1>
          <h2>[Current Work]</h2>
          <h5 id="right">
            Front-End Software Engineer &amp; Product Manager for Digital Initiatives @{' '}
            <a href="https://barnesfoundation.org/" target="_blank" rel="noopener noreferrer">
              the Barnes Foundation
            </a>
          </h5>
          <h5 id="right">Freelance Double Bassist</h5>
          <h5 id="right">Researcher</h5>

          {!compact && (
            <a className="scroll-cue" href="#work" aria-label="Scroll to work">
              ↓ View selected work
            </a>
          )}
        </div>
        {!compact && <div id="inner-right">hey hi hello</div>}
      </section>

      {/* Fixed contact overlay */}
      <section id="content-overlay" className="bottom-right" aria-label="Contact links">
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

      {/* WORK */}
      <section id="work" aria-label="Selected work">
        <div className="work-inner">
          <Work />
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

      <section
        id="list"
        className="list-section"
        aria-label="List of Projects, Former Work, Clients, and Collaborators"
      >
        <h2>[Projects]</h2>
        {projects.map((p, i) => (
          <h5 key={p.title || i}>
            <button
              type="button"
              className="project-title-btn as-link"
              onClick={() => openProject(i)}
              aria-label={`Open ${p.title}`}
            >
              {p.title}
            </button>
          </h5>
        ))}
        <h2>[Former Work + Clients + Collaborators]</h2>
        <h5 id="right">
          <a href="https://caldergardens.org/" target="_blank" rel="noopener noreferrer">
            Calder Gardens
          </a>
          <br />
          <a href="https://www.curtis.edu/" target="_blank" rel="noopener noreferrer">
            Curtis Institute of Music
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
        </h5>
        <h5 id="right">
          Accenture
          <br />
          <a href="https://alliedmedia.org/" target="_blank" rel="noopener noreferrer">
            Allied Media Projects
          </a>
          <br />
          <a href="https://www.capitalone.com/" target="_blank" rel="noopener noreferrer">
            Capital One
          </a>
          <br />
          <a href="https://designforamerica.com/" target="_blank" rel="noopener noreferrer">
            Design for America
          </a>
          <br />
          <a href="https://designjustice.org/" target="_blank" rel="noopener noreferrer">
            Design Justice Network
          </a>
          <br />
          KPMG
          <br />
          <a href="https://www.vanderbiltscno.com/" target="_blank" rel="noopener noreferrer">
            Students Consulting for Nonprofit Organizations (SCNO)
          </a>
          <br />
        </h5>
        <h5 id="right">
          Children&apos;s Hospital of Philadelphia Neurovascular Imaging Lab <br />
          <a href="https://www.cnm.org/" target="_blank" rel="noopener noreferrer">
            Nashville Center for Nonprofit Management
          </a>
          <br />
          <a href="https://www.vanderbilt.edu/dive/" target="_blank" rel="noopener noreferrer">
            Design as an Immersive Vanderbilt Experience (DIVE)
          </a>
          <br />
          Vanderbilt Memory & Alzheimer’s Center <br />
          Vanderbilt Programming Board (VPB) <br />
          <a href="https://www.vanderbilt.edu/thewondry/" target="_blank" rel="noopener noreferrer">
            Wond&apos;ry Center for Innovation and Entrepreneurship
          </a>
        </h5>
      </section>
    </div>
  );
}
