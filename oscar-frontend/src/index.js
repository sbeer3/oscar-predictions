import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App'; // Import App component

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App /> {/* Render the App component */}
  </React.StrictMode>
);