import type { HabitConfig, Settings } from '../types';

export const DEFAULT_WAKE = 390; // 06:30
export const DEFAULT_SLEEP = 1350; // 22:30
export const DEFAULT_MAX_EXTENSION_MIN = 60;
export const DEFAULT_MIN_BLOCK_MIN = 15;
export const DEFAULT_TRANSITION_BUFFER_MIN = 10;
export const DEFAULT_WIND_DOWN_MIN = 30;
export const DEFAULT_HOLIDAY_MIN_FREE_MIN = 90;
export const DEFAULT_COLLEGE_TRAVEL_MIN = 25;
export const DEFAULT_GYM_TRAVEL_MIN = 10;
export const DEFAULT_LATEST_GYM_START = 1230; // 20:30

export const DEFAULT_HABIT_CONFIGS: HabitConfig[] = [
  {
    id: 'gym',
    label: 'Gym',
    fullMin: 120,
    minMin: 30,
    priority: 1,
    latestStart: DEFAULT_LATEST_GYM_START,
  },
  {
    id: 'dsa',
    label: 'Java DSA',
    fullMin: 90,
    minMin: 45,
    priority: 2,
  },
  {
    id: 'aiml',
    label: 'AIML Python',
    fullMin: 90,
    minMin: 30,
    priority: 3,
  },
];

export const DEFAULT_SETTINGS: Settings = {
  wake: DEFAULT_WAKE,
  sleep: DEFAULT_SLEEP,
  maxExtensionMin: DEFAULT_MAX_EXTENSION_MIN,
  minBlockMin: DEFAULT_MIN_BLOCK_MIN,
  transitionBufferMin: DEFAULT_TRANSITION_BUFFER_MIN,
  windDownMin: DEFAULT_WIND_DOWN_MIN,
  holidayMinFreeMin: DEFAULT_HOLIDAY_MIN_FREE_MIN,
  habits: DEFAULT_HABIT_CONFIGS,
  collegeTravelMin: DEFAULT_COLLEGE_TRAVEL_MIN,
  gymTravelMin: DEFAULT_GYM_TRAVEL_MIN,
  ai: {
    enabled: false,
    model: 'gemini-1.5-flash-latest',
  },
};
