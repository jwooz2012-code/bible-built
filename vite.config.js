import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Published build only: load the app's style file without blocking the first
// paint, so the startup screen in index.html (styled inline) shows the moment
// the page arrives instead of a white screen. main.jsx waits on
// window.__bbStyles before drawing the app, so nothing shows unstyled.
function nonBlockingStyles() {
  return {
    name: 'bb-non-blocking-styles',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const link = /<link rel="stylesheet"([^>]*?) href="([^"]+\.css)"([^>]*)>/g;
        if (!link.test(html)) return html;
        const done = "window.__bbStylesReady&&window.__bbStylesReady()";
        return html
          .replace('<head>', '<head>\n    <script>window.__bbStyles=new Promise(function(r){window.__bbStylesReady=r;setTimeout(r,8000);});</script>')
          .replace(link, (m, before, href, after) =>
            `<link rel="stylesheet"${before} href="${href}"${after} media="print" onload="this.media='all';${done}" onerror="${done}">`);
      },
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  plugins: [
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      visualEditAgent: true
    }),
    react(),
    nonBlockingStyles(),
  ]
});