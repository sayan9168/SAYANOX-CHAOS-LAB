import { describe, expect, it } from 'vitest';
import { clamp, createPoints, normalizeParams, wrap } from './simulation';

describe('simulation utilities', () => {
  it('clamps values to a safe range', () => {
    expect(clamp(-1, 0, 1)).toBe(0);
    expect(clamp(2, 0, 1)).toBe(1);
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });

  it('normalizes simulation parameters', () => {
    expect(normalizeParams({ gravity: 2, population: 20.7, randomness: -1, speed: 9 })).toEqual({
      gravity: 1,
      population: 21,
      randomness: 0,
      speed: 3,
    });
  });

  it('creates the requested number of points inside the canvas', () => {
    let seed = 1;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const points = createPoints(25, 800, 500, random);
    expect(points).toHaveLength(25);
    expect(points.every((point) => point.x >= 0 && point.x <= 800)).toBe(true);
    expect(points.every((point) => point.y >= 0 && point.y <= 500)).toBe(true);
  });

  it('wraps coordinates correctly', () => {
    expect(wrap(805, 800)).toBe(5);
    expect(wrap(-5, 800)).toBe(795);
    expect(wrap(10, 0)).toBe(0);
  });
});
