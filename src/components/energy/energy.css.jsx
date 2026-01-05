/* Energy Mode Visual Enhancements */
/* These classes only activate when html.energy is present */

/* Gradient border effect */
html.energy .energy-border {
  position: relative;
  border: 2px solid transparent;
  background-clip: padding-box;
}

html.energy .energy-border::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: var(--energy-gradient);
  z-index: -1;
  opacity: 0.8;
}

/* Glow card effect */
html.energy .energy-card {
  box-shadow: 
    0 0 20px hsl(var(--energy-glow)),
    0 0 40px hsl(var(--energy-glow)),
    0 4px 6px -1px rgb(0 0 0 / 0.1);
  transition: box-shadow 0.3s ease;
}

html.energy .energy-card:hover {
  box-shadow: 
    0 0 30px hsl(var(--energy-glow)),
    0 0 60px hsl(var(--energy-glow)),
    0 10px 15px -3px rgb(0 0 0 / 0.1);
}

/* Ambient background blob */
html.energy .energy-ambient {
  position: relative;
  overflow: hidden;
}

html.energy .energy-ambient::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: var(--energy-gradient);
  opacity: 0.08;
  filter: blur(80px);
  animation: energy-rotate 20s linear infinite;
  pointer-events: none;
  z-index: 0;
}

/* Shimmer animation for progress bars and badges */
html.energy .energy-shimmer {
  position: relative;
  overflow: hidden;
}

html.energy .energy-shimmer::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: energy-shimmer 2s infinite;
}

/* Pulse effect for active elements */
html.energy .energy-pulse {
  animation: energy-pulse 2s ease-in-out infinite;
}

/* Keyframes */
@keyframes energy-shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes energy-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes energy-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
}

/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  html.energy .energy-shimmer::after,
  html.energy .energy-ambient::before,
  html.energy .energy-pulse {
    animation: none;
  }
}

/* Text with energy gradient */
html.energy .energy-text {
  background: var(--energy-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Energy glow text shadow */
html.energy .energy-glow-text {
  text-shadow: 
    0 0 10px hsl(var(--energy-glow)),
    0 0 20px hsl(var(--energy-glow));
}

/* Badge styling in energy mode */
html.energy .energy-badge {
  background: var(--energy-gradient);
  color: var(--badge-text);
  font-weight: 600;
}

/* Active nav item in energy mode */
html.energy .energy-nav-active {
  background: var(--energy-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

html.energy .energy-nav-active-indicator {
  background: var(--energy-gradient);
}