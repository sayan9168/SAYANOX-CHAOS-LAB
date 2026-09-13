export type SimulationPoint = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

export type SimulationParams = {
  gravity: number;
  population: number;
  randomness: number;
  speed: number;
};

export const LIMITS = {
  minPopulation: 10,
  maxPopulation: 140,
  minGravity: 0,
  maxGravity: 1,
  minRandomness: 0,
  maxRandomness: 1,
  minSpeed: 0,
  maxSpeed: 3,
} as const;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizeParams(params: SimulationParams): SimulationParams {
  return {
    gravity: clamp(params.gravity, LIMITS.minGravity, LIMITS.maxGravity),
    population: Math.round(clamp(params.population, LIMITS.minPopulation, LIMITS.maxPopulation)),
    randomness: clamp(params.randomness, LIMITS.minRandomness, LIMITS.maxRandomness),
    speed: clamp(params.speed, LIMITS.minSpeed, LIMITS.maxSpeed),
  };
}

export function createPoints(count: number, width: number, height: number, random = Math.random): SimulationPoint[] {
  const safeCount = Math.max(1, Math.round(count));
  return Array.from({ length: safeCount }, () => ({
    x: random() * Math.max(1, width),
    y: random() * Math.max(1, height),
    vx: (random() - 0.5) * 2,
    vy: (random() - 0.5) * 2,
    radius: 1.5 + random() * 2,
  }));
}

export function wrap(value: number, size: number): number {
  if (size <= 0) return 0;
  return ((value % size) + size) % size;
}
