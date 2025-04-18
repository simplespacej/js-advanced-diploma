import PositionedCharacter from "./PositionedCharacter";
import Bowman from './characters/Bowman.js';
import Swordsman from './characters/Swordsman.js';
import Magician from './characters/Magician.js';
import Vampire from './characters/Vampire.js';
import Undead from './characters/Undead.js';
import Daemon from './characters/Daemon.js';

export default class GameState {
  constructor() {
    this.currentPlayer = 'player';
    this.score = 0;
    this.maxScore = 0;
    this.positionedCharacters = [];
    this.currentTheme = 0;
  }

  static from(object) {
    const state = new GameState();

    state.currentPlayer = object.currentPlayer;
    state.score = object.score;
    state.maxScore = object.maxScore;
    state.currentTheme = object.currentTheme;

    const characterClasses = {
      bowman: Bowman,
      swordsman: Swordsman,
      magician: Magician,
      vampire: Vampire,
      undead: Undead,
      daemon: Daemon,
    };

    state.positionedCharacters = object.positionedCharacters.map(({ character, position }) => {
      const CharacterClass = characterClasses[character.type];
      const restored = new CharacterClass(character.level);
      restored.attack = character.attack;
      restored.defence = character.defence;
      restored.health = character.health;

      return new PositionedCharacter(restored, position);
    });

    return state;
  }
}
