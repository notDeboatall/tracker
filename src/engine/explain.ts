/**
 * Explainability engine.
 * Pure TypeScript logic.
 * Source: brain/03_SCHEDULING_RULES.md (Section 7)
 * Produces plain-English, dry summary lines with zero cheerleading copy or emojis.
 */

import type { Block, DayMode, HabitId } from '../types';
import { toHHMM, formatDuration } from './time';

export interface ExplainDiffInput {
  oldBlocks: Block[];
  newBlocks: Block[];
  mode?: DayMode;
  protectedHabitIds?: HabitId[];
}

/**
 * Compares oldBlocks with newBlocks and returns human-readable change explanations.
 */
export function explainPlanDiff(input: ExplainDiffInput): string[] {
  const { oldBlocks, newBlocks, mode = 'normal', protectedHabitIds = [] } = input;
  const summary: string[] = [];

  // 1. Check for mode specific headline
  if (mode === 'holiday') {
    const gym = newBlocks.find((b) => b.habitId === 'gym');
    if (gym) {
      summary.push(
        `No college today. Gym at ${toHHMM(gym.start)}, rest of the day is open.`
      );
    } else {
      summary.push('No college today. Rest of the day is open.');
    }
  }

  // 2. Note protected habits
  for (const hid of protectedHabitIds) {
    const label = hid === 'gym' ? 'Gym' : hid === 'dsa' ? 'Java DSA' : 'AIML Python';
    const presentInNew = newBlocks.some((b) => b.habitId === hid);
    if (presentInNew) {
      summary.push(`${label} is protected today because you missed it yesterday.`);
    }
  }

  // 3. Find newly added tasks/blocks
  for (const nb of newBlocks) {
    // Only check future blocks or newly introduced blocks
    const match = oldBlocks.find(
      (ob) => (ob.taskId && ob.taskId === nb.taskId) || ob.id === nb.id
    );

    if (!match && nb.kind === 'task') {
      const dur = formatDuration(nb.end - nb.start);
      summary.push(
        `Added '${nb.title}' (${dur}) at ${toHHMM(nb.start)} to ${toHHMM(nb.end)}.`
      );
    }
  }

  // 4. Find modified blocks (shrunk, moved)
  for (const nb of newBlocks) {
    // Match by habitId or id
    const match = oldBlocks.find(
      (ob) => (ob.habitId && ob.habitId === nb.habitId) || ob.id === nb.id
    );

    if (!match) continue;

    const oldDur = match.end - match.start;
    const newDur = nb.end - nb.start;

    // Check if shrunk
    if (newDur < oldDur) {
      const minLabel = nb.isMinimum ? ' (minimum)' : '';
      summary.push(
        `Shrunk ${nb.title} from ${oldDur} to ${newDur} min${minLabel}.`
      );
    }

    // Check if moved (start shifted by at least 5 minutes)
    if (Math.abs(nb.start - match.start) >= 5) {
      summary.push(
        `Moved ${nb.title} from ${toHHMM(match.start)} to ${toHHMM(nb.start)}.`
      );
    }
  }

  return summary;
}
