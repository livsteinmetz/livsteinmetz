'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import '../Liv/Liv.scss';
import { IconBrandLinkedin, IconBrandGithub, IconMail } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../auth';
import { listReflections } from '../../lib/api';

const INTERESTS = [
  'HCI',
  'interaction design',
  'learning design',
  'museum education',
  'AI + pedagogy',
];

/** Program objectives — grouped for display */
const PROGRAM_OBJECTIVES_GROUPS = [
  {
    heading: 'Knowledge & understanding',
    items: [
      'demonstrate knowledge and understanding in the main field of study, including both broad knowledge of the field and a considerable degree of specialised knowledge in certain areas of the field as well as insight into current research and development work, and',
      'demonstrate specialised methodological knowledge in the main field of study',
    ],
  },
  {
    heading: 'Competence & skills',
    items: [
      'demonstrate the ability to critically and systematically integrate knowledge and analyse, assess and deal with complex phenomena, issues and situations even with limited information',
      'demonstrate the ability to identify and formulate issues critically, autonomously and creatively as well as to plan and, using appropriate methods, undertake advanced tasks within predetermined time frames and so contribute to the formation of knowledge as well as the ability to evaluate this work',
      'demonstrate the ability in speech and writing both nationally and internationally to clearly report and discuss his or her conclusions and the knowledge and arguments on which they are based in dialogue with different audiences, and',
      'demonstrate the skills required for participation in research and development work or autonomous employment in some other qualified capacity.',
      'demonstrate ability to analyse the relationship between the historical development of information technologies and the changing premises for communication and learning',
      'describe and conceptualise how knowledge and learning is organised in institutions, working life and society based on current research and relevant theoretical approaches',
    ],
  },
  {
    heading: 'Judgement & approach',
    items: [
      'demonstrate the ability to make assessments in the main field of study informed by relevant disciplinary, social and ethical issues and also to',
      'demonstrate awareness of ethical aspects of research and development work',
      'demonstrate insight into the possibilities and limitations of research, its role in society and the responsibility of the individual for how it is used, and',
      'demonstrate the ability to identify the personal need for further knowledge and take responsibility for his or her ongoing learning.',
      'critically investigate, analyse and discuss the interaction between users and information technologies in institutions, working life and society',
      'evaluate and adapt the design of digital environments for communication and learning in institutions, working life and society',
    ],
  },
];

/** Program objectives — grouped for display */
const COURSE_OBJECTIVES_GROUPS = [
  {
    heading: 'Knowledge & understanding',
    items: [
      'account for and compare central perspectives on learning, including both broad knowledge of the field and a considerable degree of specialised knowledge in certain areas of the field as well as insight into current research and development work, and',
      'relate central perspectives on learning to research and practice in the field of IT and Learning',
      'critically analyze and discuss recent research in relation to central perspectives on learning within the field of IT and Learning',
    ],
  },
  {
    heading: 'Competence & skills',
    items: [
      'assemble a selection of research literature in the field of IT and Learning for a defined question or topic',
      'present arguments based on the research literature in the form of an academic paper',
    ],
  },
  {
    heading: 'Judgement & approach',
    items: [
      'reflect on and document their own knowledge and experience in relation to future work life possibilities in a portfolio',
      'discuss social and technical sustainability issues within the research and applied field of IT and learning',
    ],
  },
];

/** Example project */
const PROJECTS = [
  {
    kind: 'LITERATURE REVIEW',
    title: 'Learning to See: Technology as a Medium for Experiential Museum Education',
    summary:
      'This systematic literature review was inspired by my work at the Barnes Foundation developing technology for experiential art learning. The paper investigates how digital mediation reshapes museum education and what it means to "learn to see" in virtual and hybrid contexts. Following the PRISMA framework, I systematically reviewed post-2020 peer-reviewed studies across museum education, human–computer interaction, and learning sciences. The review compares theoretical perspectives—drawing on Dewey’s experiential aesthetics, constructivist learning theories, and research on slow and close looking—to evaluate how digital environments can sustain deep engagement rather than distraction. Findings suggest that technology, when intentionally designed with light scaffolding and affective awareness, can cultivate attention, reflection, and perceptual literacy as learnable skills. The paper concludes that digital tools in museum education should not replicate in-person encounters but create new conditions for learning to see through mediated experience.',
    takeaways: [
      'Learning to see is a cultivable skill in mediated contexts.',
      'Light scaffolding sustains slow/close looking online.',
      'Affective awareness improves depth of engagement.',
    ],
    tags: ['Research & Reflection', 'Learning Design', 'HCI'],
    /** Map this project to any program objectives it advances (labels should match PROGRAM_OBJECTIVES labels). */
    objectives: [
      {
        label: 'demonstrate specialised methodological knowledge in the main field of study',
        category: 'Knowledge & understanding',
      },
      {
        label:
          'demonstrate the ability to critically and systematically integrate knowledge and analyse, assess and deal with complex phenomena, issues and situations even with limited information',
        category: 'Competence & skills',
      },
      {
        label:
          'critically investigate, analyse and discuss the interaction between users and information technologies in institutions, working life and society',
        category: 'Local outcomes — Judgement & approach',
      },
    ],
    link: null,
  },
];

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
  type Reflection = {
    id: string;
    title: string;
    citation?: string;
    tags?: string;
    summary?: string;
    createdAt?: string | { seconds: number } | null;
  };

  const toMillis = (v: Reflection['createdAt']): number => {
    if (typeof v === 'string') {
      const t = Date.parse(v);
      return Number.isFinite(t) ? t : 0;
    }
    if (v && typeof v === 'object' && 'seconds' in v) {
      return (v.seconds as number) * 1000;
    }
    return 0;
  };

  const containerRef = useRef(null);
  const heroEndRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  const [compact, setCompact] = useState(false);
  const isMobile = useIsMobile(768);

  const [showToTop, setShowToTop] = useState(false);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [reflectionsLoading, setReflectionsLoading] = useState(true);
  const [reflectionsError, setReflectionsError] = useState('');
  const { token } = useAuth?.() || { token: null };

  // Fetch reflections on mount (single effect)
  useEffect(() => {
    (async () => {
      try {
        setReflectionsLoading(true);
        const data = await listReflections();
        const sorted = Array.isArray(data)
          ? [...data].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt))
          : [];
        setReflections(sorted as Reflection[]);
      } catch (e) {
        console.error('[listReflections] failed:', e);
        setReflectionsError('Could not load reflections.');
      } finally {
        setReflectionsLoading(false);
      }
    })();
  }, []);

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
  const [selected] = useState(new Set());

  // Filtered projects (OR across selected labels). If none selected -> all.
  const filteredProjects = useMemo(() => {
    if (selected.size === 0) return PROJECTS;
    return PROJECTS.filter((p) => {
      const labels = (p.objectives || []).map((o) => o.label);
      for (const lab of selected) {
        if (labels.includes(lab as string)) return true;
      }
      return false;
    });
  }, [selected]);

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function fmtDate(value: Reflection['createdAt']) {
    if (!value) return '';
    try {
      let d: Date;
      if (typeof value === 'string') {
        const t = Date.parse(value);
        if (!Number.isFinite(t)) return '';
        d = new Date(t);
      } else if (
        typeof value === 'object' &&
        'seconds' in value &&
        typeof value.seconds === 'number'
      ) {
        d = new Date(value.seconds * 1000);
      } else {
        return '';
      }
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(d);
    } catch {
      return '';
    }
  }

  return (
    <div id="container" ref={containerRef} data-mobile={isMobile ? 'true' : 'false'}>
      {/* HERO */}
      <section id="hero" aria-label="Hero">
        <div className="hero-bg" aria-hidden="true" />
        <div ref={heroEndRef} className="hero-sentinel" aria-hidden="true" />
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
                {i < arr.length - 1 ? (
                  <>
                    <br />
                  </>
                ) : null}
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
        <h2>[Program Objectives]</h2>
        {PROGRAM_OBJECTIVES_GROUPS.map((group) => (
          <div key={group.heading} style={{ marginBottom: 16 }}>
            <h5 id="right">
              <strong>{group.heading}</strong>
              <br />
              {group.items.map((t, i) => (
                <p key={t}>
                  {t}
                  {i < group.items.length - 1 ? (
                    <>
                      <br />
                    </>
                  ) : null}
                </p>
              ))}
            </h5>
          </div>
        ))}

        <h2>[Course Objectives]</h2>
        {COURSE_OBJECTIVES_GROUPS.map((group) => (
          <div key={group.heading} style={{ marginBottom: 16 }}>
            <h5 id="right">
              <strong>{group.heading}</strong>
              <br />
              {group.items.map((t, i) => (
                <p key={t}>
                  {t}
                  {i < group.items.length - 1 ? (
                    <>
                      <br />
                    </>
                  ) : null}
                </p>
              ))}
            </h5>
          </div>
        ))}

        {/* PROJECTS — right column list; shows tags under title; filters apply */}

        <h2>[Academic Projects]</h2>

        {filteredProjects.map((p, i) => (
          <div id="projects" key={p.title}>
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
                    {idx < p.tags.length - 1 ? ' • ' : ''}
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

        {/* ---- MY REFLECTIONS (from API) ---- */}

        <h2>[My Reflections]</h2>
        {token && (
          <Link to="/admin/new" className="as-link" style={{ marginLeft: 8 }}>
            + New
          </Link>
        )}
        {reflectionsLoading && <h5 id="right">Loading reflections…</h5>}
        {reflectionsError && (
          <h5 id="right" style={{ color: '#E57373' }}>
            {reflectionsError}
          </h5>
        )}

        {!reflectionsLoading && !reflectionsError && reflections.length === 0 && (
          <h5 id="right" className="muted">
            No reflections yet.
          </h5>
        )}

        {!reflectionsLoading &&
          reflections.map((r) => (
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
                <h5 id="right" style={{ margin: 0 }}>
                  <strong>{r.title}</strong>
                </h5>
                <div id="right" className="muted" style={{ fontSize: 14, marginTop: 4 }}>
                  {r.citation || '—'} {r.createdAt ? ` • ${fmtDate(r.createdAt)}` : ''}
                </div>
                <div id="right" style={{ marginTop: 6 }}>
                  <Link
                    to={`/r/${r.id}`}
                    className="as-link"
                    aria-label={`Open public view for ${r.title}`}
                    title="Public view"
                    style={{ marginRight: 12 }}
                  >
                    ↗ View
                  </Link>
                  {token && (
                    <Link
                      to={`/admin/edit/${r.id}`}
                      className="as-link"
                      aria-label={`Edit ${r.title}`}
                      title="Edit"
                    >
                      ✎ Edit
                    </Link>
                  )}
                </div>
              </header>

              {r.tags && (
                <div id="right" style={{ margin: '8px 0 12px' }}>
                  {String(r.tags)
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((t) => (
                      <span
                        key={`${r.id}-${t}`}
                        style={{ fontSize: 12, opacity: 0.85, marginRight: 8 }}
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
            </article>
          ))}
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
                        <span
                          aria-hidden="true"
                          style={{
                            display: 'inline-block',
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: colorForCategory(o.category),
                            marginRight: 8,
                            verticalAlign: 'middle',
                          }}
                        />
                        <span>{o.label}</span>
                        <span className="muted" style={{ marginLeft: 8 }}>
                          [{o.category}]
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {/* Takeaways */}
              {filteredProjects[openIndex].takeaways?.length ? (
                <div className="lightbox-takeaways">
                  <h6>Takeaways</h6>
                  <ul>
                    {filteredProjects[openIndex].takeaways.map((t, j) => (
                      <li key={j}>{t}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {filteredProjects[openIndex].link && (
                <a
                  className="lb-link"
                  href={filteredProjects[openIndex].link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read full paper
                </a>
              )}
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
