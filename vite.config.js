import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Published build only. The startup screen in index.html is styled inline, so it
// can show the moment the page arrives. The app's code and style file are then
// loaded right after the page reports it has finished loading, instead of the
// page waiting for them first: app wrappers like the iPhone app keep a white
// screen up until that "finished" signal, so with the code (1.6 MB) holding it
// back, a reopen on a slow connection showed white for seconds. main.jsx waits
// on window.__bbStyles before drawing the app, so nothing shows unstyled.
function startAfterLoad() {
  return {
    name: 'bb-start-after-load',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const script = /\s*<script type="module" crossorigin src="([^"]+\.js)"><\/script>/;
        const style = /\s*<link rel="stylesheet" crossorigin href="([^"]+\.css)">/;
        const js = html.match(script)?.[1];
        const css = html.match(style)?.[1];
        if (!js || !css) return html;
        const loader = `
    <script>
      (function () {
        function start() {
          var css = document.createElement('link');
          css.rel = 'stylesheet'; css.crossOrigin = ''; css.href = '${css}';
          css.onload = css.onerror = function () { window.__bbStylesReady && window.__bbStylesReady(); };
          document.head.appendChild(css);
          var js = document.createElement('script');
          js.type = 'module'; js.crossOrigin = ''; js.src = '${js}';
          document.head.appendChild(js);
        }
        if (document.readyState === 'complete') start();
        else window.addEventListener('load', start);
      })();
    </script>
  </body>`;
        return html
          .replace('<head>', '<head>\n    <script>window.__bbStyles=new Promise(function(r){window.__bbStylesReady=r;setTimeout(r,8000);});</script>')
          .replace(script, '')
          .replace(style, '')
          .replace('</body>', loader);
      },
    },
  };
}

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
    startAfterLoad(),
  ]
});