import { describe, it, expect } from 'vitest';
import { explainPlanDiff } from '../../src/engine/explain';
import type { Block } from '../../src/types';

describe('engine/explain', () => {
  it('returns empty array when plans are identical', () => {
    const blocks: Block[] = [
      {
        id: '1',
        kind: 'routine',
        title: 'Wake up',
        start: 390,
        end: 450,
        layer: 'L5',
        status: 'planned',
        pinned: false,
      },
    ];

    const lines = explainPlanDiff({
      oldBlocks: blocks,
      newBlocks: blocks,
    });

    expect(lines).toEqual([]);
  });

  it('explains added tasks with duration and time range', () => {
    const oldBlocks: Block[] = [];
    const newBlocks: Block[] = [
      {
        id: 'task-1',
        kind: 'task',
        title: 'DBMS assignment',
        start: 1020, // 17:00
        end: 1140, // 19:00
        layer: 'L2',
        status: 'planned',
        pinned: false,
      },
    ];

    const lines = explainPlanDiff({ oldBlocks, newBlocks });
    expect(lines).toContain(
      "Added 'DBMS assignment' (2h) at 17:00 to 19:00."
    );
  });

  it('explains shrunk habit with minimum indicator', () => {
    const oldBlocks: Block[] = [
      {
        id: 'dsa',
        kind: 'habit',
        habitId: 'dsa',
        title: 'Java DSA',
        start: 840,
        end: 930, // 90m
        layer: 'L4',
        status: 'planned',
        pinned: false,
      },
    ];

    const newBlocks: Block[] = [
      {
        id: 'dsa',
        kind: 'habit',
        habitId: 'dsa',
        title: 'Java DSA',
        start: 840,
        end: 885, // 45m (minimum)
        layer: 'L1',
        status: 'planned',
        pinned: false,
        isMinimum: true,
      },
    ];

    const lines = explainPlanDiff({ oldBlocks, newBlocks });
    expect(lines).toContain(
      'Shrunk Java DSA from 90 to 45 min (minimum).'
    );
  });

  it('explains moved habit', () => {
    const oldBlocks: Block[] = [
      {
        id: 'aiml',
        kind: 'habit',
        habitId: 'aiml',
        title: 'AIML Python',
        start: 1185, // 19:45
        end: 1275,
        layer: 'L4',
        status: 'planned',
        pinned: false,
      },
    ];

    const newBlocks: Block[] = [
      {
        id: 'aiml',
        kind: 'habit',
        habitId: 'aiml',
        title: 'AIML Python',
        start: 1230, // 20:30
        end: 1320,
        layer: 'L4',
        status: 'planned',
        pinned: false,
      },
    ];

    const lines = explainPlanDiff({ oldBlocks, newBlocks });
    expect(lines).toContain('Moved AIML Python from 19:45 to 20:30.');
  });

  it('mentions protected habit when applicable', () => {
    const lines = explainPlanDiff({
      oldBlocks: [],
      newBlocks: [
        {
          id: 'gym',
          kind: 'habit',
          habitId: 'gym',
          title: 'Gym',
          start: 970,
          end: 1090,
          layer: 'L1',
          status: 'planned',
          pinned: false,
          protected: true,
        },
      ],
      protectedHabitIds: ['gym'],
    });

    expect(lines).toContain(
      'Gym is protected today because you missed it yesterday.'
    );
  });
});
