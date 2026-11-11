/**
 * Day Mode transformations.
 * Pure logic: transforms base day template according to the active mode:
 * - normal
 * - holiday
 * - partial (college start/end changes)
 * - low_energy / sick
 * - crunch (exam mode)
 *
 * Source: brain/03_SCHEDULING_RULES.md (Section 5)
 */

import type { DayMode, PartialChange, TemplateBlock, HabitConfig } from '../types';
import { toMin } from './time';
import { DEFAULT_COLLEGE_TRAVEL_MIN } from './constants';

export interface ApplyModeInput {
  baseBlocks: TemplateBlock[];
  mode: DayMode;
  partial?: PartialChange;
  habits?: HabitConfig[];
  collegeTravelMin?: number;
}

/**
 * Applies day mode transformations to base template blocks.
 */
export function applyDayMode(input: ApplyModeInput): TemplateBlock[] {
  const {
    baseBlocks,
    mode,
    partial,
    collegeTravelMin = DEFAULT_COLLEGE_TRAVEL_MIN,
  } = input;

  if (mode === 'normal') {
    return baseBlocks.map((b) => ({ ...b }));
  }

  if (mode === 'holiday') {
    // 1. Remove College and college rides
    const nonCollegeBlocks = baseBlocks.filter((b) => {
      const titleLower = b.title.toLowerCase();
      if (titleLower === 'college') return false;
      if (titleLower === 'ride to college') return false;
      if (titleLower === 'ride home' && b.kind === 'fixed') return false;
      return true;
    });

    // 2. Position Gym at preferred holiday morning slot (07:30 to 09:30) if it exists
    const result: TemplateBlock[] = [];
    const hasGym = nonCollegeBlocks.some((b) => b.habitId === 'gym');

    if (hasGym) {
      result.push({
        kind: 'routine',
        title: 'Wake up, get ready',
        start: toMin('06:30'),
        end: toMin('07:30'),
        layer: 'L5',
        pinned: false,
      });

      result.push({
        kind: 'habit',
        title: 'Gym',
        habitId: 'gym',
        start: toMin('07:30'),
        end: toMin('09:30'), // full length 120 min
        layer: 'L4',
        pinned: false,
      });

      result.push({
        kind: 'routine',
        title: 'Freshen up, breakfast',
        start: toMin('09:30'),
        end: toMin('10:15'),
        layer: 'L5',
        pinned: false,
      });

      result.push({
        kind: 'habit',
        title: 'Java DSA',
        habitId: 'dsa',
        start: toMin('10:15'),
        end: toMin('11:45'), // 90 min
        layer: 'L4',
        pinned: false,
      });

      result.push({
        kind: 'routine',
        title: 'Lunch and rest',
        start: toMin('11:45'),
        end: toMin('13:30'),
        layer: 'L5',
        pinned: false,
      });

      result.push({
        kind: 'habit',
        title: 'AIML Python',
        habitId: 'aiml',
        start: toMin('14:00'),
        end: toMin('15:30'), // 90 min
        layer: 'L4',
        pinned: false,
      });

      result.push({
        kind: 'free',
        title: 'Free / rest',
        start: toMin('15:30'),
        end: toMin('19:00'),
        layer: 'L5',
        pinned: false,
      });

      result.push({
        kind: 'routine',
        title: 'Dinner',
        start: toMin('19:00'),
        end: toMin('20:00'),
        layer: 'L5',
        pinned: false,
      });

      result.push({
        kind: 'free',
        title: 'Free / wind down',
        start: toMin('20:00'),
        end: toMin('22:30'),
        layer: 'L5',
        pinned: false,
      });

      return result;
    }

    return nonCollegeBlocks;
  }

  if (mode === 'partial') {
    return baseBlocks.map((b) => {
      const titleLower = b.title.toLowerCase();

      // Adjust College block
      if (titleLower === 'college') {
        const start = partial?.collegeStart ?? b.start;
        const end = partial?.collegeEnd ?? b.end;
        return {
          ...b,
          start,
          end,
          reason: 'Adjusted for partial college schedule',
        };
      }

      // Adjust Ride to college
      if (titleLower === 'ride to college') {
        if (partial?.collegeStart !== undefined) {
          const end = partial.collegeStart;
          const start = end - collegeTravelMin;
          return {
            ...b,
            start,
            end,
            reason: 'Shifted with college start',
          };
        }
      }

      // Adjust Ride home
      if (titleLower === 'ride home' && b.kind === 'fixed') {
        if (partial?.collegeEnd !== undefined) {
          const start = partial.collegeEnd;
          const end = start + collegeTravelMin;
          return {
            ...b,
            start,
            end,
            reason: 'Shifted with college end',
          };
        }
      }

      return { ...b };
    });
  }

  if (mode === 'low_energy') {
    // All habits shrink to minimum size; add rest block
    return baseBlocks.map((b) => {
      if (b.kind === 'habit') {
        let minMin = 30;
        if (b.habitId === 'dsa') minMin = 45;
        if (b.habitId === 'gym') minMin = 30;
        if (b.habitId === 'aiml') minMin = 30;

        return {
          ...b,
          end: b.start + minMin,
          isMinimum: true,
          reason: 'Reduced to minimum for low energy mode',
        };
      }
      return { ...b };
    });
  }

  if (mode === 'crunch') {
    // Exam/crunch: Course blocks at minimum, gym at least minimum, rest open for tasks
    return baseBlocks.map((b) => {
      if (b.kind === 'habit' && (b.habitId === 'dsa' || b.habitId === 'aiml')) {
        const minMin = b.habitId === 'dsa' ? 45 : 30;
        return {
          ...b,
          end: b.start + minMin,
          isMinimum: true,
          reason: 'Reduced to minimum for exam crunch mode',
        };
      }
      if (b.kind === 'habit' && b.habitId === 'gym') {
        return {
          ...b,
          end: b.start + 60, // reduced gym session
          isMinimum: true,
          reason: 'Reduced for exam crunch mode',
        };
      }
      return { ...b };
    });
  }

  return baseBlocks.map((b) => ({ ...b }));
}
