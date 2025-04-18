import { calcTileType } from '../utils.js';

test('correct tile types on 8x8 board', () => {
  expect(calcTileType(0, 8)).toBe('top-left');
  expect(calcTileType(7, 8)).toBe('top-right');
  expect(calcTileType(8, 8)).toBe('left');
  expect(calcTileType(63, 8)).toBe('bottom-right');
  expect(calcTileType(56, 8)).toBe('bottom-left');
  expect(calcTileType(28, 8)).toBe('center');
});
