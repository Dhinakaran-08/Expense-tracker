import { format, parseISO } from 'date-fns';

/**
 * Formats any ISO date or string into Indian format DD/MM/YYYY
 * e.g. "2026-10-12" -> "12/10/2026"
 */
export function formatIndianDate(dateInput) {
  if (!dateInput) return '—';
  
  if (typeof dateInput === 'string') {
    const clean = dateInput.trim();
    // Fast path for YYYY-MM-DD or ISO strings:
    const isoMatch = clean.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      return `${day}/${month}/${year}`;
    }
    // If already in DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(clean)) {
      return clean;
    }
  }

  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput);
    if (!isNaN(d.getTime())) {
      return format(d, 'dd/MM/yyyy');
    }
  } catch {
    // fallback
  }

  return String(dateInput);
}
