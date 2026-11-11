import { describe, it, expect } from 'vitest';
import {
  toMin,
  toHHMM,
  clamp,
  formatDuration,
  isOverlapping,
} from '../../src/engine/time';

describe('engine/time helpers', () => {
  describe('toMin', () => {
    it('converts valid HH:mm strings to minutes from midnight', () => {
      expect(toMin('00:00')).toBe(0);
      expect(toMin('06:30')).toBe(390);
      expect(toMin('08:00')).toBe(480);
      expect(toMin('14:30')).toBe(870);
      expect(toMin('22:30')).toBe(1350);
      expect(toMin('23:59')).toBe(1439);
    });

    it('handles single-digit hours like 8:00', () => {
      expect(toMin('8:00')).toBe(480);
      expect(toMin('6:30')).toBe(390);
    });

    it('throws on invalid formats or non-strings', () => {
      expect(() => toMin('' as unknown as string)).toThrow('Invalid time format');
      expect(() => toMin('abc')).toThrow('Invalid time format');
      expect(() => toMin('14')).toThrow('Invalid time format');
      expect(() => toMin('14:3')).toThrow('Invalid time format');
      expect(() => toMin('14:300')).toThrow('Invalid time format');
      expect(() => toMin(null as unknown as string)).toThrow('expected string');
    });

    it('throws when hours or minutes are out of range', () => {
      expect(() => toMin('24:00')).toThrow('hours must be between 0 and 23');
      expect(() => toMin('25:10')).toThrow('hours must be between 0 and 23');
      expect(() => toMin('12:60')).toThrow('minutes must be between 0 and 59');
      expect(() => toMin('12:75')).toThrow('minutes must be between 0 and 59');
    });
  });

  describe('toHHMM', () => {
    it('converts minutes to HH:mm string', () => {
      expect(toHHMM(0)).toBe('00:00');
      expect(toHHMM(390)).toBe('06:30');
      expect(toHHMM(480)).toBe('08:00');
      expect(toHHMM(870)).toBe('14:30');
      expect(toHHMM(1350)).toBe('22:30');
      expect(toHHMM(1439)).toBe('23:59');
      expect(toHHMM(1440)).toBe('24:00');
    });

    it('throws on invalid inputs', () => {
      expect(() => toHHMM(-1)).toThrow('out of bounds');
      expect(() => toHHMM(1441)).toThrow('out of bounds');
      expect(() => toHHMM(NaN)).toThrow('expected finite number');
      expect(() => toHHMM(Infinity)).toThrow('expected finite number');
    });
  });

  describe('clamp', () => {
    it('clamps numbers within given bounds', () => {
      expect(clamp(5, 10, 20)).toBe(10);
      expect(clamp(15, 10, 20)).toBe(15);
      expect(clamp(25, 10, 20)).toBe(20);
    });

    it('throws when min > max', () => {
      expect(() => clamp(10, 20, 10)).toThrow('cannot exceed max');
    });
  });

  describe('formatDuration', () => {
    it('formats durations in human-readable strings', () => {
      expect(formatDuration(0)).toBe('0m');
      expect(formatDuration(15)).toBe('15m');
      expect(formatDuration(45)).toBe('45m');
      expect(formatDuration(60)).toBe('1h');
      expect(formatDuration(90)).toBe('1h 30m');
      expect(formatDuration(120)).toBe('2h');
      expect(formatDuration(180)).toBe('3h');
    });

    it('throws on negative duration', () => {
      expect(() => formatDuration(-10)).toThrow('cannot be negative');
    });
  });

  describe('isOverlapping', () => {
    it('detects overlapping intervals', () => {
      expect(
        isOverlapping({ start: 100, end: 200 }, { start: 150, end: 250 })
      ).toBe(true);
      expect(
        isOverlapping({ start: 150, end: 250 }, { start: 100, end: 200 })
      ).toBe(true);
      expect(
        isOverlapping({ start: 100, end: 300 }, { start: 150, end: 200 })
      ).toBe(true);
    });

    it('considers touching intervals as non-overlapping', () => {
      expect(
        isOverlapping({ start: 100, end: 200 }, { start: 200, end: 300 })
      ).toBe(false);
      expect(
        isOverlapping({ start: 200, end: 300 }, { start: 100, end: 200 })
      ).toBe(false);
    });

    it('detects disjoint intervals', () => {
      expect(
        isOverlapping({ start: 100, end: 200 }, { start: 250, end: 300 })
      ).toBe(false);
    });
  });
});

