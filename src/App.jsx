// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Academic from './components/Academic/Academic';
import Liv from './components/Liv/Liv';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Liv />} />
        <Route path="/academic-portfolio" element={<Academic />} />
      </Routes>
    </BrowserRouter>
  );
}
