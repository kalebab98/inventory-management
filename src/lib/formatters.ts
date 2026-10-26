/**
 * Deterministic currency and number formatters for Next.js SSR & Client hydration consistency.
 * Avoids browser-locale vs Node.js discrepancies (e.g. non-breaking spaces \u00A0 or 'Br' vs 'ETB').
 */

export function formatCurrency(amount: number | string | undefined | null, currency: string = 'ETB'): string {
  const num = Math.round(Number(amount) || 0);
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${currency} ${formatted}`;
}

export function formatNumber(num: number | string | undefined | null): string {
  const val = Math.round(Number(num) || 0);
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatDateTime(isoString: string | undefined | null): string {
  if (!isoString) return '';
  const clean = isoString.replace('T', ' ').replace('Z', '');
  return clean.substring(0, 16);
}

export function formatDate(isoString: string | undefined | null): string {
  if (!isoString) return '';
  return isoString.split('T')[0];
}
