// src/index.js
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import ITLearningLayout from './components/it-learning/ITLearningLayout';
import ITLearningPortfolio from './components/it-learning/ITLearningPortfolio';
import PDA675 from './components/it-learning/pages/PDA675';
import PDA676 from './components/it-learning/pages/PDA676';
import ProgrammeHome from './components/it-learning/pages/ProgrammeHome';
import TIA130 from './components/it-learning/pages/TIA130';
import TIA132 from './components/it-learning/pages/TIA132';
import Liv from './components/Liv/Liv';

import './styles/index.scss';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Liv />} />

      <Route path="/it-learning" element={<ITLearningLayout />}>
        {/* Programme home */}
        <Route index element={<ProgrammeHome />} />
        {/* Courses */}
        <Route path="PDA675" element={<PDA675 />}>
          <Route path="portfolio" element={<ITLearningPortfolio />} />
        </Route>
        <Route path="PDA676" element={<PDA676 />} />
        <Route path="TIA130" element={<TIA130 />} />
        <Route path="TIA132" element={<TIA132 />} />
      </Route>

      {/* 404 fallback (optional) */}
      {/* <Route path="*" element={<Liv />} /> */}
    </Routes>
  </BrowserRouter>,
);
