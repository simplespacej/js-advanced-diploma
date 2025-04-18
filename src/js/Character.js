/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа, от 1 до 4
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman
 * bowman
 * magician
 * daemon
 * undead
 * vampire
 */
export default class Character {
  constructor(level, type = 'generic') {
    if (new.target === Character) {
      throw new Error('Нельзя создавать объекты класса Character напрямую');
    }

    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;

    // Применяем усиление параметров без повышения уровня
    for (let i = 1; i < level; i++) {
      this.levelUpStats();
    }
  }

  levelUp() {
    this.level += 1;
    this.levelUpStats();
  }

  levelUpStats() {
    this.attack = Math.max(this.attack, this.attack * (80 + this.health) / 100);
    this.defence = Math.max(this.defence, this.defence * (80 + this.health) / 100);
    this.health = Math.min(this.health + 80, 100);
  }
}
