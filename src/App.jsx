// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import ITLearningLayout from './components/it-learning/ITLearningLayout';
import ITLearningPortfolio from './components/it-learning/ITLearningPortfolio';
import Liv from './components/Liv/Liv';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Liv />} />
        <Route path="/it-learning" element={<ITLearningLayout />}>
          <Route path="PDA-675" element={<ITLearningPortfolio />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
