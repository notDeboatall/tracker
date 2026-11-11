import { describe, it, expect } from 'vitest';
import { extendHabits } from '../../src/engine/extend';
import { DEFAULT_HABIT_CONFIGS } from '../../src/engine/constants';
import type { Block } from '../../src/types';
import type { TimeWindow } from '../../src/engine/freeWindows';

describe('engine/extend', () => {
  const habitsConfig = DEFAULT_HABIT_CONFIGS;
  const sleep = 1350; // 22:30

  it('extends a minimum habit up to full duration using adjacent free window', () => {
    // Gym at 30 min minimum (970..1000)
    const gymBlock: Block = {
      id: 'gym-1',
      kind: 'habit',
      habitId: 'gym',
      title: 'Gym',
      start: 970, // 16:10
      end: 1000, // 16:40 (30m min)
      layer: 'L1',
      status: 'planned',
      pinned: false,
      isMinimum: true,
    };

    // Free window right after gym: 1000..1140 (140 min)
    const freeWindows: TimeWindow[] = [{ start: 1000, end: 1140 }];

    const result = extendHabits({
      blocks: [gymBlock],
      freeWindows,
      habitsConfig,
      sleep,
    });

    // Gym full duration is 120m -> end should be 970 + 120 = 1090 (18:10)
    expect(result.blocks[0].end).toBe(1090);
    expect(result.blocks[0].isMinimum).toBe(false);

    // Remaining free window should start at 1090
    expect(result.remainingFreeWindows).toEqual([{ start: 1090, end: 1140 }]);
  });

  it('does not extend a habit that is already at full duration', () => {
    const dsaBlock: Block = {
      id: 'dsa-1',
      kind: 'habit',
      habitId: 'dsa',
      title: 'Java DSA',
      start: 840,
      end: 930, // 90 min (full)
      layer: 'L4',
      status: 'planned',
      pinned: false,
    };

    const freeWindows: TimeWindow[] = [{ start: 930, end: 1000 }];

    const result = extendHabits({
      blocks: [dsaBlock],
      freeWindows,
      habitsConfig,
      sleep,
    });

    expect(result.blocks[0].end).toBe(930);
    expect(result.remainingFreeWindows).toEqual([{ start: 930, end: 1000 }]);
  });

  it('preserves at least 30 min of wind-down buffer before sleep', () => {
    // AIML at 30 min (1200..1230), window goes up to sleep (1230..1350 = 120 min)
    const aimlBlock: Block = {
      id: 'aiml-1',
      kind: 'habit',
      habitId: 'aiml',
      title: 'AIML Python',
      start: 1200,
      end: 1230,
      layer: 'L1',
      status: 'planned',
      pinned: false,
      isMinimum: true,
    };

    // Window reaches sleep (1350)
    const freeWindows: TimeWindow[] = [{ start: 1230, end: 1350 }];

    const result = extendHabits({
      blocks: [aimlBlock],
      freeWindows,
      habitsConfig,
      sleep,
      windDownMin: 30,
    });

    // AIML full is 90 min -> 1200 + 90 = 1290.
    // 1290 leaves 60 min before sleep (1350 - 1290 = 60 >= 30 wind-down), so it can reach 1290!
    expect(result.blocks[0].end).toBe(1290);
  });
});
