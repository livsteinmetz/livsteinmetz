// Worst case for type on a painting: a pure white patch under the dark scrim.
// site/styles.css --scrim must match ALPHA.
const ALPHA = 0.68;
const v = (255 * (1 - ALPHA)).toString(16).split('.')[0].padStart(2, '0');
export const SCRIM = `#${v}${v}${v}`;
const lum = (hex) => {
  const c = hex.replace('#', '').match(/../g).map((h) => parseInt(h, 16) / 255).map((s) => (s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
export const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
