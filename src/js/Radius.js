export default class Radius {
    constructor (position, character) {
        this.position = position;
        this.character = character;
        this.row = Math.floor(position / 8);
        this.col = position % 8;
        this.movePositions = [];
        this.attackPositions = [];
    }

    move() {
        if (this.character === 'bowman' || this.character === 'vampire') {
            for (let dx = -2; dx <= 2; dx++) {
                for (let dy = -2; dy <=2; dy++) {
                    const moveRow = this.row + dx;
                    const moveCol = this.col + dy;

                    this.isWithinRadius(moveRow, moveCol, this.movePositions);
                }
            }
        } else if (this.character == 'swordsman' || this.character == 'undead') {
            for (let dx = -4; dx <= 4; dx++) {
                for (let dy = -4; dy <=4; dy++) {
                    const moveRow = this.row + dx;
                    const moveCol = this.col + dy;
                    
                    this.isWithinRadius(moveRow, moveCol, this.movePositions);
                }
            }
        } else if (this.character == 'magician' || this.character == 'daemon') {
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <=1; dy++) {
                    const moveRow = this.row + dx;
                    const moveCol = this.col + dy;
                    
                    this.isWithinRadius(moveRow, moveCol, this.movePositions);
                }
            }
        }
        return this.movePositions;
    }

    attack() {
        if (this.character === 'bowman' || this.character === 'vampire') {
            for (let dx = -2; dx <= 2; dx++) {
                for (let dy = -2; dy <=2; dy++) {
                    const attackRow = this.row + dx;
                    const attackCol = this.col + dy;
                    
                    this.isWithinRadius(attackRow, attackCol, this.attackPositions);
                }
            }
        } else if (this.character == 'magician' || this.character == 'daemon') {
            for (let dx = -4; dx <= 4; dx++) {
                for (let dy = -4; dy <=4; dy++) {
                    const attackRow = this.row + dx;
                    const attackCol = this.col + dy;
                    
                    this.isWithinRadius(attackRow, attackCol, this.attackPositions);
                }
            }
        } else if (this.character == 'swordsman' || this.character == 'undead') {
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <=1; dy++) {
                    const attackRow = this.row + dx;
                    const attackCol = this.col + dy;
                    
                    this.isWithinRadius(attackRow, attackCol, this.attackPositions);
                }
            }
        }
        return this.attackPositions;   
    }

    isWithinRadius(row, col, storageArray) {
        if (row >= 0 && row < 8 && col >= 0 && col < 8) {
            const position = row * 8 + col;
            storageArray.push(position);
        }
    }
}
