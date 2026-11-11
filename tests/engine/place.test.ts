import { describe, it, expect } from 'vitest';
import { placeItems, type PlaceableItem } from '../../src/engine/place';
import { DEFAULT_SETTINGS } from '../../src/engine/constants';
import type { TimeWindow } from '../../src/engine/freeWindows';

describe('engine/place', () => {
  const settings = DEFAULT_SETTINGS;

  it('places a normal task into the earliest available free window', () => {
    const freeWindows: TimeWindow[] = [
      { start: 840, end: 960 }, // 14:00 - 16:00 (120m)
      { start: 1140, end: 1350 }, // 19:00 - 22:30
    ];

    const task: PlaceableItem = {
      id: 'task-1',
      kind: 'task',
      title: 'Lab Report',
      durationMin: 60,
      layer: 'L3',
    };

    const result = placeItems(freeWindows, [task], settings, 840);

    expect(result.placedBlocks.length).toBe(1);
    expect(result.placedBlocks[0].title).toBe('Lab Report');
    expect(result.placedBlocks[0].start).toBe(840);
    expect(result.placedBlocks[0].end).toBe(900);
    expect(result.unplacedItems.length).toBe(0);

    // Remaining window in the first slot should be 900..960 (60 min)
    expect(result.remainingFreeWindows).toEqual([
      { start: 900, end: 960 },
      { start: 1140, end: 1350 },
    ]);
  });

  it('places an urgent task (L2) before habit minimums (L1) when due today', () => {
    const freeWindows: TimeWindow[] = [
      { start: 840, end: 930 }, // 14:00 - 15:30 (90 min)
    ];

    const urgentTask: PlaceableItem = {
      id: 'task-urgent',
      kind: 'task',
      title: 'Urgent Assignment',
      durationMin: 45,
      layer: 'L2',
      importance: 'urgent',
    };

    const dsaMin: PlaceableItem = {
      id: 'habit-dsa',
      kind: 'habit',
      habitId: 'dsa',
      title: 'Java DSA',
      durationMin: 45,
      layer: 'L1',
      isMinimum: true,
    };

    const result = placeItems(freeWindows, [dsaMin, urgentTask], settings, 840);

    expect(result.placedBlocks.length).toBe(2);
    // Urgent task is placed first chronologically
    expect(result.placedBlocks[0].title).toBe('Urgent Assignment');
    expect(result.placedBlocks[0].start).toBe(840);
    expect(result.placedBlocks[0].end).toBe(885);

    expect(result.placedBlocks[1].title).toBe('Java DSA');
    expect(result.placedBlocks[1].start).toBe(885);
    expect(result.placedBlocks[1].end).toBe(930);
  });

  it('places fixedStart task at exact fixedStart and splits window (Scenario S11)', () => {
    const freeWindows: TimeWindow[] = [
      { start: 960, end: 1140 }, // 16:00 - 19:00 (180 min)
    ];

    const fixedTask: PlaceableItem = {
      id: 'fixed-task',
      kind: 'task',
      title: 'Doctor Appointment',
      durationMin: 60,
      fixedStart: 1020, // 17:00
      layer: 'L2',
    };

    const result = placeItems(freeWindows, [fixedTask], settings, 840);

    expect(result.placedBlocks.length).toBe(1);
    expect(result.placedBlocks[0].start).toBe(1020);
    expect(result.placedBlocks[0].end).toBe(1080);
    expect(result.placedBlocks[0].pinned).toBe(true);

    // Free windows should be split before (960..1020) and after (1080..1140)
    expect(result.remainingFreeWindows).toEqual([
      { start: 960, end: 1020 },
      { start: 1080, end: 1140 },
    ]);
  });

  it('records unplaced items when no free window is large enough', () => {
    const freeWindows: TimeWindow[] = [
      { start: 840, end: 870 }, // 30 min window
    ];

    const largeTask: PlaceableItem = {
      id: 'task-large',
      kind: 'task',
      title: '3-hour Assignment',
      durationMin: 180,
      layer: 'L2',
    };

    const result = placeItems(freeWindows, [largeTask], settings, 840);

    expect(result.placedBlocks.length).toBe(0);
    expect(result.unplacedItems.length).toBe(1);
    expect(result.unplacedItems[0].title).toBe('3-hour Assignment');
  });

  it('adds transition buffer after blocks of duration >= 90 minutes', () => {
    const freeWindows: TimeWindow[] = [
      { start: 840, end: 1000 }, // 160 min window
    ];

    const deepWorkTask: PlaceableItem = {
      id: 'deep-work',
      kind: 'task',
      title: 'Deep Study Block',
      durationMin: 90,
      layer: 'L3',
    };

    const result = placeItems(freeWindows, [deepWorkTask], settings, 840);

    expect(result.placedBlocks[0].start).toBe(840);
    expect(result.placedBlocks[0].end).toBe(930);

    // With 10 min transition buffer, next window starts at 930 + 10 = 940
    expect(result.remainingFreeWindows).toEqual([{ start: 940, end: 1000 }]);
  });
});
