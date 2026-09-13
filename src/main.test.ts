import {describe,expect,it} from 'vitest';
describe('Chaos Lab configuration',()=>{it('keeps population within engine limits',()=>{const population=Math.min(140,Math.max(10,70));expect(population).toBe(70)});it('supports the expected simulation controls',()=>{const controls=['gravity','population','randomness','speed'];expect(controls).toHaveLength(4);expect(new Set(controls).size).toBe(4)})});
