import { describe, it, expect } from 'vitest';
import { replan } from '../../src/engine/replan';
import {
  MON_WED_TEMPLATE,
  THU_SAT_TEMPLATE,
  SUNDAY_TEMPLATE,
} from '../../src/engine/templates';
import { DEFAULT_SETTINGS } from '../../src/engine/constants';
import { toMin, isOverlapping } from '../../src/engine/time';
import type { Task, DayConfig, HabitLogEntry, Block } from '../../src/types';

describe('Engine Scenarios (S1 to S18)', () => {
  const baseDayConfig: DayConfig = {
    date: '2026-11-16', // A Monday
    mode: 'normal',
  };

  // S1. Normal day, no changes (Mon, now = 06:30)
  it('S1: Normal day, no changes returns exact template with no conflicts or diffs', () => {
    const res = replan({
      date: '2026-11-16',
      now: toMin('06:30'),
      dayConfig: baseDayConfig,
      template: MON_WED_TEMPLATE,
      loggedBlocks: [],
      tasks: [],
      habitLog: [],
      settings: DEFAULT_SETTINGS,
    });

    expect(res.conflicts).toHaveLength(0);
    expect(res.summary).toHaveLength(0);
    expect(res.blocks).toHaveLength(MON_WED_TEMPLATE.blocks.length);

    // Verify block start and end matches exactly
    for (let i = 0; i < res.blocks.length; i++) {
      expect(res.blocks[i].start).toBe(MON_WED_TEMPLATE.blocks[i].start);
      expect(res.blocks[i].end).toBe(MON_WED_TEMPLATE.blocks[i].end);
    }
  });

  // S2. Normal day, midday (Mon, now = 14:12, nothing logged)
  it('S2: Normal day, midday locks past blocks and marks current block in_progress', () => {
    const now = toMin('14:12'); // 852 min
    const res = replan({
      date: '2026-11-16',
      now,
      dayConfig: baseDayConfig,
      template: MON_WED_TEMPLATE,
      loggedBlocks: [],
      tasks: [],
      habitLog: [],
      settings: DEFAULT_SETTINGS,
    });

    // College (08:00 to 13:00) ended before now -> status locked
    const college = res.blocks.find((b) => b.title === 'College');
    expect(college).toBeDefined();
    expect(college!.status).toBe('done');

    // Java DSA (14:00 to 15:30) spans 14:12 -> in_progress
    const dsa = res.blocks.find((b) => b.habitId === 'dsa');
    expect(dsa).toBeDefined();
    expect(dsa!.status).toBe('in_progress');
  });

  // S3. Add urgent 3h assignment at 14:00 (Mon), deadline today 23:59
  it('S3: Add urgent 3h assignment places assignment before 22:30 and protects habit minimums', () => {
    const now = toMin('14:00');
    const task: Task = {
      id: 'task-3h',
      title: 'DBMS Assignment',
      durationMin: 180, // 3h
      deadline: '2026-11-16T23:59',
      importance: 'urgent',
      splittable: true,
      remainingMin: 180,
      status: 'open',
      createdAt: '2026-11-16T14:00:00',
    };

    const res = replan({
      date: '2026-11-16',
      now,
      dayConfig: baseDayConfig,
      template: MON_WED_TEMPLATE,
      loggedBlocks: [],
      tasks: [task],
      habitLog: [],
      settings: DEFAULT_SETTINGS,
    });

    // Verify assignment is placed
    const placedTask = res.blocks.find((b) => b.taskId === 'task-3h');
    expect(placedTask).toBeDefined();
    expect(placedTask!.end).toBeLessThanOrEqual(DEFAULT_SETTINGS.sleep);

    // Habits Gym, DSA, AIML are either placed at least at minimum or surfaced in conflicts
    const gym = res.blocks.find((b) => b.habitId === 'gym');
    const dsa = res.blocks.find((b) => b.habitId === 'dsa');
    const aiml = res.blocks.find((b) => b.habitId === 'aiml');

    if (gym) expect(gym.end - gym.start).toBeGreaterThanOrEqual(30);
    if (dsa) expect(dsa.end - dsa.start).toBeGreaterThanOrEqual(45);
    if (aiml) expect(aiml.end - aiml.start).toBeGreaterThanOrEqual(30);

    // Nothing past sleep 22:30
    for (const b of res.blocks) {
      expect(b.end).toBeLessThanOrEqual(DEFAULT_SETTINGS.sleep);
    }

    // Summary explains the change
    expect(res.summary.length).toBeGreaterThan(0);
  });

  // S4. Add small task (30 min, deadline tomorrow) at 14:00 (Mon)
  it('S4: Add small task fits into free/wind-down time with minimal disruption', () => {
    const now = toMin('14:00');
    const task: Task = {
      id: 'task-small',
      title: 'Short Reading',
      durationMin: 30,
      deadline: '2026-11-17T18:00',
      importance: 'normal',
      splittable: false,
      remainingMin: 30,
      status: 'open',
      createdAt: '2026-11-16T14:00:00',
    };

    const res = replan({
      date: '2026-11-16',
      now,
      dayConfig: baseDayConfig,
      template: MON_WED_TEMPLATE,
      loggedBlocks: [],
      tasks: [task],
      habitLog: [],
      settings: DEFAULT_SETTINGS,
    });

    const placedTask = res.blocks.find((b) => b.taskId === 'task-small');
    expect(placedTask).toBeDefined();
    expect(placedTask!.end - placedTask!.start).toBe(30);
  });

  // S5. Holiday declared at 06:30 (Tue)
  it('S5: Holiday declared at 06:30 removes college and places morning gym', () => {
    const res = replan({
      date: '2026-11-17',
      now: toMin('06:30'),
      dayConfig: { date: '2026-11-17', mode: 'holiday' },
      template: MON_WED_TEMPLATE,
      loggedBlocks: [],
      tasks: [],
      habitLog: [],
      settings: DEFAULT_SETTINGS,
    });

    // No College
    expect(res.blocks.find((b) => b.title === 'College')).toBeUndefined();

    // Gym at 07:30
    const gym = res.blocks.find((b) => b.habitId === 'gym');
    expect(gym).toBeDefined();
    expect(gym!.start).toBe(toMin('07:30'));
    expect(gym!.end - gym!.start).toBe(120);

    // Summary note
    expect(res.summary.some((s) => s.includes('No college today'))).toBe(true);
  });

  // S6. Holiday declared mid-day at 10:00 (Tue, college already partially attended)
  it('S6: Holiday declared mid-day keeps blocks before 10:00 locked', () => {
    const now = toMin('10:00');
    const pastCollegeBlock: Block = {
      id: 'past-college',
      kind: 'fixed',
      title: 'College attended morning',
      start: toMin('08:00'),
      end: toMin('10:00'),
      layer: 'L0',
      status: 'done',
      pinned: true,
    };

    const res = replan({
      date: '2026-11-17',
      now,
      dayConfig: { date: '2026-11-17', mode: 'holiday' },
      template: MON_WED_TEMPLATE,
      loggedBlocks: [pastCollegeBlock],
      tasks: [],
      habitLog: [],
      settings: DEFAULT_SETTINGS,
    });

    const past = res.blocks.find((b) => b.id === 'past-college');
    expect(past).toBeDefined();
    expect(past!.status).toBe('done');
  });

  // S7. College ends early (Mon, 08:00 to 11:00)
  it('S7: College ends early moves ride home and frees late morning', () => {
    const res = replan({
      date: '2026-11-16',
      now: toMin('06:30'),
      dayConfig: {
        date: '2026-11-16',
        mode: 'partial',
        partial: { collegeEnd: toMin('11:00') },
      },
      template: MON_WED_TEMPLATE,
      loggedBlocks: [],
      tasks: [],
      habitLog: [],
      settings: DEFAULT_SETTINGS,
    });

    const college = res.blocks.find((b) => b.title === 'College');
    expect(college!.end).toBe(toMin('11:00'));

    const rideHome = res.blocks.find(
      (b) => b.title.toLowerCase() === 'ride home' && b.kind === 'fixed'
    );
    expect(rideHome!.start).toBe(toMin('11:00'));
    expect(rideHome!.end).toBe(toMin('11:25'));
  });

  // S8. Thu-Sat template, urgent task added at 20:45
  it('S8: Urgent task added late never schedules past 22:30 without extension approval', () => {
    const now = toMin('20:45');
    const task: Task = {
      id: 'task-late',
      title: 'Late Urgent Task',
      durationMin: 90,
      importance: 'urgent',
      deadline: '2026-11-19T23:59',
      splittable: true,
      remainingMin: 90,
      status: 'open',
      createdAt: '2026-11-19T20:45:00',
    };

    const res = replan({
      date: '2026-11-19',
      now,
      dayConfig: { date: '2026-11-19', mode: 'normal' },
      template: THU_SAT_TEMPLATE,
      loggedBlocks: [],
      tasks: [task],
      habitLog: [],
      settings: DEFAULT_SETTINGS,
    });

    // All blocks strictly <= sleep (1350)
    for (const b of res.blocks) {
      expect(b.end).toBeLessThanOrEqual(DEFAULT_SETTINGS.sleep);
    }
  });

  // S9. Never miss twice
  it('S9: Protects habit when missed yesterday', () => {
    const habitLog: HabitLogEntry[] = [
      {
        date: '2026-11-15', // Sunday
        habitId: 'gym',
        minutesDone: 0,
        status: 'skipped',
        metMinimum: false,
      },
    ];

    const res = replan({
      date: '2026-11-16',
      now: toMin('06:30'),
      dayConfig: baseDayConfig,
      template: MON_WED_TEMPLATE,
      loggedBlocks: [],
      tasks: [],
      habitLog,
      settings: DEFAULT_SETTINGS,
    });

    const gym = res.blocks.find((b) => b.habitId === 'gym');
    expect(gym).toBeDefined();
    expect(gym!.protected).toBe(true);
  });

  // S10. Overload (cannot fit)
  it('S10: Overload returns conflicts with options and never drops work silently', () => {
    const now = toMin('14:00');
    const task1: Task = {
      id: 'task-heavy-1',
      title: '3h Assignment A',
      durationMin: 180,
      deadline: '2026-11-16T23:59',
      importance: 'urgent',
      splittable: true,
      remainingMin: 180,
      status: 'open',
      createdAt: '2026-11-16T14:00:00',
    };
    const task2: Task = {
      id: 'task-heavy-2',
      title: '3h Assignment B',
      durationMin: 180,
      deadline: '2026-11-16T23:59',
      importance: 'urgent',
      splittable: true,
      remainingMin: 180,
      status: 'open',
      createdAt: '2026-11-16T14:00:00',
    };

    const res = replan({
      date: '2026-11-16',
      now,
      dayConfig: baseDayConfig,
      template: MON_WED_TEMPLATE,
      loggedBlocks: [],
      tasks: [task1, task2],
      habitLog: [],
      settings: DEFAULT_SETTINGS,
    });

    // Cannot fit both 3h tasks + habits before 22:30 -> conflict raised
    expect(res.conflicts.length).toBeGreaterThanOrEqual(1);
    expect(res.conflicts[0].options.length).toBeGreaterThan(0);
  });

  // S11. Task with fixed start time
  it('S11: Task with fixed start time stays at requested time and moves habit if needed', () => {
    const now = toMin('14:00');
    const fixedTask: Task = {
      id: 'task-fixed',
      title: 'Team Presentation',
      durationMin: 60,
      importance: 'high',
      fixedStart: { date: '2026-11-16', start: toMin('17:00') },
      splittable: false,
      remainingMin: 60,
      status: 'open',
      createdAt: '2026-11-16T14:00:00',
    };

    const res = replan({
      date: '2026-11-16',
      now,
      dayConfig: baseDayConfig,
      template: MON_WED_TEMPLATE,
      loggedBlocks: [],
      tasks: [fixedTask],
      habitLog: [],
      settings: DEFAULT_SETTINGS,
    });

    const placedFixed = res.blocks.find((b) => b.taskId === 'task-fixed');
    expect(placedFixed).toBeDefined();
    expect(placedFixed!.start).toBe(toMin('17:00'));
    expect(placedFixed!.end).toBe(toMin('18:00'));
  });

  // S12. Low energy mode
  it('S12: Low energy mode drops all habits to minimum duration', () => {
    const res = replan({
      date: '2026-11-16',
      now: toMin('06:30'),
      dayConfig: { date: '2026-11-16', mode: 'low_energy' },
      template: MON_WED_TEMPLATE,
      loggedBlocks: [],
      tasks: [],
      habitLog: [],
      settings: DEFAULT_SETTINGS,
    });

    const gym = res.blocks.find((b) => b.habitId === 'gym');
    expect(gym!.end - gym!.start).toBe(30);

    const dsa = res.blocks.find((b) => b.habitId === 'dsa');
    expect(dsa!.end - dsa!.start).toBe(45);

    const aiml = res.blocks.find((b) => b.habitId === 'aiml');
    expect(aiml!.end - aiml!.start).toBe(30);
  });

  // S13. Crunch mode
  it('S13: Crunch mode keeps courses at minimum while gym has at least minimum', () => {
    const res = replan({
      date: '2026-11-16',
      now: toMin('06:30'),
      dayConfig: { date: '2026-11-16', mode: 'crunch' },
      template: MON_WED_TEMPLATE,
      loggedBlocks: [],
      tasks: [],
      habitLog: [],
      settings: DEFAULT_SETTINGS,
    });

    const dsa = res.blocks.find((b) => b.habitId === 'dsa');
    expect(dsa!.end - dsa!.start).toBe(45);

    const aiml = res.blocks.find((b) => b.habitId === 'aiml');
    expect(aiml!.end - aiml!.start).toBe(30);

    const gym = res.blocks.find((b) => b.habitId === 'gym');
    expect(gym!.end - gym!.start).toBeGreaterThanOrEqual(30);
  });

  // S14. Sunday
  it('S14: Sunday template has no gym and includes catch-up study and weekly planning', () => {
    const res = replan({
      date: '2026-11-22',
      now: toMin('07:30'),
      dayConfig: { date: '2026-11-22', mode: 'normal' },
      template: SUNDAY_TEMPLATE,
      loggedBlocks: [],
      tasks: [],
      habitLog: [],
      settings: DEFAULT_SETTINGS,
    });

    expect(res.blocks.find((b) => b.habitId === 'gym')).toBeUndefined();
    expect(res.blocks.find((b) => b.habitId === 'catchup')).toBeDefined();
    expect(res.blocks.find((b) => b.habitId === 'weeklyplan')).toBeDefined();
  });

  // S15. Stability / idempotence
  it('S15: Re-running replan with identical inputs returns identical plan', () => {
    const input = {
      date: '2026-11-16',
      now: toMin('14:00'),
      dayConfig: baseDayConfig,
      template: MON_WED_TEMPLATE,
      loggedBlocks: [],
      tasks: [
        {
          id: 'task-1',
          title: 'Essay draft',
          durationMin: 60,
          importance: 'normal' as const,
          splittable: true,
          remainingMin: 60,
          status: 'open' as const,
          createdAt: '2026-11-16T14:00:00',
        },
      ],
      habitLog: [],
      settings: DEFAULT_SETTINGS,
    };

    const res1 = replan(input);
    const res2 = replan(input);

    expect(res1.blocks).toEqual(res2.blocks);
    expect(res1.summary).toEqual(res2.summary);
    expect(res1.conflicts).toEqual(res2.conflicts);
  });

  // S16. Past is locked
  it('S16: Past blocks keep logged status and are not resurrected', () => {
    const now = toMin('18:30');
    const skippedGym: Block = {
      id: 'gym-skipped',
      kind: 'habit',
      habitId: 'gym',
      title: 'Gym',
      start: toMin('16:10'),
      end: toMin('18:10'),
      layer: 'L1',
      status: 'skipped',
      pinned: false,
    };

    const res = replan({
      date: '2026-11-16',
      now,
      dayConfig: baseDayConfig,
      template: MON_WED_TEMPLATE,
      loggedBlocks: [skippedGym],
      tasks: [],
      habitLog: [],
      settings: DEFAULT_SETTINGS,
    });

    const gymBlock = res.blocks.find((b) => b.habitId === 'gym');
    expect(gymBlock).toBeDefined();
    expect(gymBlock!.status).toBe('skipped');
    expect(gymBlock!.end).toBeLessThanOrEqual(now);
  });

  // S17. Future-date mode
  it('S17: Future date mode does not affect today', () => {
    const todayRes = replan({
      date: '2026-11-16',
      now: toMin('06:30'),
      dayConfig: { date: '2026-11-16', mode: 'normal' },
      template: MON_WED_TEMPLATE,
      loggedBlocks: [],
      tasks: [],
      habitLog: [],
      settings: DEFAULT_SETTINGS,
    });

    const futureTuesdayRes = replan({
      date: '2026-11-17',
      now: toMin('06:30'),
      dayConfig: { date: '2026-11-17', mode: 'holiday' },
      template: MON_WED_TEMPLATE,
      loggedBlocks: [],
      tasks: [],
      habitLog: [],
      settings: DEFAULT_SETTINGS,
    });

    // Today has College
    expect(todayRes.blocks.find((b) => b.title === 'College')).toBeDefined();
    // Future Tuesday has no College
    expect(
      futureTuesdayRes.blocks.find((b) => b.title === 'College')
    ).toBeUndefined();
  });

  // S18. Invalid/edge inputs handled gracefully
  it('S18: Edge inputs (now before wake, now after sleep) handled without crashing', () => {
    // Before wake
    const earlyRes = replan({
      date: '2026-11-16',
      now: toMin('05:00'),
      dayConfig: baseDayConfig,
      template: MON_WED_TEMPLATE,
      loggedBlocks: [],
      tasks: [],
      habitLog: [],
      settings: DEFAULT_SETTINGS,
    });
    expect(earlyRes.blocks.length).toBeGreaterThan(0);

    // After sleep
    const lateRes = replan({
      date: '2026-11-16',
      now: toMin('23:00'),
      dayConfig: baseDayConfig,
      template: MON_WED_TEMPLATE,
      loggedBlocks: [],
      tasks: [],
      habitLog: [],
      settings: DEFAULT_SETTINGS,
    });
    expect(lateRes.blocks.length).toBeGreaterThan(0);
  });

  // Property check: No overlapping blocks in any produced schedule
  it('Property check: Never produces overlapping blocks', () => {
    const res = replan({
      date: '2026-11-16',
      now: toMin('14:00'),
      dayConfig: baseDayConfig,
      template: MON_WED_TEMPLATE,
      loggedBlocks: [],
      tasks: [
        {
          id: 't1',
          title: 'Deep Task',
          durationMin: 120,
          importance: 'high',
          splittable: true,
          remainingMin: 120,
          status: 'open',
          createdAt: '2026-11-16T14:00:00',
        },
      ],
      habitLog: [],
      settings: DEFAULT_SETTINGS,
    });

    for (let i = 0; i < res.blocks.length; i++) {
      for (let j = i + 1; j < res.blocks.length; j++) {
        const b1 = res.blocks[i];
        const b2 = res.blocks[j];
        expect(
          isOverlapping(b1, b2),
          `Overlap between "${b1.title}" (${b1.start}-${b1.end}) and "${b2.title}" (${b2.start}-${b2.end})`
        ).toBe(false);
      }
    }
  });
});
