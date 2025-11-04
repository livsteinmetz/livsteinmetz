// src/utils/format.ts

/**
 * Format a date value as "Mon DD, YYYY" (e.g. "Nov 3, 2025")
 */
export function fmtDate(value?: string | number | Date): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/**
 * Map an objective category to a color.
 * These colors mirror the CSS vars in _tokens.scss.
 */
export function colorForCategory(category: string): string {
  if (category.startsWith('Knowledge')) return '#5E81AC'; // blue
  if (category.startsWith('Competence')) return '#A3BE8C'; // green
  if (category.startsWith('Judgement')) return '#D08770'; // orange
  if (category.startsWith('Local outcomes — Competence')) return '#B48EAD'; // purple
  if (category.startsWith('Local outcomes — Judgement')) return '#EBCB8B'; // yellow
  return '#888888'; // neutral
}
