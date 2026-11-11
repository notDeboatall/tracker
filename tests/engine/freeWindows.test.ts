import { describe, it, expect } from 'vitest';
import { findFreeWindows, totalFreeMinutes } from '../../src/engine/freeWindows';
import type { Block } from '../../src/types';

describe('engine/freeWindows', () => {
  const wake = 390; // 06:30
  const sleep = 1350; // 22:30

  const createDummyBlock = (
    start: number,
    end: number,
    title = 'Fixed block'
  ): Block => ({
    id: `block-${start}-${end}`,
    kind: 'fixed',
    title,
    start,
    end,
    layer: 'L0',
    status: 'planned',
    pinned: true,
  });

  it('returns single full window when there are no fixed blocks', () => {
    const windows = findFreeWindows({
      wake,
      sleep,
      now: 390,
      fixedBlocks: [],
    });

    expect(windows).toEqual([{ start: 390, end: 1350 }]);
    expect(totalFreeMinutes(windows)).toBe(960); // 16 hours
  });

  it('respects now when now is after wake', () => {
    const windows = findFreeWindows({
      wake,
      sleep,
      now: 840, // 14:00
      fixedBlocks: [],
    });

    expect(windows).toEqual([{ start: 840, end: 1350 }]);
    expect(totalFreeMinutes(windows)).toBe(510);
  });

  it('returns empty array when now is at or after sleep', () => {
    const windows = findFreeWindows({
      wake,
      sleep,
      now: 1350,
      fixedBlocks: [],
    });
    expect(windows).toEqual([]);

    const lateWindows = findFreeWindows({
      wake,
      sleep,
      now: 1400,
      fixedBlocks: [],
    });
    expect(lateWindows).toEqual([]);
  });

  it('splits free time around fixed blocks', () => {
    const college = createDummyBlock(480, 780, 'College'); // 08:00 - 13:00

    const windows = findFreeWindows({
      wake,
      sleep,
      now: 390, // 06:30
      fixedBlocks: [college],
    });

    expect(windows).toEqual([
      { start: 390, end: 480 }, // 06:30 - 08:00
      { start: 780, end: 1350 }, // 13:00 - 22:30
    ]);
  });

  it('merges overlapping and touching fixed blocks cleanly', () => {
    const b1 = createDummyBlock(500, 600);
    const b2 = createDummyBlock(580, 700); // overlaps b1
    const b3 = createDummyBlock(700, 750); // touches b2

    const windows = findFreeWindows({
      wake,
      sleep,
      now: 450,
      fixedBlocks: [b1, b2, b3],
    });

    expect(windows).toEqual([
      { start: 450, end: 500 },
      { start: 750, end: 1350 },
    ]);
  });

  it('ignores fixed blocks that ended in the past (before now)', () => {
    const pastCollege = createDummyBlock(480, 780, 'College');
    const futureDinner = createDummyBlock(1140, 1185, 'Dinner');

    const windows = findFreeWindows({
      wake,
      sleep,
      now: 840, // 14:00
      fixedBlocks: [pastCollege, futureDinner],
    });

    expect(windows).toEqual([
      { start: 840, end: 1140 }, // 14:00 - 19:00
      { start: 1185, end: 1350 }, // 19:45 - 22:30
    ]);
  });

  it('filters out windows smaller than minDuration', () => {
    const b1 = createDummyBlock(400, 410); // leaves 10 min window: 390..400
    const windows = findFreeWindows({
      wake,
      sleep,
      now: 390,
      fixedBlocks: [b1],
      minDuration: 15,
    });

    // 390..400 (10 min) should be filtered out
    expect(windows).toEqual([{ start: 410, end: 1350 }]);
  });
});
