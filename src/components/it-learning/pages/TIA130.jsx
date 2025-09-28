import React from 'react';

/** ========= TIA130 LEARNING OUTCOMES (verbatim) =========
 * Codes for mapping:
 * R_KU_* = Knowledge & Understanding
 * R_CS_* = Competence & Skills
 * R_JA_* = Judgement & Approach
 */
const METHODS_OBJECTIVES = {
  R_KU_1:
    'Describe how qualitative, quantitative, and design-based research methods could be used for conducting research on IT and Learning;',
  R_KU_2: 'Explain key concepts in research method traditions within the social sciences;',
  R_CS_1:
    'Discuss the possibilities and limitations of different research methods in relation to knowledge requirements, research questions and empirical material;',
  R_CS_2:
    'Formulate a research design for a potential study within the research area of educational technology;',
  R_JA_1:
    'Motivate methodological choices based on research ethical considerations and principles;',
  R_JA_2:
    'Provide peer review and defend a research design plan based on scientific considerations.',
};

/** ========= ENTRIES (add as you go) =========
 * Example shape:
 * {
 *   id: 'wk2-research-questions',
 *   date: '2025-10-08',
 *   title: 'Workshop – framing research questions',
 *   type: 'Workshop Notes',
 *   artifactUrl: '/assets/portfolio/tia130-wk2-rqs.pdf',
 *   whySaved: 'Lorem ipsum.',
 *   outcomes: ['R_CS_1', 'R_JA_1'],
 *   reflection: 'Lorem ipsum.',
 *   tags: ['methods','rqs']
 * }
 */
const entries = [];

export default function TIA130() {
  const updated = new Date().toLocaleDateString();

  return (
    <main>
      {/* keep unindexed */}
      <meta name="robots" content="noindex,nofollow" />
      <h2>Applied research methods &amp; design (TIA130)</h2>
      <p style={{ opacity: 0.9, maxWidth: 820 }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curate notes, tasks, and artifacts
        and map them to the learning outcomes below.
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
            aria-label="TIA130 portfolio log"
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

      {/* 2) Reflections ↔ TIA130 outcomes */}
      <section style={{ marginTop: '2rem' }}>
        <h3>Reflections ↔ TIA130 learning outcomes</h3>
        <p style={{ opacity: 0.85, maxWidth: 820 }}>
          Each outcome links to any related artifacts and short reflections.
        </p>

        {Object.entries(METHODS_OBJECTIVES).map(([code, text]) => {
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
