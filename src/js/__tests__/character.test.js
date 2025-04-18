import Character from '../Character.js';
import Bowman from '../characters/Bowman.js';

test('Character throws error when instantiated directly', () => {
  expect(() => new Character(1, 'bowman')).toThrow('Нельзя создавать объекты класса Character напрямую');
});

test('Bowman can be created and has correct level', () => {
  const bow = new Bowman(1);
  expect(bow.level).toBe(1);
  expect(bow.attack).toBe(25);
  expect(bow.defence).toBe(25);
  expect(bow.health).toBe(50);
  expect(bow.type).toBe('bowman');
});
