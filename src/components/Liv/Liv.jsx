import React, { useCallback, useEffect, useRef, useState } from 'react';

import './Liv.scss';
import Work from '../Work/Work';

const MIN_LEFT_PCT = 20; // rails; adjust to taste
const MAX_LEFT_PCT = 80;
const MOBILE_BREAKPOINT = 768; // px — below this, the splitter is disabled

export default function Liv() {
  const [leftPct, setLeftPct] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isActive, setIsActive] = useState(true); // splitter enabled?
  const containerRef = useRef(null);
  const rafRef = useRef(null);

  // Enable/disable splitter based on width
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setIsActive(w >= MOBILE_BREAKPOINT);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const clampPct = (pct) => Math.min(MAX_LEFT_PCT, Math.max(MIN_LEFT_PCT, pct));

  const pctFromClientX = useCallback(
    (clientX) => {
      const el = containerRef.current;
      if (!el) return leftPct;
      const rect = el.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = (x / rect.width) * 100;
      return clampPct(pct);
    },
    [leftPct],
  );

  const startDrag = useCallback((clientX) => {
    setIsDragging(true);
    setLeftPct((prev) => clampPct(prev)); // ensure valid before drag
    // Prevent text selection while dragging
    document.body.style.userSelect = 'none';
  }, []);

  const onMouseDown = (e) => {
    if (!isActive) return;
    e.preventDefault();
    startDrag(e.clientX);
  };

  const onTouchStart = (e) => {
    if (!isActive) return;
    startDrag(e.touches[0].clientX);
  };

  // Drag loop (mouse + touch)
  useEffect(() => {
    if (!isDragging) return;

    const onMove = (clientX) => {
      // rAF throttle so we don't spam layout
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setLeftPct(pctFromClientX(clientX));
        // Nudge libs that listen to window resize
        window.dispatchEvent(new Event('resize'));
      });
    };

    const handleMouseMove = (e) => onMove(e.clientX);
    const handleTouchMove = (e) => onMove(e.touches[0].clientX);

    const endDrag = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
      // final nudge
      window.dispatchEvent(new Event('resize'));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', endDrag);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', endDrag);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', endDrag);
    };
  }, [isDragging, pctFromClientX]);

  // Keyboard accessibility on the separator
  const onSeparatorKeyDown = (e) => {
    if (!isActive) return;
    const step = e.shiftKey ? 5 : 2; // Shift for larger jumps
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setLeftPct((p) => clampPct(p - step));
      window.dispatchEvent(new Event('resize'));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setLeftPct((p) => clampPct(p + step));
      window.dispatchEvent(new Event('resize'));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setLeftPct(MIN_LEFT_PCT);
      window.dispatchEvent(new Event('resize'));
    } else if (e.key === 'End') {
      e.preventDefault();
      setLeftPct(MAX_LEFT_PCT);
      window.dispatchEvent(new Event('resize'));
    }
  };

  // Inline sizes so the masonry reflows immediately
  const leftStyle = isActive ? { width: `${100 - leftPct}%` } : {};
  const rightStyle = isActive ? { width: `${leftPct}%` } : {};

  return (
    <div id="container" ref={containerRef} className={isActive ? 'split-active' : 'split-stacked'}>
      <div id="right-container" style={rightStyle}>
        <div id="right-scroll">
          <h1>Olivia Steinmetz</h1>
          <h2>[Current Work]</h2>
          <h5 id="right">
            Front-End Software Engineer & Product Manager for Digital Initiatives @<br />
            <a href="https://barnesfoundation.org/" target="_blank" rel="noopener noreferrer">
              the Barnes Foundation
            </a>
          </h5>
          <h5 id="right">Freelance Double Bassist</h5>
          <h5 id="right">Researcher</h5>
          <br />
          <div>
            <h2>[Former Work + Clients + Collaborators]</h2>

            <h3>Arts + Culture</h3>
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
              <a
                href="https://www.networkfornewmusic.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
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
              <a
                href="https://utahmetropolitanballet.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Utah Metropolitan Ballet
              </a>
              <br />
            </h5>

            <h3>Tech + Nonprofit</h3>
            <h5 id="right">
              Accenture Operations Studio <br />
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
              <a href="https://www.vanderbiltscno.com/" target="_blank" rel="noopener noreferrer">
                Students Consulting for Nonprofit Organizations (SCNO)
              </a>
              <br />
            </h5>

            <h3>Education + Research</h3>
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
              <a
                href="https://www.vanderbilt.edu/thewondry/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Wond&apos;ry Center for Innovation and Entrepreneurship
              </a>
            </h5>
          </div>
          <br />
          <h2>[In Progress...]</h2>
          <h5 id="right">Applied research in HCI, HCAI, Learning & Digital Culture</h5>
          <h5 id="right">
            Exploring AI literacy and human agency, digital attention and well-being, equitable
            access to culture, and the design of interfaces, narratives, and visual media that make
            learning more intuitive, engaging, and meaningful.
          </h5>

          <h2>[Contact]</h2>
          <h5 id="right">
            <a
              href="https://www.linkedin.com/in/livsteinmetz/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </h5>
          <h5 id="right">
            <a href="https://github.com/livsteinmetz" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </h5>
          <h5 id="right">
            <a href="mailto:olivia.r.steinmetz@gmail.com" target="_blank" rel="noopener noreferrer">
              Email
            </a>
          </h5>
          <h5 id="right">
            <a href="/OliviaSteinmetzCV2025.pdf" target="_blank" rel="noopener noreferrer">
              Resume
            </a>
          </h5>
        </div>
      </div>

      {/* Separator */}
      <div
        className="split-separator"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panels"
        aria-valuemin={MIN_LEFT_PCT}
        aria-valuemax={MAX_LEFT_PCT}
        aria-valuenow={Math.round(leftPct)}
        tabIndex={0}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onKeyDown={onSeparatorKeyDown}
      >
        <span className="split-grip" />
      </div>
      <div id="left-container" style={leftStyle}>
        <div id="left-scroll">
          <h3>
            I write code, manage products, play bass, and design interfaces. Some days it feels
            coherent; most days it feels like improvisation.
          </h3>
          <p>
            <br />
            I&apos;ve spent the past five years working at the intersection of design, technology,
            and the arts—helping cultural institutions reimagine how they reach audiences. Take a
            look at some of the projects I&apos;ve worked on in the past below. The common thread is
            a commitment to data-driven, design-forward, human-centered solutions that make culture
            more accessible, equitable, and engaging.
            <br /> <br />
            Though my roots and home base will always be in Philadelphia, remote work, friendships,
            and study have carried me across geographies and communities. I studied Double Bass
            Performance and Engineering Design at Vanderbilt University.
            <br /> <br />
            Some questions I&apos;m seeking answers to: how to design AI that protects human agency;
            what digital well-being looks like when attention is the currency; and how narrative,
            sound, and interface can make learning feel like discovery rather than transactional.
            <br />
            <br />
            If you’re asking similar questions (or have answers!), let&apos;s connect.
          </p>
          <br />
          <section id="work" aria-label="Selected work">
            <Work />
          </section>
        </div>
      </div>
    </div>
  );
}
