import React from 'react';
import { Link } from 'react-router-dom';

export default function ProgrammeHome() {
  const updated = new Date().toLocaleDateString();

  return (
    <main>
      <h2 style={{ marginTop: 0 }}>Programme overview</h2>
      <p style={{ opacity: 0.9, maxWidth: 820 }}>
        Mandatory courses (each 15 HEC) with links to notes and artifacts.
      </p>

      <ul style={{ lineHeight: 1.8 }}>
        <li>
          <Link to="/it-learning/PDA675">Technology, knowledge and learning: an introduction</Link>,
          15 HEC
        </li>
        <li>
          <Link to="/it-learning/PDA676">Literacies in a digital world</Link>, 15 HEC
        </li>
        <li>
          <Link to="/it-learning/TIA130">
            Applied research methods and design for information technologies and learning
          </Link>
          , 15 HEC
        </li>
        <li>
          <Link to="/it-learning/TIA132">Digital tools for communication and learning</Link>, 15 HEC
        </li>
      </ul>

      <p style={{ fontSize: 14, opacity: 0.7 }}>Updated: {updated}</p>
    </main>
  );
}
