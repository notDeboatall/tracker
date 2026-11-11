import { describe, it, expect } from 'vitest';
import { applyDayMode } from '../../src/engine/modes';
import { MON_WED_TEMPLATE } from '../../src/engine/templates';
import { toMin } from '../../src/engine/time';

describe('engine/modes', () => {
  it('returns unchanged copy for normal mode', () => {
    const transformed = applyDayMode({
      baseBlocks: MON_WED_TEMPLATE.blocks,
      mode: 'normal',
    });

    expect(transformed.length).toBe(MON_WED_TEMPLATE.blocks.length);
    expect(transformed[0].title).toBe(MON_WED_TEMPLATE.blocks[0].title);
  });

  describe('holiday mode (Scenario S5)', () => {
    it('removes college and its travel rides', () => {
      const transformed = applyDayMode({
        baseBlocks: MON_WED_TEMPLATE.blocks,
        mode: 'holiday',
      });

      const college = transformed.find((b) => b.title === 'College');
      expect(college).toBeUndefined();

      const collegeRides = transformed.filter(
        (b) =>
          b.title.toLowerCase().includes('ride to college') ||
          (b.title.toLowerCase() === 'ride home' && b.kind === 'fixed')
      );
      expect(collegeRides.length).toBe(0);
    });

    it('positions Gym in morning 07:30 for 120 min', () => {
      const transformed = applyDayMode({
        baseBlocks: MON_WED_TEMPLATE.blocks,
        mode: 'holiday',
      });

      const gym = transformed.find((b) => b.habitId === 'gym');
      expect(gym).toBeDefined();
      expect(gym!.start).toBe(toMin('07:30'));
      expect(gym!.end).toBe(toMin('09:30'));
    });

    it('positions DSA and AIML at full duration in late morning / afternoon', () => {
      const transformed = applyDayMode({
        baseBlocks: MON_WED_TEMPLATE.blocks,
        mode: 'holiday',
      });

      const dsa = transformed.find((b) => b.habitId === 'dsa');
      expect(dsa).toBeDefined();
      expect(dsa!.end - dsa!.start).toBe(90);

      const aiml = transformed.find((b) => b.habitId === 'aiml');
      expect(aiml).toBeDefined();
      expect(aiml!.end - aiml!.start).toBe(90);
    });

    it('leaves at least 90 minutes of unplanned free time', () => {
      const transformed = applyDayMode({
        baseBlocks: MON_WED_TEMPLATE.blocks,
        mode: 'holiday',
      });

      const freeBlocks = transformed.filter((b) => b.kind === 'free');
      const totalFreeMin = freeBlocks.reduce(
        (acc, b) => acc + (b.end - b.start),
        0
      );
      expect(totalFreeMin).toBeGreaterThanOrEqual(90);
    });
  });

  describe('partial mode (Scenario S7)', () => {
    it('shifts college end and ride home accordingly', () => {
      const collegeEnd = toMin('11:00'); // College ends at 11:00 instead of 13:00

      const transformed = applyDayMode({
        baseBlocks: MON_WED_TEMPLATE.blocks,
        mode: 'partial',
        partial: { collegeEnd },
        collegeTravelMin: 25,
      });

      const college = transformed.find((b) => b.title === 'College');
      expect(college).toBeDefined();
      expect(college!.end).toBe(collegeEnd);

      const rideHome = transformed.find(
        (b) => b.title.toLowerCase() === 'ride home' && b.kind === 'fixed'
      );
      expect(rideHome).toBeDefined();
      expect(rideHome!.start).toBe(collegeEnd);
      expect(rideHome!.end).toBe(collegeEnd + 25);
    });

    it('shifts college start and ride to college accordingly', () => {
      const collegeStart = toMin('10:00'); // Starts late at 10:00

      const transformed = applyDayMode({
        baseBlocks: MON_WED_TEMPLATE.blocks,
        mode: 'partial',
        partial: { collegeStart },
        collegeTravelMin: 25,
      });

      const college = transformed.find((b) => b.title === 'College');
      expect(college).toBeDefined();
      expect(college!.start).toBe(collegeStart);

      const rideToCollege = transformed.find((b) =>
        b.title.toLowerCase().includes('ride to college')
      );
      expect(rideToCollege).toBeDefined();
      expect(rideToCollege!.end).toBe(collegeStart);
      expect(rideToCollege!.start).toBe(collegeStart - 25);
    });
  });

  describe('low_energy mode (Scenario S12)', () => {
    it('shrinks all habits to minimum duration', () => {
      const transformed = applyDayMode({
        baseBlocks: MON_WED_TEMPLATE.blocks,
        mode: 'low_energy',
      });

      const gym = transformed.find((b) => b.habitId === 'gym');
      expect(gym).toBeDefined();
      expect(gym!.end - gym!.start).toBe(30);
      expect(gym!.isMinimum).toBe(true);

      const dsa = transformed.find((b) => b.habitId === 'dsa');
      expect(dsa).toBeDefined();
      expect(dsa!.end - dsa!.start).toBe(45);
      expect(dsa!.isMinimum).toBe(true);

      const aiml = transformed.find((b) => b.habitId === 'aiml');
      expect(aiml).toBeDefined();
      expect(aiml!.end - aiml!.start).toBe(30);
      expect(aiml!.isMinimum).toBe(true);
    });
  });

  describe('crunch mode (Scenario S13)', () => {
    it('shrinks course blocks to minimum while preserving gym at least minimum', () => {
      const transformed = applyDayMode({
        baseBlocks: MON_WED_TEMPLATE.blocks,
        mode: 'crunch',
      });

      const dsa = transformed.find((b) => b.habitId === 'dsa');
      expect(dsa).toBeDefined();
      expect(dsa!.end - dsa!.start).toBe(45);

      const aiml = transformed.find((b) => b.habitId === 'aiml');
      expect(aiml).toBeDefined();
      expect(aiml!.end - aiml!.start).toBe(30);

      const gym = transformed.find((b) => b.habitId === 'gym');
      expect(gym).toBeDefined();
      expect(gym!.end - gym!.start).toBeGreaterThanOrEqual(30);
    });
  });
});
