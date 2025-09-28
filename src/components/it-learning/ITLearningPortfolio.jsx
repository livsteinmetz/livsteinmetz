// src/components/it-learning/ITLearningPortfolio.jsx
import React from 'react';

/** ========= ENTRIES (placeholders) ========= */
const entries = [
  {
    id: 'lr-tech-mediated-experiential',
    date: '2025-09-22',
    title: 'Technology-Mediated Experiential Learning & Close Looking in Museum Education',
    type: 'Literature Review',
    artifactUrl: '/assets/portfolio/pda675-entry1-tech-mediated-experiential-learning.pdf', // put your PDF here
    whySaved:
      'Defines research question; documents method (Scopus query, inclusion/exclusion, 6 studies); synthesizes Dewey + constructivism with tech-mediated close/slow looking.',
    outcomes: ['C_KU_1', 'C_KU_2', 'C_CS_1', 'C_CS_2', 'C_JA_1', 'C_JA_2'],
    reflection:
      'Across 6 recent studies, immersion and social discussion appear to drive outcomes more than slow-looking instructions alone. Interactivity increases agency but needs scaffolding to sustain attention; participatory design (e.g., IMEM) deepens ownership. Open questions: long-term impacts, digital vs in-person comparisons, effects across learner groups. This connects to my prior museum platform work and informs upcoming design probes.',
    tags: [
      'literature-review',
      'close-looking',
      'experiential-learning',
      'museum',
      'Dewey',
      'constructivism',
      'attention',
      'immersion',
    ],
  },
  {
    id: 'lr-reciprocal-tracking-self',
    date: '2025-09-28',
    title: 'Reciprocal Tracking & Self-Understanding: Personal Informatics for Learning about Self',
    type: 'Literature Review (in progress)',
    artifactUrl: '/assets/portfolio/pda675-entry2-reciprocal-tracking-self-understanding.pdf', // export your PDF here
    whySaved:
      'Synthesizes CHI ’25 “Peerspective” with personal informatics to explore bidirectional (peer ↔ peer) tracking for uncovering blind spots and supporting reflective learning; extracts design considerations (privacy, tone, burden) for instructional UI patterns.',
    outcomes: ['C_KU_1', 'C_KU_2', 'C_CS_1', 'C_CS_2', 'C_JA_1', 'C_JA_2'],
    reflection:
      'Reciprocal tracking adds context-rich, trusted feedback that broadens self-concept and sustains engagement beyond solo self-tracking. Plan: prototype a lightweight peer-feedback journaling pattern (written, asynchronous) to test acceptability and reflection quality in learning contexts.',
    tags: [
      'literature-review',
      'personal-informatics',
      'reciprocal-tracking',
      'self-awareness',
      'peer-learning',
      'feedback',
      'Johari-Window',
      'blind-spots',
    ],
  },
];

export default function ITLearningPortfolio() {
  const updated = new Date().toLocaleDateString();

  return (
    <main style={{ padding: '2rem 1.25rem', maxWidth: 1040, margin: '0 auto' }}>
      {/* Keep this page out of search engines (SPA-friendly, lightweight) */}
      <meta name="robots" content="noindex,nofollow" />
      <h2 style={{ marginTop: 0 }}>Digital Portfolio (PDA675)</h2>
      <p style={{ opacity: 0.9, maxWidth: 820 }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua.
      </p>
      <p style={{ fontSize: 14, opacity: 0.75 }}>Updated: {updated}</p>

      <section style={{ marginTop: '1.5rem' }}>
        <h3>Collection log</h3>
        <div style={{ display: 'grid', gap: '0.75rem' }} role="table" aria-label="Portfolio log">
          <div
            role="row"
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr 140px 1fr 240px',
              fontWeight: 600,
              background: 'rgba(0,0,0,.04)',
              padding: '0.5rem 0.75rem',
              borderRadius: 10,
            }}
          >
            <div role="columnheader">Date</div>
            <div role="columnheader">Title</div>
            <div role="columnheader">Type</div>
            <div role="columnheader">Why saved</div>
            <div role="columnheader">Mapped outcomes</div>
          </div>

          {entries.map((e) => (
            <div
              key={e.id}
              role="row"
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr 140px 1fr 240px',
                gap: '0.75rem',
                padding: '0.75rem',
                border: '1px solid rgba(0,0,0,.08)',
                borderRadius: 10,
              }}
            >
              <div role="cell">{e.date}</div>
              <div role="cell">
                <a href={e.artifactUrl} target="_blank" rel="noopener noreferrer">
                  {e.title}
                </a>
              </div>
              <div role="cell">{e.type}</div>
              <div role="cell">{e.whySaved}</div>
              <div role="cell">{e.outcomes.join(', ')}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h3>Master’s thesis — working direction</h3>
        <ul style={{ lineHeight: 1.6 }}>
          <li>
            <strong>Domain:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </li>
          <li>
            <strong>Seed question:</strong> Sed do eiusmod tempor incididunt ut labore et dolore
            magna aliqua.
          </li>
          <li>
            <strong>Methods (proposed):</strong> Ut enim ad minim veniam, quis nostrud exercitation
            ullamco laboris nisi.
          </li>
          <li>
            <strong>Risks:</strong> Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore.
          </li>
        </ul>
      </section>

      {/* 5) Career goals (placeholders) */}
      <section style={{ marginTop: '2rem', marginBottom: '3rem' }}>
        <h3>Career goals & competencies</h3>
        <ul style={{ lineHeight: 1.6 }}>
          <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
          <li>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</li>
          <li>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.
          </li>
          <li>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.</li>
        </ul>
      </section>
    </main>
  );
}
