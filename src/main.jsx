import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Register Service Worker for background notifications
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').catch(err => {
    console.warn('[App] Service Worker registration failed:', err);
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)