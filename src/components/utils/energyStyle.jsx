const STYLE_ID = 'bb-energy-style';

const PALETTES = {
  ember: {
    ea: '18 42% 58%',
    eb: '32 46% 62%',
    ec: '142 28% 46%',
    ed: '350 36% 66%'
  },
  surge: {
    ea: '140 100% 48%',
    eb: '210 100% 60%',
    ec: '24 100% 58%',
    ed: '285 100% 70%'
  },
  royal: {
    ea: '220 90% 56%',
    eb: '220 80% 42%',
    ec: '0 0% 100%',
    ed: '220 25% 12%'
  }
};

function generateEnergyCSS(palette = 'surge') {
  const p = PALETTES[palette] || PALETTES.surge;
  
  return `
html.energy {
  --background: 228 35% 6%;
  --foreground: 0 0% 100%;
  --card: 228 28% 10%;
  --card-foreground: 0 0% 100%;
  --popover: 228 28% 10%;
  --popover-foreground: 0 0% 100%;
  --muted: 228 18% 14%;
  --muted-foreground: 220 10% 82%;
  --border: 228 18% 22%;
  --input: 228 18% 22%;
  --primary: ${p.ea};
  --primary-foreground: 0 0% 100%;
  --secondary: 228 20% 16%;
  --secondary-foreground: 0 0% 100%;
  --accent: ${p.ec};
  --accent-foreground: 0 0% 100%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 100%;
  --ring: ${p.ea};
  --chart-1: ${p.ea};
  --chart-2: ${p.eb};
  --chart-3: ${p.ec};
  --chart-4: ${p.ed};
  
  --ea: ${p.ea};
  --eb: ${p.eb};
  --ec: ${p.ec};
  --ed: ${p.ed};
  --energy-gradient: linear-gradient(135deg,
    hsl(var(--ea)),
    hsl(var(--eb)),
    hsl(var(--ed)),
    hsl(var(--ec))
  );
}

html.energy .bb-readable,
html.energy .bb-text-boost {
  color: hsl(var(--foreground));
  text-shadow: 0 1px 2px rgba(0,0,0,0.4);
}

html.energy .bb-text-boost {
  font-weight: 600;
  letter-spacing: 0.01em;
}

html.energy *:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}

html.energy[data-energy-palette="ember"] {
  --muted-foreground: 220 10% 85%;
}

html.energy[data-energy-palette="ember"] .bb-readable,
html.energy[data-energy-palette="ember"] .bb-text-boost {
  color: hsl(0 0% 98%);
}

html.energy[data-energy-palette="royal"] {
  --muted-foreground: 220 10% 88%;
}

html.energy[data-energy-palette="royal"] .bb-readable,
html.energy[data-energy-palette="royal"] .bb-text-boost {
  color: hsl(0 0% 100%);
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
}

html.energy body::before {
  content: "";
  position: fixed;
  inset: -120px;
  background: var(--energy-gradient);
  filter: blur(80px);
  opacity: 0.22;
  pointer-events: none;
  z-index: 0;
}

html.energy body::after {
  content: "";
  position: fixed;
  inset: 0;
  background:
    radial-gradient(circle at 20% 18%, hsla(210,100%,64%,0.14) 0%, transparent 45%),
    radial-gradient(circle at 84% 70%, hsla(285,100%,70%,0.12) 0%, transparent 55%);
  opacity: 0.22;
  pointer-events: none;
  z-index: 0;
}

#root {
  position: relative;
  z-index: 1;
}

html.energy .bb-energy-card,
html.energy [class*="card"],
html.energy [class*="rounded"] {
  background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(12px);
  box-shadow:
    0 0 0 1px rgba(80,160,255,0.10),
    0 22px 75px rgba(80,160,255,0.18),
    0 0 40px rgba(180,90,255,0.12);
}

html.energy .bb-shimmer {
  background: var(--energy-gradient);
  background-size: 220% 220%;
  animation: bbEnergyShift 4.2s ease infinite;
}

@keyframes bbEnergyShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

html.energy button,
html.energy a {
  transition: transform 140ms ease, filter 140ms ease, box-shadow 140ms ease;
}

html.energy button:active,
html.energy a:active {
  transform: scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  html.energy .bb-shimmer {
    animation: none;
  }
  html.energy button,
  html.energy a {
    transition: none;
  }
}
`;
}

const ENERGY_CSS = generateEnergyCSS('surge');

export function ensureEnergyStyleInjected(palette = 'surge') {
  const existing = document.getElementById(STYLE_ID);
  const css = generateEnergyCSS(palette);
  
  if (existing) {
    existing.textContent = css;
    return;
  }
  
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
}

export function removeEnergyStyle() {
  const existing = document.getElementById(STYLE_ID);
  if (existing) {
    existing.remove();
  }
}