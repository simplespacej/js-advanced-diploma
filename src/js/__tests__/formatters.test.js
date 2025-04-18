import { formatCharacterInfo } from '../helpers/formatters.js';
import Daemon from '../characters/Daemon.js';

test('formatCharacterInfo returns correct string', () => {
  const char = new Daemon(1);
  char.attack = 10;
  char.defence = 40;
  char.health = 50;

  const result = formatCharacterInfo(char);
  expect(result).toBe('🎖1 ⚔10 🛡40 ❤50');
});
