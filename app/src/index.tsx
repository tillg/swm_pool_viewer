import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { Impressum } from './pages/Impressum';
import { Todo } from './pages/Todo';
import { TechExplain } from './pages/TechExplain';
import { Faq } from './pages/Faq';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <HashRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/todo" element={<Todo />} />
          <Route path="/tech" element={<TechExplain />} />
          <Route path="/faq" element={<Faq />} />
        </Routes>
      </HashRouter>
    </React.StrictMode>
  );
}
