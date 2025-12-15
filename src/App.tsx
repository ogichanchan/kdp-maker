import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { HowTo } from './pages/HowTo';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/howto" element={<HowTo />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
