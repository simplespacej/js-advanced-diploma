import themes from './themes.js';
import { generateTeam } from './generators.js';
import PositionedCharacter from './PositionedCharacter.js';
import { formatCharacterInfo } from './helpers/formatters.js';
import Bowman from './characters/Bowman.js';
import Swordsman from './characters/Swordsman.js';
import Magician from './characters/Magician.js';
import Vampire from './characters/Vampire.js';
import Undead from './characters/Undead.js';
import Daemon from './characters/Daemon.js';
import GameState from './GameState.js';
import GamePlay from './GamePlay';
import Radius from './Radius.js';
import AiMotions from './aiMotions.js';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.selectedCellIndex = undefined;
    this.blocked = false;
    this.gameOver = false;
    this.state = new GameState();
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi(themes.prairie);
    this.currentTheme = 0;
    this.allThemes = Object.values(themes);

    const playerTypes = [Bowman, Swordsman, Magician];
    const enemyTypes = [Vampire, Undead, Daemon];

    const playerTeam = generateTeam(playerTypes, 3, 3);
    const enemyTeam = generateTeam(enemyTypes, 3, 3);

    const boardSize = 8;

    this.takenPositions = new Set();

    this.getRandomPosition = (columns) => {
      let position;
      do {
        const row = Math.floor(Math.random() * boardSize);
        const col = columns[Math.floor(Math.random() * columns.length)];
        position = row * boardSize + col;
      } while (this.takenPositions.has(position));
      this.takenPositions.add(position);
      return position;
    };

    const positioned = [];

    for (const char of playerTeam) {
      const pos = this.getRandomPosition([0,1]);
      positioned.push(new PositionedCharacter(char, pos));
    }

    for (const char of enemyTeam) {
      const pos = this.getRandomPosition([6, 7]);
      positioned.push(new PositionedCharacter(char, pos));
    }

    this.positionedCharacters = positioned;
    this.gamePlay.redrawPositions(this.positionedCharacters);

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));

    this.gamePlay.addCellClickListener(this.onCellClick.bind(this))

    this.gamePlay.addNewGameListener(() => {
      this.state.maxScore = Math.max(this.state.maxScore, this.state.score);
      this.state.score = 0;
      this.init();
    });
    
    this.gamePlay.addSaveGameListener(() => {
      this.state.positionedCharacters = this.positionedCharacters;
      this.state.currentTheme = this.currentTheme;
      this.stateService.save(this.state);
    });
    
    this.gamePlay.addLoadGameListener(() => {
      try {
        const loaded = this.stateService.load();
        const restored = GameState.from(loaded);
    
        this.state = restored;
        this.positionedCharacters = restored.positionedCharacters;
        this.currentTheme = restored.currentTheme;
    
        const theme = Object.values(themes)[this.currentTheme];
        this.gamePlay.drawUi(theme);
    
        this.gamePlay.redrawPositions(this.positionedCharacters);
      } catch (e) {
        console.error('Ошибка загрузки:', e);
        GamePlay.showError('Не удалось загрузить игру: повреждённые данные');
      }
    });    
        
  }

  async onCellClick(index) {
    if (this.gameOver || this.blocked || this.state.currentPlayer !== 'player') return;

    const players = this.positionedCharacters.filter(p => ['bowman', 'swordsman', 'magician'].includes(p.character.type));

    const selected = this.positionedCharacters.find(p => p.position === this.selectedCellIndex);
    const clicked = this.positionedCharacters.find(p => p.position === index);

    const alivePlayers = this.positionedCharacters.some(p => ['bowman', 'swordsman', 'magician'].includes(p.character.type));

    if (!alivePlayers || this.currentTheme > 3) {
      this.gameOver = true;
      return;
    }
  
    if (selected && !clicked) {
      const radius = new Radius(this.selectedCellIndex, selected.character.type);
      const move = radius.move();
  
      if (move.includes(index)) {
        selected.position = index;
  
        this.gamePlay.deselectCell(this.selectedCellIndex);
        this.selectedCellIndex = undefined;
  
        this.gamePlay.redrawPositions(this.positionedCharacters);

        this.blocked = true;
        this.state.currentPlayer = 'ai';
        const ai = new AiMotions(this.state, this.positionedCharacters, this.gamePlay);
        await ai.strategy();
        this.blocked = false;

        const alive = this.positionedCharacters.filter(p => p.character.health > 0);
        this.positionedCharacters = alive;
        this.gamePlay.redrawPositions(this.positionedCharacters);

        return;
      } else {
        GamePlay.showError('Недопустимое действие');
        return;
      }
    }

    if (clicked) {
      const char = clicked.character;
      const isPlayer = ['bowman', 'swordsman', 'magician'].includes(char.type);
      const isEnemy = ['vampire', 'undead', 'daemon'].includes(clicked.character.type);
  
      if (isPlayer) {
        if (this.selectedCellIndex !== undefined) {
          this.gamePlay.deselectCell(this.selectedCellIndex);
        }
  
        this.selectedCellIndex = index;
        this.gamePlay.selectCell(index);

      } else if (selected && isEnemy) {
          const radius = new Radius(this.selectedCellIndex, selected.character.type);
          const attack = radius.attack();

          if (attack.includes(index)) {
            const damage = Math.max(selected.character.attack - clicked.character.defence, selected.character.attack * 0.1);
            clicked.character.health -= damage;
            
            this.blocked = true;
            await this.gamePlay.showDamage(clicked.position, damage);
            this.gamePlay.redrawPositions(this.positionedCharacters);

            this.state.currentPlayer = 'ai';
            const ai = new AiMotions(this.state, this.positionedCharacters, this.gamePlay);
            await ai.strategy();
            this.blocked = false;

            const alive = this.positionedCharacters.filter(p => p.character.health > 0);
            this.positionedCharacters = alive;
            this.gamePlay.redrawPositions(this.positionedCharacters);

            if (clicked.character.health <= 0) {
              this.state.score += 10;
            }

            const aliveEnemies = this.positionedCharacters.some(p => ['vampire', 'undead', 'daemon'].includes(p.character.type));

            if (!aliveEnemies) {
              for (const player of players) {
                player.attack = Math.max(player.attack, player.attack * (80 + player.health) / 100);
                player.defence = Math.max(player.defence, player.defence * (80 + player.health) / 100);
                player.health = Math.min(player.health + 80, 100);
                player.level += 1;
              }

              for (const player of players) {
                player.position = this.getRandomPosition([0, 1]);
              }
            
              this.currentTheme++;
              const nextTheme = this.allThemes[Math.min(this.currentTheme, this.allThemes.length - 1)];
              this.gamePlay.drawUi(nextTheme);
            
              this.takenPositions = new Set();
            
              for (const char of this.positionedCharacters) {
                this.takenPositions.add(char.position);
              }
              
              this.getRandomPosition = (columns) => {
                const boardSize = 8;
                let position;
                do {
                  const row = Math.floor(Math.random() * boardSize);
                  const col = columns[Math.floor(Math.random() * columns.length)];
                  position = row * boardSize + col;
                } while (this.takenPositions.has(position));
                this.takenPositions.add(position);
                return position;
              };
            
              const enemyTypes = [Vampire, Undead, Daemon];
              const newEnemies = generateTeam(enemyTypes, this.currentTheme + 1, 3);
              for (const enemy of newEnemies) {
                const pos = this.getRandomPosition([6, 7]);
                this.positionedCharacters.push(new PositionedCharacter(enemy, pos));
              }

              this.selectedCellIndex = undefined;
              this.gamePlay.redrawPositions(this.positionedCharacters);
              this.state.score += 100;
            }
          }
      } else {
        GamePlay.showError('Вы не можете выбрать персонажа противника!');
      }
      return;
    }

    GamePlay.showError('В этой клетке нет персонажа!');  
  }
  

  onCellEnter(index) {
    if (this.gameOver || this.blocked) return;
    const positioned = this.positionedCharacters.find(p => p.position === index);
    const selected = this.positionedCharacters.find(p => p.position === this.selectedCellIndex);
  
    if (positioned) {
      const message = formatCharacterInfo(positioned.character);
      this.gamePlay.showCellTooltip(message, index);
    }
  
    if (!selected) return;
  
    const radius = new Radius(this.selectedCellIndex, selected.character.type);
    const move = radius.move();
    const attack = radius.attack();
  
    if (positioned) {
      const char = positioned.character;
      const isPlayer = ['bowman', 'swordsman', 'magician'].includes(char.type);
      const isEnemy = ['vampire', 'undead', 'daemon'].includes(char.type);
  
      if (isPlayer) {
        this.gamePlay.setCursor('pointer');
        return;
      }
  
      if (isEnemy && attack.includes(index)) {
        this.gamePlay.setCursor('crosshair');
        this.gamePlay.selectCell(index, 'red');
        return;
      }
    } else {
      if (move.includes(index)) {
        this.gamePlay.setCursor('pointer');
        this.gamePlay.selectCell(index, 'green');
        return;
      }
    }
    this.gamePlay.setCursor('notallowed');
  }
  

  onCellLeave(index) {
    // TODO: react to mouse leave
    if (this.gameOver || this.blocked) return;
    this.gamePlay.hideCellTooltip(index);

    if (index !== this.selectedCellIndex) {
      this.gamePlay.deselectCell(index);
    }
    
    this.gamePlay.setCursor('auto');    
  }
}
