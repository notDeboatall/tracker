/**
 * Computes available free time windows between fixed commitments.
 * Pure logic: no React, DOM, storage, or Date calls.
 * Source: brain/03_SCHEDULING_RULES.md (Algorithm Step 3)
 */

import type { Block } from '../types';

export interface TimeWindow {
  start: number;
  end: number;
}

export interface FindFreeWindowsInput {
  wake: number; // minutes from midnight (e.g. 390 = 06:30)
  sleep: number; // minutes from midnight (e.g. 1350 = 22:30)
  now: number; // current time injected (e.g. 840 = 14:00)
  fixedBlocks: Block[]; // L0, pinned, or in-progress blocks to avoid
  minDuration?: number; // optional filter for minimum usable duration (e.g. 15m)
}

/**
 * Computes available free windows in the future between max(now, wake) and sleep.
 * 1. Determines planning horizon: [max(now, wake), sleep].
 * 2. Collects and merges all occupied/fixed intervals.
 * 3. Inverts the occupied intervals within the horizon to get free windows.
 */
export function findFreeWindows(input: FindFreeWindowsInput): TimeWindow[] {
  const { wake, sleep, now, fixedBlocks, minDuration = 0 } = input;

  const horizonStart = Math.max(wake, now);
  const horizonEnd = sleep;

  if (horizonStart >= horizonEnd) {
    return [];
  }

  // 1. Collect occupied intervals clipped to [horizonStart, horizonEnd]
  const occupied: TimeWindow[] = [];

  for (const block of fixedBlocks) {
    // A block occupies time if it overlaps with [horizonStart, horizonEnd]
    const clampedStart = Math.max(block.start, horizonStart);
    const clampedEnd = Math.min(block.end, horizonEnd);

    if (clampedStart < clampedEnd) {
      occupied.push({ start: clampedStart, end: clampedEnd });
    }
  }

  // 2. Sort occupied intervals by start time
  occupied.sort((a, b) => a.start - b.start);

  // 3. Merge overlapping or contiguous occupied intervals
  const mergedOccupied: TimeWindow[] = [];
  for (const interval of occupied) {
    if (mergedOccupied.length === 0) {
      mergedOccupied.push({ ...interval });
    } else {
      const last = mergedOccupied[mergedOccupied.length - 1];
      if (interval.start <= last.end) {
        // Overlapping or touching: extend last interval
        last.end = Math.max(last.end, interval.end);
      } else {
        mergedOccupied.push({ ...interval });
      }
    }
  }

  // 4. Invert occupied intervals against [horizonStart, horizonEnd]
  const freeWindows: TimeWindow[] = [];
  let currentStart = horizonStart;

  for (const occ of mergedOccupied) {
    if (occ.start > currentStart) {
      const duration = occ.start - currentStart;
      if (duration >= minDuration) {
        freeWindows.push({ start: currentStart, end: occ.start });
      }
    }
    currentStart = Math.max(currentStart, occ.end);
  }

  // Final gap before sleep
  if (currentStart < horizonEnd) {
    const duration = horizonEnd - currentStart;
    if (duration >= minDuration) {
      freeWindows.push({ start: currentStart, end: horizonEnd });
    }
  }

  return freeWindows;
}

/**
 * Returns total available free minutes across an array of windows.
 */
export function totalFreeMinutes(windows: TimeWindow[]): number {
  return windows.reduce((total, w) => total + (w.end - w.start), 0);
}
