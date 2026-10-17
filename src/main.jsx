import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import AppErrorBoundary from '@/components/AppErrorBoundary'
import '@/index.css'

const root = ReactDOM.createRoot(document.getElementById('root'))

// In the published app the style file loads without holding back the startup
// screen (see vite.config.js); draw the app once it has arrived so nothing
// shows unstyled. In development there is no wait.
;(window.__bbStyles || Promise.resolve()).then(() => {
  root.render(
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  )
})
