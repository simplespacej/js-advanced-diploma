import Radius from "./Radius";

export default class AiMotions {
  constructor(state, positionedCharacters, gamePlay) {
    this.state = state;
    this.positionedCharacters = positionedCharacters;
    this.gamePlay = gamePlay;
  }

  async strategy() {
    if (this.state.currentPlayer !== 'ai') return;

    const isPlayer = (char) =>
      ['bowman', 'swordsman', 'magician'].includes(char.type);
    const isEnemy = (char) =>
      ['vampire', 'undead', 'daemon'].includes(char.type);

    const players = this.positionedCharacters.filter((p) =>
      isPlayer(p.character)
    );
    const enemies = this.positionedCharacters.filter((p) =>
      isEnemy(p.character)
    );

    let maxAttack = 0;
    let attackerEnemy = null;

    let minDefence = Infinity;
    let targetPlayer = null;

    for (const player of players) {
      if (player.character.defence < minDefence) {
        minDefence = player.character.defence;
        targetPlayer = player;
      }
    }

    for (const enemy of enemies) {
      const enemyPosition = enemy.position;
      const enemyAttackValue = enemy.character.attack;
      const enemyDefence = enemy.character.defence;

      const enemyRadius = new Radius(enemyPosition, enemy.character.type);
      const enemyMove = enemyRadius.move();
      const enemyAttack = enemyRadius.attack();

      let threatened = false;
      for (const player of players) {
        const playerRadius = new Radius(player.position, player.character.type);
        const playerAttackRadius = playerRadius.attack();
        const playerAttack = player.character.attack;

        if (
          playerAttackRadius.includes(enemyPosition) &&
          playerAttack > enemyDefence
        ) {
          threatened = true;
          break;
        }
      }

      if (threatened) {
        let targetPosition = enemyPosition;
        let maxDist = -1;

        for (const pos of enemyMove) {
          const isOccupied = this.positionedCharacters.some((p) => p.position === pos);
          if (isOccupied) continue;

          let minToPlayer = Infinity;
          for (const player of players) {
            const dist =
              Math.abs(Math.floor(pos / 8) - Math.floor(player.position / 8)) +
              Math.abs((pos % 8) - (player.position % 8));
            if (dist < minToPlayer) minToPlayer = dist;
          }

          if (minToPlayer > maxDist) {
            maxDist = minToPlayer;
            targetPosition = pos;
          }
        }

        if (targetPosition !== enemyPosition) {
          enemy.position = targetPosition;
          this.gamePlay.redrawPositions(this.positionedCharacters);
          this.state.currentPlayer = 'player';
          return;
        }
      }

      const targetsInRange = players.filter((p) => enemyAttack.includes(p.position));

      if (targetsInRange.length > 0) {
        let weakest = targetsInRange[0];
        for (const target of targetsInRange) {
          if (target.character.defence < weakest.character.defence) {
            weakest = target;
          }
        }

        const damage = Math.max(
          enemyAttackValue - weakest.character.defence,
          enemyAttackValue * 0.1
        );
        weakest.character.health -= damage;

        await this.gamePlay.showDamage(weakest.position, damage);
        this.gamePlay.redrawPositions(this.positionedCharacters);
        this.state.currentPlayer = 'player';
        return;
      }

      for (const player of players) {
        if (
          enemyAttack.includes(player.position) &&
          enemyAttackValue > player.character.defence
        ) {
          const damage = Math.max(
            enemyAttackValue - player.character.defence,
            enemyAttackValue * 0.1
          );
          player.character.health -= damage;

          await this.gamePlay.showDamage(player.position, damage);
          this.gamePlay.redrawPositions(this.positionedCharacters);
          this.state.currentPlayer = 'player';
          return;
        }
      }

      if (enemyAttackValue > maxAttack) {
        maxAttack = enemyAttackValue;
        attackerEnemy = enemy;
      }
    }

    if (attackerEnemy && targetPlayer) {
      const radius = new Radius(
        attackerEnemy.position,
        attackerEnemy.character.type
      );
      const move = radius.move();

      let targetPosition = attackerEnemy.position;
      let minDist = Infinity;

      for (const pos of move) {
        const isOccupied = this.positionedCharacters.some(
          (p) => p.position === pos
        );
        if (isOccupied) continue;

        const dx =
          Math.floor(pos / 8) - Math.floor(targetPlayer.position / 8);
        const dy = (pos % 8) - (targetPlayer.position % 8);
        const dist = Math.abs(dx) + Math.abs(dy);

        if (dist < minDist) {
          minDist = dist;
          targetPosition = pos;
        }
      }

      if (targetPosition !== attackerEnemy.position) {
        attackerEnemy.position = targetPosition;
        this.gamePlay.redrawPositions(this.positionedCharacters);
      }
    }

    this.state.currentPlayer = 'player';
  }
}
