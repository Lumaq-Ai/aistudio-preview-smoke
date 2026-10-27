import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return React.createElement('main', null, React.createElement('h1', null, 'Hello from the AI Studio preview smoke'));
}

createRoot(document.getElementById('root')).render(React.createElement(App));
