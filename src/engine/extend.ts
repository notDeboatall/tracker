/**
 * Habit extension engine (L4).
 * Pure TypeScript logic.
 * Source: brain/03_SCHEDULING_RULES.md (Step 6)
 *
 * Uses remaining free time to grow habits back toward their full duration
 * in priority order: Gym -> Java DSA -> AIML Python.
 * Never extends beyond full duration.
 * Leaves at least 30 min of wind-down before sleep if possible.
 */

import type { Block, DayMode, HabitConfig, HabitId } from '../types';
import type { TimeWindow } from './freeWindows';
import { DEFAULT_WIND_DOWN_MIN } from './constants';

export interface ExtendHabitsInput {
  blocks: Block[];
  freeWindows: TimeWindow[];
  habitsConfig: HabitConfig[];
  sleep: number;
  mode?: DayMode;
  windDownMin?: number;
}

export interface ExtendHabitsResult {
  blocks: Block[];
  remainingFreeWindows: TimeWindow[];
}

export function extendHabits(input: ExtendHabitsInput): ExtendHabitsResult {
  const {
    blocks,
    freeWindows,
    habitsConfig,
    sleep,
    mode = 'normal',
    windDownMin = DEFAULT_WIND_DOWN_MIN,
  } = input;

  const currentBlocks: Block[] = blocks.map((b) => ({ ...b }));
  const currentWindows: TimeWindow[] = freeWindows.map((w) => ({ ...w }));

  // In low_energy mode, habits stay at minimum (no extension)
  if (mode === 'low_energy') {
    return {
      blocks: currentBlocks,
      remainingFreeWindows: currentWindows,
    };
  }

  // Priority order for habit extension: Gym > DSA > AIML
  const priorityOrder: HabitId[] = ['gym', 'dsa', 'aiml'];

  for (const habitId of priorityOrder) {
    // In crunch mode, course blocks (DSA, AIML) stay at minimum
    if (mode === 'crunch' && (habitId === 'dsa' || habitId === 'aiml')) {
      continue;
    }

    const config = habitsConfig.find((h) => h.id === habitId);
    if (!config) continue;

    // Find if habit block is present
    const habitBlockIdx = currentBlocks.findIndex(
      (b) => b.kind === 'habit' && b.habitId === habitId
    );
    if (habitBlockIdx === -1) continue;

    const habitBlock = currentBlocks[habitBlockIdx];
    const currentDuration = habitBlock.end - habitBlock.start;
    const maxDuration = config.fullMin;

    if (currentDuration >= maxDuration) {
      continue; // already at or above full duration
    }

    const neededMin = maxDuration - currentDuration;

    // Check if there is a free window immediately following this habit block
    const adjacentWindowIdx = currentWindows.findIndex(
      (w) => w.start === habitBlock.end
    );

    if (adjacentWindowIdx !== -1) {
      const window = currentWindows[adjacentWindowIdx];
      // Available expansion space (protecting windDownMin before sleep if this window touches sleep)
      let availableInWindow = window.end - window.start;
      if (window.end === sleep) {
        availableInWindow = Math.max(0, availableInWindow - windDownMin);
      }

      if (availableInWindow > 0) {
        const extensionMin = Math.min(neededMin, availableInWindow);
        if (extensionMin > 0) {
          habitBlock.end += extensionMin;
          habitBlock.isMinimum = habitBlock.end - habitBlock.start < config.fullMin;

          // Update window
          if (window.start + extensionMin < window.end) {
            window.start += extensionMin;
          } else {
            currentWindows.splice(adjacentWindowIdx, 1);
          }
        }
      }
    }
  }

  return {
    blocks: currentBlocks,
    remainingFreeWindows: currentWindows,
  };
}
