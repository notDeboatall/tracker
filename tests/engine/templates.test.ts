import { describe, it, expect } from 'vitest';
import {
  MON_WED_TEMPLATE,
  THU_SAT_TEMPLATE,
  SUNDAY_TEMPLATE,
  getTemplateForWeekday,
} from '../../src/engine/templates';
import { DEFAULT_WAKE, DEFAULT_SLEEP } from '../../src/engine/constants';
import { isOverlapping } from '../../src/engine/time';

describe('engine/templates (Seed Templates & Scenario S1)', () => {
  const templates = [
    { name: 'Mon-Wed', template: MON_WED_TEMPLATE, wake: DEFAULT_WAKE },
    { name: 'Thu-Sat', template: THU_SAT_TEMPLATE, wake: DEFAULT_WAKE },
    { name: 'Sunday', template: SUNDAY_TEMPLATE, wake: 450 }, // 07:30
  ];

  templates.forEach(({ name, template, wake }) => {
    describe(`${name} template properties`, () => {
      it('has strictly increasing non-empty blocks (start < end)', () => {
        for (const block of template.blocks) {
          expect(block.start).toBeLessThan(block.end);
        }
      });

      it('has zero overlapping blocks', () => {
        for (let i = 0; i < template.blocks.length; i++) {
          for (let j = i + 1; j < template.blocks.length; j++) {
            const b1 = template.blocks[i];
            const b2 = template.blocks[j];
            const overlap = isOverlapping(b1, b2);
            expect(
              overlap,
              `Block "${b1.title}" (${b1.start}-${b1.end}) overlaps with "${b2.title}" (${b2.start}-${b2.end})`
            ).toBe(false);
          }
        }
      });

      it('keeps all blocks strictly inside [wake, sleep] boundary', () => {
        for (const block of template.blocks) {
          expect(block.start).toBeGreaterThanOrEqual(wake);
          expect(block.end).toBeLessThanOrEqual(DEFAULT_SLEEP);
        }
      });

      it('does NOT model sleep as a template block', () => {
        const sleepBlock = template.blocks.find(
          (b) => b.title.toLowerCase() === 'sleep'
        );
        expect(sleepBlock).toBeUndefined();
      });
    });
  });

  describe('Mon-Wed template exact specification', () => {
    it('contains all required habits at full duration', () => {
      const gym = MON_WED_TEMPLATE.blocks.find((b) => b.habitId === 'gym');
      const dsa = MON_WED_TEMPLATE.blocks.find((b) => b.habitId === 'dsa');
      const aiml = MON_WED_TEMPLATE.blocks.find((b) => b.habitId === 'aiml');

      expect(gym).toBeDefined();
      expect(gym!.end - gym!.start).toBe(120); // 16:10 to 18:10

      expect(dsa).toBeDefined();
      expect(dsa!.end - dsa!.start).toBe(90); // 14:00 to 15:30

      expect(aiml).toBeDefined();
      expect(aiml!.end - aiml!.start).toBe(90); // 19:45 to 21:15
    });

    it('contains college and rides as fixed L0 blocks', () => {
      const college = MON_WED_TEMPLATE.blocks.find((b) => b.title === 'College');
      expect(college).toBeDefined();
      expect(college!.layer).toBe('L0');
      expect(college!.start).toBe(480); // 08:00
      expect(college!.end).toBe(780); // 13:00

      const fixedRides = MON_WED_TEMPLATE.blocks.filter(
        (b) => b.kind === 'fixed' && b.title.startsWith('Ride')
      );
      expect(fixedRides.length).toBe(2); // ride to college, ride home
      fixedRides.forEach((r) => {
        expect(r.kind).toBe('fixed');
        expect(r.layer).toBe('L0');
      });
    });
  });

  describe('Thu-Sat template exact specification', () => {
    it('schedules morning gym and afternoon college', () => {
      const gym = THU_SAT_TEMPLATE.blocks.find((b) => b.habitId === 'gym');
      expect(gym).toBeDefined();
      expect(gym!.start).toBe(450); // 07:30
      expect(gym!.end).toBe(570); // 09:30

      const college = THU_SAT_TEMPLATE.blocks.find((b) => b.title === 'College');
      expect(college).toBeDefined();
      expect(college!.start).toBe(780); // 13:00
      expect(college!.end).toBe(1140); // 19:00
      expect(college!.layer).toBe('L0');

      const aiml = THU_SAT_TEMPLATE.blocks.find((b) => b.habitId === 'aiml');
      expect(aiml).toBeDefined();
      expect(aiml!.end - aiml!.start).toBe(60); // 60 min on Thu-Sat
    });
  });

  describe('Sunday template exact specification', () => {
    it('has no gym, and all blocks are movable', () => {
      const gym = SUNDAY_TEMPLATE.blocks.find((b) => b.habitId === 'gym');
      expect(gym).toBeUndefined();

      const catchup = SUNDAY_TEMPLATE.blocks.find(
        (b) => b.habitId === 'catchup'
      );
      expect(catchup).toBeDefined();
      expect(catchup!.end - catchup!.start).toBe(150); // 10:00 to 12:30 (2.5h)

      const weeklyPlan = SUNDAY_TEMPLATE.blocks.find(
        (b) => b.habitId === 'weeklyplan'
      );
      expect(weeklyPlan).toBeDefined();
      expect(weeklyPlan!.end - weeklyPlan!.start).toBe(20); // 19:00 to 19:20

      // All blocks movable
      SUNDAY_TEMPLATE.blocks.forEach((b) => {
        expect(b.pinned).toBe(false);
      });
    });
  });

  describe('getTemplateForWeekday', () => {
    it('returns Sunday template for weekday 0', () => {
      expect(getTemplateForWeekday(0).id).toBe('sunday');
    });

    it('returns Mon-Wed template for weekdays 1, 2, 3', () => {
      expect(getTemplateForWeekday(1).id).toBe('mon_wed');
      expect(getTemplateForWeekday(2).id).toBe('mon_wed');
      expect(getTemplateForWeekday(3).id).toBe('mon_wed');
    });

    it('returns Thu-Sat template for weekdays 4, 5, 6', () => {
      expect(getTemplateForWeekday(4).id).toBe('thu_sat');
      expect(getTemplateForWeekday(5).id).toBe('thu_sat');
      expect(getTemplateForWeekday(6).id).toBe('thu_sat');
    });

    it('throws for invalid weekday numbers', () => {
      expect(() => getTemplateForWeekday(-1)).toThrow('Invalid weekday index');
      expect(() => getTemplateForWeekday(7)).toThrow('Invalid weekday index');
    });
  });
});
