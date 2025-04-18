import Radius from '../Radius';
import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';
import Vampire from '../characters/Vampire';
import Undead from '../characters/Undead';
import Daemon from '../characters/Daemon';

describe('Radius movement and attack logic', () => {
  test('Bowman movement and attack radius', () => {
    const radius = new Radius(27, new Bowman().type);
    const move = radius.move();
    const attack = radius.attack();

    expect(move.length).toBeGreaterThan(0);
    expect(attack.length).toBeGreaterThan(0);
    expect(move.every(pos => isInRadius(27, pos, 2))).toBe(true);
    expect(attack.every(pos => isInRadius(27, pos, 2))).toBe(true);
  });

  test('Swordsman movement: 4, attack: 1', () => {
    const radius = new Radius(27, new Swordsman().type);
    expect(radius.move().every(pos => isInRadius(27, pos, 4))).toBe(true);
    expect(radius.attack().every(pos => isInRadius(27, pos, 1))).toBe(true);
  });

  test('Magician movement: 1, attack: 4', () => {
    const radius = new Radius(27, new Magician().type);
    expect(radius.move().every(pos => isInRadius(27, pos, 1))).toBe(true);
    expect(radius.attack().every(pos => isInRadius(27, pos, 4))).toBe(true);
  });

  test('Vampire movement and attack radius = 2', () => {
    const radius = new Radius(27, new Vampire().type);
    expect(radius.move().every(pos => isInRadius(27, pos, 2))).toBe(true);
    expect(radius.attack().every(pos => isInRadius(27, pos, 2))).toBe(true);
  });

  test('Undead movement: 4, attack: 1', () => {
    const radius = new Radius(27, new Undead().type);
    expect(radius.move().every(pos => isInRadius(27, pos, 4))).toBe(true);
    expect(radius.attack().every(pos => isInRadius(27, pos, 1))).toBe(true);
  });

  test('Daemon movement: 1, attack: 4', () => {
    const radius = new Radius(27, new Daemon().type);
    expect(radius.move().every(pos => isInRadius(27, pos, 1))).toBe(true);
    expect(radius.attack().every(pos => isInRadius(27, pos, 4))).toBe(true);
  });
});

function isInRadius(center, pos, radius) {
  const boardSize = 8;
  const cx = center % boardSize;
  const cy = Math.floor(center / boardSize);
  const px = pos % boardSize;
  const py = Math.floor(pos / boardSize);

  return Math.max(Math.abs(cx - px), Math.abs(cy - py)) <= radius;
}
