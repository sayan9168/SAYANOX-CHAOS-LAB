import { describe, expect, it } from 'vitest';
import { LIMITS, clamp, createPoints, normalizeParams, wrap } from './simulation';

describe('simulation utilities', () => {
  it('clamps numeric values safely', () => {
    expect(clamp(-1, 0, 1)).toBe(0);
    expect(clamp(2, 0, 1)).toBe(1);
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });

  it('normalizes every simulation parameter', () => {
    expect(normalizeParams({ gravity: -2, population: 999, randomness: 2, speed: -1 })).toEqual({
      gravity: 0,
      population: LIMITS.maxPopulation,
      randomness: 1,
      speed: 0,
    });
  });

  it('rounds population to an integer inside the allowed range', () => {
    expect(normalizeParams({ gravity: 0.5, population: 70.7, randomness: 0.2, speed: 1.2 }).population).toBe(71);
    expect(normalizeParams({ gravity: 0.5, population: 1, randomness: 0.2, speed: 1.2 }).population).toBe(10);
  });

  it('creates the requested number of points with a deterministic random source', () => {
    const points = createPoints(3, 100, 50, () => 0.5);
    expect(points).toHaveLength(3);
    expect(points.every((point) => point.x === 50 && point.y === 25)).toBe(true);
    expect(points.every((point) => point.vx === 0 && point.vy === 0)).toBe(true);
  });

  it('wraps positions across canvas boundaries', () => {
    expect(wrap(-5, 100)).toBe(95);
    expect(wrap(105, 100)).toBe(5);
    expect(wrap(20, 0)).toBe(0);
  });
});
