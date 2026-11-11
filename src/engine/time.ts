/**
 * Pure time helper functions.
 * All internal engine times are minutes from midnight (0 to 1439).
 * Strictly isolated: zero imports from React, DOM, or Date.
 */

/**
 * Converts a "HH:mm" string to minutes from midnight (0 to 1439).
 * Throws an Error if format is invalid or outside 0..1439.
 */
export function toMin(timeStr: string): number {
  if (typeof timeStr !== 'string') {
    throw new Error(`Invalid time string: expected string, got ${typeof timeStr}`);
  }

  const trimmed = timeStr.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid time format: "${timeStr}". Expected "HH:mm".`);
  }

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (hours < 0 || hours > 23) {
    throw new Error(`Invalid hour in "${timeStr}": hours must be between 0 and 23.`);
  }

  if (minutes < 0 || minutes > 59) {
    throw new Error(`Invalid minute in "${timeStr}": minutes must be between 0 and 59.`);
  }

  const totalMin = hours * 60 + minutes;
  if (totalMin < 0 || totalMin > 1439) {
    throw new Error(`Time "${timeStr}" out of range: must be between 0 and 1439 minutes.`);
  }

  return totalMin;
}

/**
 * Converts minutes from midnight to "HH:mm".
 * Supports 0 to 1440 (1440 is 24:00, the end-of-day boundary).
 * Throws an Error if input is outside [0, 1440] or not a finite number.
 */
export function toHHMM(minutes: number): string {
  if (typeof minutes !== 'number' || !Number.isFinite(minutes)) {
    throw new Error(`Invalid minutes value: expected finite number, got ${minutes}`);
  }

  if (minutes < 0 || minutes > 1440) {
    throw new Error(`Minutes value ${minutes} out of bounds: must be between 0 and 1440.`);
  }

  const rounded = Math.round(minutes);
  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;

  const hh = hours.toString().padStart(2, '0');
  const mm = mins.toString().padStart(2, '0');

  return `${hh}:${mm}`;
}

/**
 * Clamps a number between min and max bounds.
 */
export function clamp(val: number, min: number, max: number): number {
  if (min > max) {
    throw new Error(`Invalid clamp range: min (${min}) cannot exceed max (${max})`);
  }
  return Math.max(min, Math.min(max, val));
}

/**
 * Formats duration in minutes to human-readable string:
 * e.g. 120 -> "2h", 90 -> "1h 30m", 45 -> "45m", 0 -> "0m"
 */
export function formatDuration(durationMin: number): string {
  if (durationMin < 0) {
    throw new Error(`Duration cannot be negative: ${durationMin}`);
  }

  const mins = Math.round(durationMin);
  if (mins === 0) return '0m';

  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  if (hours > 0 && remainingMins > 0) {
    return `${hours}h ${remainingMins}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${remainingMins}m`;
}

/**
 * Checks whether two time intervals [start, end] overlap.
 * Intervals touch if a.end === b.start (not an overlap).
 */
export function isOverlapping(
  a: { start: number; end: number },
  b: { start: number; end: number }
): boolean {
  return Math.max(a.start, b.start) < Math.min(a.end, b.end);
}

