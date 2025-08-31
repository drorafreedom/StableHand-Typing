// src/utils/color.ts

// src/utils/color.ts
export function hexToRgba(hex: string | undefined | null, alpha: number = 1): string {
  const safeAlpha = Number.isFinite(alpha) ? Math.max(0, Math.min(1, alpha)) : 1;

  if (!hex || typeof hex !== 'string') return `rgba(255, 255, 255, ${safeAlpha})`;

  const h = hex.replace('#', '');
  let r = 255, g = 255, b = 255;

  if (h.length === 3) {
    r = parseInt(h[0] + h[0], 16);
    g = parseInt(h[1] + h[1], 16);
    b = parseInt(h[2] + h[2], 16);
  } else if (h.length === 6) {
    r = parseInt(h.slice(0, 2), 16);
    g = parseInt(h.slice(2, 4), 16);
    b = parseInt(h.slice(4, 6), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
}



/* export function hexToRgba(hex: string, alpha = 1) {
  let h = hex.replace('#', '').trim();
  let r = 255, g = 255, b = 255, a = 255;
  if (h.length === 3) {
    r = parseInt(h[0] + h[0], 16);
    g = parseInt(h[1] + h[1], 16);
    b = parseInt(h[2] + h[2], 16);
  } else if (h.length === 6 || h.length === 8) {
    r = parseInt(h.slice(0, 2), 16);
    g = parseInt(h.slice(2, 4), 16);
    b = parseInt(h.slice(4, 6), 16);
    if (h.length === 8) a = parseInt(h.slice(6, 8), 16);
  }
  const finalAlpha = Math.max(0, Math.min(1, (a / 255) * alpha));
  return `rgba(${r}, ${g}, ${b}, ${finalAlpha})`;
}
 */