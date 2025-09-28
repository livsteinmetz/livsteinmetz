import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

export const PROGRAM_OBJECTIVES = {
  P_1: 'Further develop the ability of students to integrate and make autonomous use of their knowledge.',
  P_2: "Develop the students' ability to deal with complex phenomena, issues and situations.",
  P_3: "Develop the students' potential for professional activities that demand considerable autonomy, or for research and development work.",
  G_KU_1:
    'Demonstrate knowledge and understanding in the main field of study, including both broad knowledge of the field and a considerable degree of specialised knowledge in certain areas of the field as well as insight into current research and development work.',
  G_KU_2: 'Demonstrate specialised methodological knowledge in the main field of study.',
  G_CS_1:
    'Demonstrate the ability to critically and systematically integrate knowledge and analyse, assess and deal with complex phenomena, issues and situations even with limited information.',
  G_CS_2:
    'Demonstrate the ability to identify and formulate issues critically, autonomously and creatively as well as to plan and, using appropriate methods, undertake advanced tasks within predetermined time frames and so contribute to the formation of knowledge as well as the ability to evaluate this work.',
  G_CS_3:
    'Demonstrate the ability in speech and writing both nationally and internationally to clearly report and discuss his or her conclusions and the knowledge and arguments on which they are based in dialogue with different audiences.',
  G_CS_4:
    'Demonstrate the skills required for participation in research and development work or autonomous employment in some other qualified capacity.',
  G_JA_1:
    'Demonstrate the ability to make assessments in the main field of study informed by relevant disciplinary, social and ethical issues and also to demonstrate awareness of ethical aspects of research and development work.',
  G_JA_2:
    'Demonstrate insight into the possibilities and limitations of research, its role in society and the responsibility of the individual for how it is used.',
  G_JA_3:
    'Demonstrate the ability to identify the personal need for further knowledge and take responsibility for his or her ongoing learning.',
  PL_CS_1:
    'Demonstrate ability to analyse the relationship between the historical development of information technologies and the changing premises for communication and learning.',
  PL_CS_2:
    'Describe and conceptualise how knowledge and learning is organised in institutions, working life and society based on current research and relevant theoretical approaches.',
  PL_JA_1:
    'Critically investigate, analyse and discuss the interaction between users and information technologies in institutions, working life and society.',
  PL_JA_2:
    'Evaluate and adapt the design of digital environments for communication and learning in institutions, working life and society.',
};

export default function ITLearningLayout() {
  const { pathname } = useLocation();
  const isActive = (to) => pathname === to || pathname.startsWith(`${to}/`);

  const linkStyle = (to) => ({
    padding: '0.4rem 0.6rem',
    borderRadius: 8,
    textDecoration: 'none',
    border: isActive(to) ? '1px solid rgba(0,0,0,.15)' : '1px solid transparent',
    background: isActive(to) ? 'rgba(0,0,0,.04)' : 'transparent',
  });

  return (
    <div style={{ padding: '2rem 1.25rem', maxWidth: 1040, margin: '0 auto' }}>
      {/* keep unindexed */}
      <meta name="robots" content="noindex,nofollow" />

      <header style={{ marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>IT &amp; Learning</h1>
        <p style={{ opacity: 0.85, marginTop: 6 }}>
          Programme hub with course pages and portfolio links.
        </p>
      </header>

      {/* Primary nav for the programme */}
      <nav
        aria-label="IT & Learning navigation"
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
      >
        <Link to="/it-learning" style={linkStyle('/it-learning')}>
          Overview
        </Link>
        <Link to="/it-learning/PDA675" style={linkStyle('/it-learning/PDA675')}>
          Technology, knowledge &amp; learning
        </Link>
        <Link to="/it-learning/PDA676" style={linkStyle('/it-learning/PDA676')}>
          Literacies in a digital world
        </Link>
        <Link to="/it-learning/TIA130" style={linkStyle('/it-learning/TIA130')}>
          Applied research methods &amp; design
        </Link>
        <Link to="/it-learning/TIA132" style={linkStyle('/it-learning/TIA132')}>
          Digital tools for communication &amp; learning
        </Link>
      </nav>

      {/* Nested pages render here */}
      <div style={{ marginTop: '1.5rem' }}>
        <Outlet />
      </div>

      {/* Programme objectives (verbatim)
      <section style={{ marginTop: '2.5rem' }}>
        <details>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
            Evidence ↔ Programme objectives (in progress)
          </summary>
          <ul style={{ lineHeight: 1.6, marginTop: '0.75rem' }}>
            {Object.entries(PROGRAM_OBJECTIVES).map(([code, text]) => (
              <li key={code}>
                <strong>{code}</strong> — {text}
              </li>
            ))}
          </ul>
        </details>
      </section> */}
    </div>
  );
}
