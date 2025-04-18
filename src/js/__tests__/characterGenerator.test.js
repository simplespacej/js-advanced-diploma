import { characterGenerator } from '../generators.js';
import Bowman from '../characters/Bowman.js';
import Magician from '../characters/Magician.js';

test('characterGenerator returns characters of allowed types', () => {
  const allowed = [Bowman, Magician];
  const gen = characterGenerator(allowed, 2);

  for (let i = 0; i < 10; i++) {
    const char = gen.next().value;
    const valid = char instanceof Bowman || char instanceof Magician;
    expect(valid).toBe(true);
  }
});
