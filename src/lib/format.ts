import { format, formatDistanceToNow, isValid } from 'date-fns';

function toDate(value: string | number | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return isValid(date) ? date : null;
}

export function formatDate(value: string | number | Date, pattern = 'dd MMM yyyy'): string {
  const date = toDate(value);
  return date ? format(date, pattern) : '—';
}

export function formatDateTime(value: string | number | Date): string {
  return formatDate(value, 'dd MMM yyyy, h:mm a');
}

export function formatRelative(value: string | number | Date): string {
  const date = toDate(value);
  return date ? formatDistanceToNow(date, { addSuffix: true }) : '—';
}

/** Seconds → "mm:ss" (or "h:mm:ss" past an hour). For the exam timer. */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const mmss = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return hours > 0 ? `${hours}:${mmss}` : mmss;
}

/** Minutes → "24 min" / "1 hr 30 min". Exam durations are stored in minutes. */
export function formatMinutes(totalMinutes: number): string {
  const safe = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
}

export function formatPercent(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return '—';
  const rounded = value.toFixed(digits);
  return `${rounded.endsWith('.0'.padEnd(digits + 1, '0')) ? Math.round(value) : rounded}%`;
}

/** Scores print without trailing zeros: 112, 112.5 */
export function formatScore(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
}

export function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

/** "Ananya Sharma" → "AS" — avatar fallback text. */
export function initialsOf(name: string): string {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || 'U'
  );
}
