/**
 * Seed Day Templates
 * Source of truth: brain/01_USER_PROFILE.md and user directives.
 * Sleep is NOT modeled as a template block (it crosses midnight and is defined by settings.sleep/wake).
 * All blocks are strictly inside [wake, sleep].
 */

import type { DayTemplate, TemplateBlock } from '../types';
import { toMin } from './time';

/**
 * Seed template: MON-WED ("college-morning" day)
 * Wake 06:30 (390), Sleep 22:30 (1350)
 */
export const MON_WED_BLOCKS: TemplateBlock[] = [
  {
    kind: 'routine',
    title: 'Wake up, get ready',
    start: toMin('06:30'),
    end: toMin('07:30'),
    layer: 'L5',
    pinned: false,
  },
  {
    kind: 'fixed',
    title: 'Ride to college',
    start: toMin('07:30'),
    end: toMin('08:00'),
    layer: 'L0',
    pinned: false,
  },
  {
    kind: 'fixed',
    title: 'College',
    start: toMin('08:00'),
    end: toMin('13:00'),
    layer: 'L0',
    pinned: false,
  },
  {
    kind: 'fixed',
    title: 'Ride home',
    start: toMin('13:00'),
    end: toMin('13:30'),
    layer: 'L0',
    pinned: false,
  },
  {
    kind: 'routine',
    title: 'Lunch and rest',
    start: toMin('13:30'),
    end: toMin('14:00'),
    layer: 'L5',
    pinned: false,
  },
  {
    kind: 'habit',
    title: 'Java DSA',
    habitId: 'dsa',
    start: toMin('14:00'),
    end: toMin('15:30'),
    layer: 'L4',
    pinned: false,
  },
  {
    kind: 'routine',
    title: 'Snack, pack bag',
    start: toMin('15:30'),
    end: toMin('16:00'),
    layer: 'L5',
    pinned: false,
  },
  {
    kind: 'routine',
    title: 'Ride to gym',
    start: toMin('16:00'),
    end: toMin('16:10'),
    layer: 'L5',
    pinned: false,
  },
  {
    kind: 'habit',
    title: 'Gym',
    habitId: 'gym',
    start: toMin('16:10'),
    end: toMin('18:10'),
    layer: 'L4',
    pinned: false,
  },
  {
    kind: 'routine',
    title: 'Ride home, freshen up',
    start: toMin('18:10'),
    end: toMin('19:00'),
    layer: 'L5',
    pinned: false,
  },
  {
    kind: 'routine',
    title: 'Dinner',
    start: toMin('19:00'),
    end: toMin('19:45'),
    layer: 'L5',
    pinned: false,
  },
  {
    kind: 'habit',
    title: 'AIML Python',
    habitId: 'aiml',
    start: toMin('19:45'),
    end: toMin('21:15'),
    layer: 'L4',
    pinned: false,
  },
  {
    kind: 'free',
    title: 'Free / wind down',
    start: toMin('21:15'),
    end: toMin('22:30'),
    layer: 'L5',
    pinned: false,
  },
];

export const MON_WED_TEMPLATE: DayTemplate = {
  id: 'mon_wed',
  weekdays: [1, 2, 3], // Mon, Tue, Wed
  blocks: MON_WED_BLOCKS,
};

/**
 * Seed template: THU-SAT ("college-afternoon" day)
 * Wake 06:30 (390), Sleep 22:30 (1350)
 */
export const THU_SAT_BLOCKS: TemplateBlock[] = [
  {
    kind: 'routine',
    title: 'Wake up, get ready',
    start: toMin('06:30'),
    end: toMin('07:15'),
    layer: 'L5',
    pinned: false,
  },
  {
    kind: 'routine',
    title: 'Ride to gym',
    start: toMin('07:15'),
    end: toMin('07:25'),
    layer: 'L5',
    pinned: false,
  },
  {
    kind: 'routine',
    title: 'Gym check-in / warm-up transition',
    start: toMin('07:25'),
    end: toMin('07:30'),
    layer: 'L5',
    pinned: false,
  },
  {
    kind: 'habit',
    title: 'Gym',
    habitId: 'gym',
    start: toMin('07:30'),
    end: toMin('09:30'),
    layer: 'L4',
    pinned: false,
  },
  {
    kind: 'routine',
    title: 'Ride home, breakfast',
    start: toMin('09:30'),
    end: toMin('10:15'),
    layer: 'L5',
    pinned: false,
  },
  {
    kind: 'habit',
    title: 'Java DSA',
    habitId: 'dsa',
    start: toMin('10:15'),
    end: toMin('11:45'),
    layer: 'L4',
    pinned: false,
  },
  {
    kind: 'routine',
    title: 'Lunch and rest',
    start: toMin('11:45'),
    end: toMin('12:30'),
    layer: 'L5',
    pinned: false,
  },
  {
    kind: 'fixed',
    title: 'Ride to college',
    start: toMin('12:30'),
    end: toMin('13:00'),
    layer: 'L0',
    pinned: false,
  },
  {
    kind: 'fixed',
    title: 'College',
    start: toMin('13:00'),
    end: toMin('19:00'),
    layer: 'L0',
    pinned: false,
  },
  {
    kind: 'fixed',
    title: 'Ride home',
    start: toMin('19:00'),
    end: toMin('19:30'),
    layer: 'L0',
    pinned: false,
  },
  {
    kind: 'routine',
    title: 'Dinner',
    start: toMin('19:30'),
    end: toMin('20:30'),
    layer: 'L5',
    pinned: false,
  },
  {
    kind: 'habit',
    title: 'AIML Python',
    habitId: 'aiml',
    start: toMin('20:30'),
    end: toMin('21:30'),
    layer: 'L4',
    pinned: false,
  },
  {
    kind: 'free',
    title: 'Free / wind down',
    start: toMin('21:30'),
    end: toMin('22:30'),
    layer: 'L5',
    pinned: false,
  },
];

export const THU_SAT_TEMPLATE: DayTemplate = {
  id: 'thu_sat',
  weekdays: [4, 5, 6], // Thu, Fri, Sat
  blocks: THU_SAT_BLOCKS,
};

/**
 * Seed template: SUNDAY
 * Wake 07:30 (450), Sleep 22:30 (1350)
 * All blocks are movable (pinned: false, layer L4/L5) per user profile.
 */
export const SUNDAY_BLOCKS: TemplateBlock[] = [
  {
    kind: 'routine',
    title: 'Sleep in, breakfast',
    start: toMin('07:30'),
    end: toMin('10:00'),
    layer: 'L5',
    pinned: false,
  },
  {
    kind: 'habit',
    title: 'Catch-up study',
    habitId: 'catchup',
    start: toMin('10:00'),
    end: toMin('12:30'),
    layer: 'L4',
    pinned: false,
  },
  {
    kind: 'free',
    title: 'Rest / free time',
    start: toMin('12:30'),
    end: toMin('19:00'),
    layer: 'L5',
    pinned: false,
  },
  {
    kind: 'habit',
    title: 'Weekly planning',
    habitId: 'weeklyplan',
    start: toMin('19:00'),
    end: toMin('19:20'),
    layer: 'L4',
    pinned: false,
  },
  {
    kind: 'routine',
    title: 'Dinner / wind down',
    start: toMin('19:20'),
    end: toMin('22:30'),
    layer: 'L5',
    pinned: false,
  },
];

export const SUNDAY_TEMPLATE: DayTemplate = {
  id: 'sunday',
  weekdays: [0], // Sunday
  blocks: SUNDAY_BLOCKS,
};

/**
 * Maps weekday index (0 = Sunday, 1 = Monday, ..., 6 = Saturday) to its seed DayTemplate.
 */
export function getTemplateForWeekday(weekday: number): DayTemplate {
  if (weekday === 0) return SUNDAY_TEMPLATE;
  if (weekday >= 1 && weekday <= 3) return MON_WED_TEMPLATE;
  if (weekday >= 4 && weekday <= 6) return THU_SAT_TEMPLATE;
  throw new Error(`Invalid weekday index: ${weekday}. Expected 0 to 6.`);
}
