import React from 'react';

/** ========= PDA676 COURSE OBJECTIVES (verbatim) =========
 * Codes used for mapping on this page:
 * L_KU_* = Knowledge & Understanding
 * L_CS_* = Competence & Skills
 * L_JA_* = Judgement & Approach
 */
const LITERACIES_OBJECTIVES = {
  L_KU_1: 'Account for different conceptualizations of literacy in research and policy.',
  L_KU_2:
    'Describe and discuss the ways in which digital media and technologies can change the conditions for literacy practices in work, education and everyday life settings.',
  L_CS_1:
    'Observe and analyze communication and interaction in digital media and technologies and draw conclusions in relation to learning.',
  L_JA_1:
    'Analyze and evaluate argumentation in scientific literature about literacy in a digital world.',
};

/** ========= ENTRIES (add as you go) =========
 * Example shape:
 * {
 *   id: 'wk1-concepts',
 *   date: '2025-10-03',
 *   title: 'Week 1 – Concepts of literacy (reading notes)',
 *   type: 'Reading Notes',
 *   artifactUrl: '/assets/portfolio/pda676-wk1-notes.pdf',
 *   whySaved: 'Lorem ipsum.',
 *   outcomes: ['L_KU_1', 'L_JA_1'],
 *   reflection: 'Lorem ipsum.',
 *   tags: ['definitions', 'policy']
 * }
 */
const entries = [];

export default function PDA676() {
  const updated = new Date().toLocaleDateString();

  return (
    <main>
      {/* keep unindexed */}
      <meta name="robots" content="noindex,nofollow" />
      <h2>Literacies in a digital world (PDA676)</h2>
      <p style={{ opacity: 0.9, maxWidth: 820 }}>
        Systematic collection of course artifacts (notes, mini-analyses, prototypes) with when/why
        they were saved and reflections mapped to the PDA676 learning outcomes.
      </p>
      <p style={{ fontSize: 14, opacity: 0.7 }}>Updated: {updated}</p>

      {/* 1) Collection log */}
      <section style={{ marginTop: '1.5rem' }}>
        <h3>Collection log</h3>

        {entries.length === 0 ? (
          <p style={{ opacity: 0.75 }}>
            No artifacts yet. Add items to the <code>entries</code> array (see example in the file
            header).
          </p>
        ) : (
          <div
            style={{ display: 'grid', gap: '0.75rem' }}
            role="table"
            aria-label="Literacies portfolio log"
          >
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
        )}
      </section>

      {/* 2) Reflections ↔ Literacies outcomes */}
      <section style={{ marginTop: '2rem' }}>
        <h3>Reflections ↔ PDA676 learning outcomes</h3>
        <p style={{ opacity: 0.85, maxWidth: 820 }}>
          Each outcome links to any related artifacts and short reflections.
        </p>

        {Object.entries(LITERACIES_OBJECTIVES).map(([code, text]) => {
          const related = entries.filter((e) => e.outcomes.includes(code));
          return (
            <details key={code} open style={{ margin: '0.5rem 0' }}>
              <summary>
                <strong>{code}</strong> — {text}
              </summary>
              {related.length ? (
                <ul style={{ marginTop: '0.5rem' }}>
                  {related.map((e) => (
                    <li key={e.id}>
                      <em>{e.title}:</em> {e.reflection}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ opacity: 0.7, marginTop: '0.5rem' }}>No artifact mapped yet.</p>
              )}
            </details>
          );
        })}
      </section>
    </main>
  );
}
