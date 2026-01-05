const STYLE_ID = 'bb-energy-style';

const ENERGY_CSS = `
html.energy {
  --background: 228 35% 6%;
  --foreground: 0 0% 100%;
  --card: 228 28% 10%;
  --card-foreground: 0 0% 100%;
  --popover: 228 28% 10%;
  --popover-foreground: 0 0% 100%;
  --muted: 228 18% 14%;
  --muted-foreground: 220 10% 78%;
  --border: 228 18% 22%;
  --input: 228 18% 22%;
  --primary: 210 100% 64%;
  --primary-foreground: 0 0% 100%;
  --secondary: 228 20% 16%;
  --secondary-foreground: 0 0% 100%;
  --accent: 160 100% 45%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 100%;
  --ring: 210 100% 64%;
  --chart-1: 210 100% 64%;
  --chart-2: 285 100% 70%;
  --chart-3: 160 100% 45%;
  --chart-4: 42 100% 60%;
  --chart-5: 335 100% 70%;
}

html.energy body::before {
  content: "";
  position: fixed;
  inset: -140px;
  background: linear-gradient(135deg,
    hsl(42 100% 60%),
    hsl(285 100% 70%),
    hsl(210 100% 64%),
    hsl(160 100% 45%)
  );
  filter: blur(110px);
  opacity: 0.38;
  pointer-events: none;
  z-index: 0;
}

html.energy body::after {
  content: "";
  position: fixed;
  inset: 0;
  background:
    radial-gradient(circle at 20% 18%, hsla(210,100%,64%,0.24) 0%, transparent 45%),
    radial-gradient(circle at 84% 70%, hsla(285,100%,70%,0.20) 0%, transparent 55%),
    radial-gradient(circle at 55% 12%, hsla(160,100%,45%,0.14) 0%, transparent 40%);
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
  background: linear-gradient(135deg,
    hsl(42 100% 60%),
    hsl(285 100% 70%),
    hsl(210 100% 64%),
    hsl(160 100% 45%)
  );
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

export function ensureEnergyStyleInjected() {
  if (document.getElementById(STYLE_ID)) {
    return;
  }
  
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = ENERGY_CSS;
  document.head.appendChild(style);
}

export function removeEnergyStyle() {
  const existing = document.getElementById(STYLE_ID);
  if (existing) {
    existing.remove();
  }
}