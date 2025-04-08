const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 600,
  backgroundColor: '#444444',
  parent: 'game-container',
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);
const cols = 3;
const rows = 3;
let matrix = {};
let players = ['o', 'x'];
let placedPieces = [];
let turn = true;
let gameOver = false;

function preload() {
  this.load.image('ObjectX', 'http://127.0.0.1:5500/resources/ObjectX.svg');
  this.load.image('ObjectO', 'http://127.0.0.1:5500/resources/ObjectO.svg');
}

function create() {
  const cellOuterColor = 0x2e2e2e;  // dark outer grid
  const cellInnerColor = 0x444444;  // slightly lighter inner cell
  const strokeColor = 0x666666;

  const cellWidth = this.sys.game.config.width / cols;
  const cellHeight = this.sys.game.config.height / rows;
  const borderWidth = 4;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellWidth + cellWidth / 2;
      const y = row * cellHeight + cellHeight / 2;
      matrix[`${row},${col}`] = null;

      // outer cell background
      this.add.rectangle(x, y, cellWidth, cellHeight, cellInnerColor).setOrigin(0.5);

      // interactive inner cell
      const cell = this.add.rectangle(
        x, y,
        cellWidth - borderWidth * 2,
        cellHeight - borderWidth * 2,
        cellOuterColor
      )
      .setOrigin(0.5)
      .setInteractive()
      .setStrokeStyle(1, strokeColor);

      cell.on('pointerdown', () => {
        console.log(`Clicked cell [${row}, ${col}]`);
        TakeTurn.call(this, x, y, row, col);
      });
    }
  }
}

function TakeTurn(x, y, row, col) {
  if (gameOver) return;

  const key = `${row},${col}`;
  if (matrix[key] != null) {
    return;
  }
  if (turn) {
    matrix[key] = 'x';
    piece = this.add.image(x, y, 'ObjectX').setScale(0.2);
  } else {
    matrix[key] = 'o';
    piece = this.add.image(x, y, 'ObjectO').setScale(0.15);
  }
  
  placedPieces.push(piece);
  turn = !turn;
  Check.call(this);
}

function Check() {
  players.forEach((player) => {
    // vertical
    for (let col = 0; col < cols; col++) {
      let win = true;
      for (let row = 0; row < rows; row++) {
        if (matrix[`${row},${col}`] !== player) {
          win = false;
          break;
        }
      }
      if (win) {
        displayWinner.call(this, `Player ${player} wins!`);
        console.log(player, 'wins!');
        return;
      }
    }

    // horizontal
    for (let row = 0; row < rows; row++) {
      let win = true;
      for (let col = 0; col < cols; col++) {
        if (matrix[`${row},${col}`] !== player) {
          win = false;
          break;
        }
      }
      if (win) {
        displayWinner.call(this, `Player ${player} wins!`);
        console.log(player, 'wins!');
        return;
      }
    }

    // diagonal \
    let win = true;
    for (let i = 0; i < cols; i++) {
      if (matrix[`${i},${i}`] !== player) {
        win = false;
        break;
      }
    }
    if (win) {
      displayWinner.call(this, `Player ${player} wins!`);
      console.log(player, 'wins!');
      return;
    }

    // diagonal /
    win = true;
    for (let i = 0; i < cols; i++) {
      if (matrix[`${i},${cols - 1 - i}`] !== player) {
        win = false;
        break;
      }
    }
    if (win) {
      displayWinner.call(this, `Player "${player}" wins!`);
      console.log(player, 'wins!');
      return;
    }
  });

  let draw = true;
  for (let key in matrix) {
    if (matrix[key] == null) {
      draw = false;
      break;
    }
  }

  if (draw) {
    displayWinner.call(this, `It's a draw!`);
    console.log("It's a draw!");
  }

}

function displayWinner(message){
  let popup_cover = document.getElementById("popup-cover");
  let popup_text = document.getElementById("popup-text");
  gameOver = true;
  popup_cover.style.display = "block";
  popup_text.innerText = message;
}




function update() {
  // no game loop logic needed here
}


function restart() {
  let popup_cover = document.getElementById("popup-cover");
  popup_cover.style.display = "none";

  // Clear matrix state
  for (let key in matrix){
    matrix[key] = null;
  }
  gameOver = false;
  turn = true;

  // Destroy all placed X/O pieces
  placedPieces.forEach(piece => piece.destroy());
  placedPieces = [];
}

