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