import { generateTeam } from '../generators.js';
import Bowman from '../characters/Bowman.js';
import Swordsman from '../characters/Swordsman.js';

test('generateTeam creates correct number of characters within level', () => {
  const types = [Bowman, Swordsman];
  const team = generateTeam(types, 3, 5);

  expect(team.characters.length).toBe(5);

  for (const char of team.characters) {
    expect(char.level).toBeGreaterThanOrEqual(1);
    expect(char.level).toBeLessThanOrEqual(3);
  }
});
