/**
 * Conflict detection and resolution options.
 * Pure TypeScript logic.
 * Source: brain/03_SCHEDULING_RULES.md (Section 6)
 */

import type { Conflict, ConflictOption, HabitId } from '../types';
import type { PlaceableItem } from './place';

export interface DetectConflictsInput {
  unplacedItems: PlaceableItem[];
  availableFreeMin: number;
  maxExtensionMin?: number;
  scheduledHabits?: HabitId[];
  protectedHabitIds?: HabitId[];
}

/**
 * Detects scheduling conflicts when L0/L1/L2 items cannot fit.
 * Generates concrete, one-tap resolution options.
 */
export function detectConflicts(input: DetectConflictsInput): Conflict[] {
  const {
    unplacedItems,
    availableFreeMin,
    maxExtensionMin = 60,
    scheduledHabits = [],
    protectedHabitIds = [],
  } = input;

  if (unplacedItems.length === 0) {
    return [];
  }

  const conflicts: Conflict[] = [];

  for (const item of unplacedItems) {
    const options: ConflictOption[] = [];
    const itemShortfall = item.durationMin - availableFreeMin;

    if (item.kind === 'task') {
      // Option 1: Split task across today and tomorrow
      if (availableFreeMin >= 30) {
        const todayMin = Math.floor(availableFreeMin / 15) * 15;
        const tomorrowMin = item.durationMin - todayMin;
        options.push({
          id: `split-${item.id}`,
          kind: 'split_task',
          label: `Do ${todayMin}m today, ${tomorrowMin}m tomorrow`,
          payload: { taskId: item.taskId ?? item.id, todayMin, tomorrowMin },
        });
      }

      // Option 2: Move a habit to tomorrow to make room (AIML first, DSA second, Gym strictly last)
      const habitCandidates: HabitId[] = ['aiml', 'dsa', 'gym'];
      for (const hid of habitCandidates) {
        if (scheduledHabits.includes(hid)) {
          const isProtected = protectedHabitIds.includes(hid);
          const habitLabel =
            hid === 'gym' ? 'Gym' : hid === 'dsa' ? 'Java DSA' : 'AIML Python';

          options.push({
            id: `move-habit-${hid}`,
            kind: 'move_habit',
            label: isProtected
              ? `Move ${habitLabel} to tomorrow (Warning: Protected!)`
              : `Move ${habitLabel} to tomorrow`,
            payload: { habitId: hid, warning: isProtected },
          });
          // Offer at most one habit-move option per candidate pass to keep choices concise
          break;
        }
      }

      // Option 3: Extend the day
      if (maxExtensionMin > 0) {
        const extension = Math.min(itemShortfall, maxExtensionMin);
        const extendBy = Math.max(15, Math.ceil(extension / 15) * 15);
        options.push({
          id: `extend-day-${item.id}`,
          kind: 'extend_day',
          label: `Extend today by ${extendBy}m`,
          payload: { extensionMin: extendBy },
        });
      }

      // Option 4: Shrink the task
      if (availableFreeMin >= 15) {
        const shrinkMin = Math.floor(availableFreeMin / 15) * 15;
        options.push({
          id: `shrink-task-${item.id}`,
          kind: 'shrink_task',
          label: `Shrink task to ${shrinkMin}m`,
          payload: { taskId: item.taskId ?? item.id, newDurationMin: shrinkMin },
        });
      }

      conflicts.push({
        id: `conflict-${item.id}`,
        reason: `Cannot fit "${item.title}" (${item.durationMin}m) before sleep.`,
        affected: [item.taskId ?? item.id],
        options,
      });
    } else {
      // Unplaced habit (e.g. L1 minimum cannot fit)
      if (maxExtensionMin > 0) {
        options.push({
          id: `extend-day-habit-${item.id}`,
          kind: 'extend_day',
          label: `Extend today by ${Math.min(item.durationMin, maxExtensionMin)}m`,
          payload: { extensionMin: Math.min(item.durationMin, maxExtensionMin) },
        });
      }

      const isProtected = item.habitId ? protectedHabitIds.includes(item.habitId) : false;
      options.push({
        id: `move-habit-tomorrow-${item.id}`,
        kind: 'move_habit',
        label: isProtected
          ? `Move ${item.title} to tomorrow (Warning: Protected!)`
          : `Move ${item.title} to tomorrow`,
        payload: { habitId: item.habitId, warning: isProtected },
      });

      conflicts.push({
        id: `conflict-${item.id}`,
        reason: `Cannot fit habit minimum for "${item.title}" (${item.durationMin}m).`,
        affected: [item.id],
        options,
      });
    }
  }

  return conflicts;
}
