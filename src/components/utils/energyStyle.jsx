const STYLE_ID = 'bb-energy-style';

const PALETTES = {
  petal: {
    ea: '345 58% 68%',
    eb: '18 55% 78%',
    ec: '275 45% 82%',
    ed: '42 55% 84%'
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

html.energy[data-energy-palette="petal"] {
  --background: 0 0% 97%;
  --foreground: 222 22% 18%;
  --card: 0 0% 100%;
  --card-foreground: 222 22% 18%;
  --muted: 0 0% 95%;
  --muted-foreground: 222 14% 38%;
  --border: 220 18% 88%;
  --input: 220 18% 88%;
  --primary: var(--ea);
  --primary-foreground: 0 0% 100%;
  --accent: var(--ec);
  --accent-foreground: 222 22% 18%;
  --ring: var(--ea);
}

html.energy[data-energy-palette="petal"] body::before {
  background: linear-gradient(135deg,
    hsl(345 58% 68% / 0.28),
    hsl(18 55% 78% / 0.24),
    hsl(275 45% 82% / 0.26)
  );
  filter: blur(70px);
  opacity: 0.30;
}

html.energy[data-energy-palette="petal"] body::after {
  background:
    radial-gradient(circle at 20% 18%, hsla(345,58%,68%,0.08) 0%, transparent 45%),
    radial-gradient(circle at 84% 70%, hsla(275,45%,82%,0.08) 0%, transparent 55%);
  opacity: 0.15;
}

html.energy[data-energy-palette="petal"] .bb-energy-card {
  background: linear-gradient(180deg,
    rgba(255,255,255,0.96),
    rgba(255,255,255,0.90)
  );
  border: 1px solid rgba(20,20,40,0.06);
  box-shadow:
    0 14px 34px rgba(20,20,40,0.08),
    0 1px 0 rgba(255,255,255,0.9) inset;
}

html.energy[data-energy-palette="petal"] [class*="card"],
html.energy[data-energy-palette="petal"] [class*="rounded"] {
  background: linear-gradient(180deg,
    rgba(255,255,255,0.96),
    rgba(255,255,255,0.90)
  );
  border: 1px solid rgba(20,20,40,0.06);
  backdrop-filter: blur(8px);
  box-shadow:
    0 14px 34px rgba(20,20,40,0.08),
    0 1px 0 rgba(255,255,255,0.9) inset;
}

html.energy[data-energy-palette="petal"] button {
  border-color: rgba(20,20,40,0.08);
}

html.energy[data-energy-palette="petal"] .chapter-tile,
html.energy[data-energy-palette="petal"] [data-chapter-tile="true"] {
  background: linear-gradient(180deg,
    rgba(255,255,255,0.92),
    rgba(255,255,255,0.86)
  );
  border: 1px solid rgba(20,20,40,0.07);
}

html.energy[data-energy-palette="petal"] .bb-shimmer {
  background: linear-gradient(90deg,
    hsl(345 58% 68%),
    hsl(18 55% 78%),
    hsl(275 45% 82%)
  );
  background-size: 180% 100%;
  animation: petalFlow 6s ease infinite;
}

@keyframes petalFlow {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}

html.energy[data-energy-palette="petal"] .bb-readable,
html.energy[data-energy-palette="petal"] .bb-text-boost {
  color: hsl(222 22% 18%);
  text-shadow: 0 0.5px 1px rgba(255,255,255,0.6);
}

html.energy[data-energy-palette="petal"] [class*="ComboPill"],
html.energy[data-energy-palette="petal"] [class*="combo"] {
  display: none;
}

html.energy[data-energy-palette="petal"] .this-week-bar,
html.energy[data-energy-palette="petal"] [data-week-bar="true"],
html.energy[data-energy-palette="petal"] .week-pill,
html.energy[data-energy-palette="petal"] .weekly-bar,
html.energy[data-energy-palette="petal"] [class*="week"] [class*="bar"] {
  background: linear-gradient(180deg,
    rgba(255,255,255,0.92),
    rgba(255,255,255,0.82)
  ) !important;
  border: 1px solid rgba(20,20,40,0.08) !important;
  box-shadow: 0 10px 22px rgba(20,20,40,0.06) !important;
}

html.energy[data-energy-palette="petal"] .this-week-bar.is-active,
html.energy[data-energy-palette="petal"] [data-week-bar="true"][data-active="true"],
html.energy[data-energy-palette="petal"] [class*="week"] [class*="active"] {
  background: linear-gradient(180deg,
    hsl(345 58% 92%),
    hsl(345 58% 84%)
  ) !important;
  border-color: rgba(180,60,110,0.18) !important;
}

html.energy[data-energy-palette="petal"] [class*="text-orange"],
html.energy[data-energy-palette="petal"] [class*="text-yellow"],
html.energy[data-energy-palette="petal"] [class*="text-amber"],
html.energy[data-energy-palette="petal"] .text-orange-500,
html.energy[data-energy-palette="petal"] .text-orange-600,
html.energy[data-energy-palette="petal"] .text-yellow-500 {
  color: hsl(345 58% 68%) !important;
}

html.energy[data-energy-palette="petal"] [class*="bg-orange"],
html.energy[data-energy-palette="petal"] [class*="bg-yellow"],
html.energy[data-energy-palette="petal"] [class*="bg-amber"],
html.energy[data-energy-palette="petal"] [class*="bg-black"],
html.energy[data-energy-palette="petal"] [class*="bg-slate-9"] {
  background: linear-gradient(180deg,
    rgba(255,255,255,0.92),
    rgba(255,255,255,0.82)
  ) !important;
  border: 1px solid rgba(20,20,40,0.08) !important;
}

html.energy[data-energy-palette="petal"] [class*="border-orange"],
html.energy[data-energy-palette="petal"] [class*="border-yellow"],
html.energy[data-energy-palette="petal"] [class*="border-black"] {
  border-color: rgba(20,20,40,0.08) !important;
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