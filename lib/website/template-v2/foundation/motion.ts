/**
 * Shared motion keyframes and entrance bindings for all V2 flagship templates.
 */
export function buildFoundationMotionCss(): string {
  return `
/* Design Foundation — motion */
@keyframes df-reveal-up {
  from { opacity: 0; transform: translateY(24px); filter: blur(4px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}
@keyframes df-reveal-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes df-slide-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes df-scale-in {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes df-draw-line {
  from { transform: scaleX(0); opacity: 0; }
  to { transform: scaleX(1); opacity: 1; }
}

.v2-motion[data-entrance="slide-up"],
.v2-motion[data-entrance="fade-in"] {
  animation-duration: var(--df-motion-base);
  animation-timing-function: var(--df-motion-ease);
  animation-fill-mode: both;
}
.v2-motion[data-entrance="slide-up"] { animation-name: df-reveal-up; }
.v2-motion[data-entrance="fade-in"] { animation-name: df-reveal-fade; }

.df-animate-reveal {
  animation: df-reveal-up var(--df-motion-slow) var(--df-motion-ease) both;
}
.df-animate-slide-up {
  animation: df-slide-up var(--df-motion-base) var(--df-motion-ease) both;
}

@media (prefers-reduced-motion: reduce) {
  .v2-motion, [data-v2-motion], .df-animate-reveal, .df-animate-slide-up {
    animation: none !important;
    transition: none !important;
  }
}
`.trim();
}
