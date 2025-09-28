import React from 'react';
import { Link, Outlet } from 'react-router-dom';

import OutcomeMap from '../visual/OutcomeMap';

/** PDA675 outcomes — human readable */
const OUTCOMES = [
  {
    id: 'ku-compare-perspectives',
    familyKey: 'KU',
    number: 1,
    title: 'Compare central perspectives',
    description: 'Account for and compare central perspectives on learning.',
  },
  {
    id: 'ku-relate-perspectives-design',
    familyKey: 'KU',
    number: 2,
    title: 'Relate perspectives to design/research',
    description:
      'Discuss the relationship between central perspectives on learning and applied design to research and practice in the field of IT and Learning.',
  },
  {
    id: 'cs-assemble-literature',
    familyKey: 'CS',
    number: 1,
    title: 'Assemble literature for a question',
    description:
      'Assemble a selection of research literature in the field of IT and Learning for a defined question or topic.',
  },
  {
    id: 'cs-present-arguments',
    familyKey: 'CS',
    number: 2,
    title: 'Present arguments from literature',
    description:
      'Present arguments based on the research literature in the form of an academic paper.',
  },
  {
    id: 'ja-analyze-recent-research',
    familyKey: 'JA',
    number: 1,
    title: 'Critically analyze recent research',
    description:
      'Critically analyze and discuss recent research in relation to central perspectives on learning within the field of IT and Learning.',
  },
  {
    id: 'ja-reflect-future-work',
    familyKey: 'JA',
    number: 2,
    title: 'Reflect for future work life',
    description:
      'Reflect on and document their own knowledge and experience in relation to future work life possibilities.',
  },
];

/** Artifacts */
const entries = [
  {
    id: 'lr-tech-mediated-experiential',
    date: '2025-09-22',
    title: 'Technology-Mediated Experiential Learning & Close Looking in Museum Education',
    type: 'Literature Review (in progress)',
    artifactUrl: '/assets/portfolio/pda675-entry1-tech-mediated-experiential-learning.pdf',
    whySaved:
      'Initial literature review draft: defines research question; documents method (Scopus query, inclusion/exclusion, 6 studies); synthesizes Dewey + constructivism with tech-mediated close/slow looking.',
    outcomes: [
      'ku-compare-perspectives',
      'ku-relate-perspectives-design',
      'cs-assemble-literature',
      'cs-present-arguments',
      'ja-analyze-recent-research',
      'ja-reflect-future-work',
    ],
    reflection:
      'Across 6 recent studies, immersion and social discussion appear to drive outcomes more than slow-looking instructions alone. Interactivity increases agency but needs scaffolding to sustain attention; participatory design (e.g., IMEM) deepens ownership. Open questions: long-term impacts, digital vs in-person comparisons, effects across learner groups.',
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
    artifactUrl: '/assets/portfolio/pda675-entry2-reciprocal-tracking-self-understanding.pdf',
    whySaved:
      'Synthesizes CHI ’25 “Peerspective” with personal informatics to explore bidirectional peer tracking for uncovering blind spots and reflective learning; extracts design considerations (privacy, tone, burden) for instructional UI patterns.',
    outcomes: [
      'ku-compare-perspectives',
      'ku-relate-perspectives-design',
      'cs-assemble-literature',
      'cs-present-arguments',
      'ja-analyze-recent-research',
      'ja-reflect-future-work',
    ],
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

export default function PDA675() {
  return (
    <section>
      <h1>Technology, knowledge and learning: an introduction (PDA675)</h1>
      <p style={{ opacity: 0.9, maxWidth: 820 }}>
        Course hub with links to the digital portfolio and literature review artifacts.
      </p>
      <ul style={{ lineHeight: 1.8 }}>
        <li>
          <Link to="portfolio">Digital portfolio (3 HEC)</Link>
        </li>
        <li>Written exam (5 HEC) — placeholder</li>
        <li>Literature review paper (7 HEC) — placeholder</li>
      </ul>

      <h3 style={{ marginTop: '2rem' }}>Outcome map</h3>
      <p style={{ opacity: 0.85, maxWidth: 820 }}>
        Use the family buttons and the chips with full names to filter. Hover nodes for details.
      </p>
      <OutcomeMap outcomes={OUTCOMES} entries={entries} height={380} />

      <Outlet />
    </section>
  );
}
