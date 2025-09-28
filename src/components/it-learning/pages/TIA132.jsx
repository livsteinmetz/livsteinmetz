import React from 'react';

/** ========= TIA132 LEARNING OUTCOMES (verbatim) =========
 * Codes for mapping on this page:
 * D_KU_* = Knowledge & Understanding
 * D_CS_* = Competence & Skills
 * D_JA_* = Judgement & Approach
 */
const DIGITAL_TOOLS_OBJECTIVES = {
  // Knowledge & understanding
  D_KU_1: 'Describe a design-oriented approach to develop and evaluate IT-support;',
  D_KU_2: 'Describe common methods to develop IT-support for learning;',
  D_KU_3: 'Describe how technology can be understood as part of social practices;',
  D_KU_4:
    'Show an understanding of how different theories to analyze learning are integrated with technology;',

  // Competence & skills
  D_CS_1:
    'Analyze IT-support for learning and describe consequences of choice of technique and implementation in specific contexts;',
  D_CS_2:
    'Evaluate and choose relevant methods for the development of IT-supported learning activities;',
  D_CS_3: 'Apply common design methods to develop IT-support for learning;',
  D_CS_4: 'Apply common design methods to evaluate IT-support for learning;',

  // Judgement & approach
  D_JA_1:
    'Evaluate IT-support in relation to a practices specific goals for learning and education.',
};

/** ========= ENTRIES (add as you go) =========
 * Example:
 * {
 *   id: 'wk3-wireflows',
 *   date: '2025-10-15',
 *   title: 'Wireflows for activity design',
 *   type: 'Prototype',
 *   artifactUrl: '/assets/portfolio/tia132-wireflows.pdf',
 *   whySaved: 'Lorem ipsum.',
 *   outcomes: ['D_CS_3','D_CS_4'],
 *   reflection: 'Lorem ipsum.',
 *   tags: ['prototype','evaluation']
 * }
 */
const entries = [];

export default function TIA132() {
  const updated = new Date().toLocaleDateString();

  return (
    <main>
      {/* keep unindexed */}
      <meta name="robots" content="noindex,nofollow" />
      <h2>Digital tools for communication &amp; learning (TIA132)</h2>
      <p style={{ opacity: 0.9, maxWidth: 820 }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curate artifacts from this course
        and map them to the outcomes below.
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
            aria-label="TIA132 portfolio log"
          >
            <div
              role="row"
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr 160px 1fr 260px',
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
                  gridTemplateColumns: '120px 1fr 160px 1fr 260px',
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

      {/* 2) Reflections ↔ TIA132 outcomes */}
      <section style={{ marginTop: '2rem' }}>
        <h3>Reflections ↔ TIA132 learning outcomes</h3>
        <p style={{ opacity: 0.85, maxWidth: 820 }}>
          Each outcome links to any related artifacts and short reflections.
        </p>

        {Object.entries(DIGITAL_TOOLS_OBJECTIVES).map(([code, text]) => {
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
