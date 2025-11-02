// src/index.js
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Liv from './components/Liv/Liv';

import './styles/index.scss';
import Academic from './components/Academic/Academic';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Liv />} />
      <Route path="/academic-portfolio" element={<Academic />} />
    </Routes>
  </BrowserRouter>,
);
