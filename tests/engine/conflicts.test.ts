import { describe, it, expect } from 'vitest';
import { detectConflicts } from '../../src/engine/conflicts';
import type { PlaceableItem } from '../../src/engine/place';

describe('engine/conflicts', () => {
  it('returns empty array when there are no unplaced items', () => {
    const conflicts = detectConflicts({
      unplacedItems: [],
      availableFreeMin: 120,
    });
    expect(conflicts).toEqual([]);
  });

  it('generates concrete conflict options for an unplaced task (Scenario S10)', () => {
    const unplacedTask: PlaceableItem = {
      id: 'task-assignment',
      taskId: 'task-123',
      kind: 'task',
      title: 'DBMS Assignment',
      durationMin: 180, // 3h
      layer: 'L2',
    };

    const conflicts = detectConflicts({
      unplacedItems: [unplacedTask],
      availableFreeMin: 45, // only 45 min available
      scheduledHabits: ['gym', 'dsa', 'aiml'],
      protectedHabitIds: ['gym'], // Gym is protected
    });

    expect(conflicts.length).toBe(1);
    const conflict = conflicts[0];
    expect(conflict.reason).toContain('DBMS Assignment');
    expect(conflict.affected).toContain('task-123');

    const optionKinds = conflict.options.map((o) => o.kind);
    // Should offer split, move habit, extend day, and shrink task
    expect(optionKinds).toContain('split_task');
    expect(optionKinds).toContain('move_habit');
    expect(optionKinds).toContain('extend_day');
    expect(optionKinds).toContain('shrink_task');

    // Move habit should offer AIML first (not Gym)
    const moveHabitOption = conflict.options.find((o) => o.kind === 'move_habit');
    expect(moveHabitOption).toBeDefined();
    expect(moveHabitOption!.label).toContain('AIML');
  });

  it('flags warning when protected habit is offered to move (Scenario S9)', () => {
    const unplacedTask: PlaceableItem = {
      id: 'task-assignment',
      kind: 'task',
      title: 'Lab Submission',
      durationMin: 120,
      layer: 'L2',
    };

    // Only Gym is scheduled and Gym is protected
    const conflicts = detectConflicts({
      unplacedItems: [unplacedTask],
      availableFreeMin: 0,
      scheduledHabits: ['gym'],
      protectedHabitIds: ['gym'],
    });

    const moveOption = conflicts[0].options.find((o) => o.kind === 'move_habit');
    expect(moveOption).toBeDefined();
    expect(moveOption!.label).toContain('Warning: Protected');
  });
});
