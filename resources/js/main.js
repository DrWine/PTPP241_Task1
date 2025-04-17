const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 600,
  backgroundColor: '#0f1425',
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
let scores = { 'o': 0, 'x': 0 };
let placedPieces = [];
let turn = true;
let gameOver = false;

function preload() {
  this.load.image('ObjectX', 'http://127.0.0.1:5500/resources/images/ObjectX.svg');
  this.load.image('ObjectO', 'http://127.0.0.1:5500/resources/images/ObjectO.svg');
}

function create() {
  const cellOuterColor = 0x0f1425;
  const cellInnerColor = 0x0066a7;  
  const strokeColor = 0x0066a7;

  const cellWidth = this.sys.game.config.width / cols;
  const cellHeight = this.sys.game.config.height / rows;

  this.textures.get('ObjectX').setFilter(Phaser.Textures.FilterMode.LINEAR);
  this.textures.get('ObjectO').setFilter(Phaser.Textures.FilterMode.LINEAR);

  const graphics = this.add.graphics();

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellWidth;
      const y = row * cellHeight;
      matrix[`${row},${col}`] = null;

      graphics.fillStyle(cellInnerColor, 1);
      graphics.fillRect(x, y, cellWidth, cellHeight);

      let cellRect = this.add.rectangle(
        x + cellWidth / 2,
        y + cellHeight / 2,
        cellWidth - 8, // Border spacing that mimics a border.
        cellHeight - 8,
        cellOuterColor
      ).setInteractive();

      cellRect.on('pointerdown', () => {
        console.log(`Clicked cell [${row}, ${col}]`);
        TakeTurn.call(this, x + cellWidth / 2, y + cellHeight / 2, row, col);
      });
    }
  }
  const canvas = this.sys.game.canvas;
  canvas.style.opacity = 1;
}

function TakeTurn(x, y, row, col) {
  if (gameOver) return;

  const key = `${row},${col}`;
  if (matrix[key] !== null) return;

  const gameSettingsJSON = getCookie("GameSettings");
  if (!gameSettingsJSON) {
    window.location.assign("http://localhost:5500/menu.html");
    return;
  }
  const gameSettings = JSON.parse(gameSettingsJSON);
  console.log("GameSettings:", gameSettings);

  const currentPlayer = turn ? 'x' : 'o';
  const humanPlayer = (gameSettings.PlayAsXorO === 'on') ? 'x' : 'o';

  if (gameSettings.PlayAgainstPlayerOr === 'off' && currentPlayer !== humanPlayer) {
    aiMove(currentPlayer);
    return;
  }

  matrix[key] = currentPlayer;
  const asset = (currentPlayer === 'x') ? 'ObjectX' : 'ObjectO';
  const scale = (currentPlayer === 'x') ? 0.7 : 0.5;
  
  const piece = this.add.image(x, y, asset).setScale(0);
  placedPieces.push(piece);
  
  this.tweens.add({
    targets: piece,
    scaleX: scale,
    scaleY: scale,
    ease: 'Back.easeOut', 
    duration: 300,      
  });
  
  turn = !turn;
  Check.call(this);

  if (gameSettings.PlayAgainstPlayerOr === 'off' && !gameOver) {
    const newCurrentPlayer = turn ? 'x' : 'o';
    if (newCurrentPlayer !== humanPlayer) {
      aiMove(newCurrentPlayer);
    }
  }
}

function Check() {
  for (let player of players) {
    // Vertical win check.
    for (let col = 0; col < cols; col++) {
      let win = true;
      for (let row = 0; row < rows; row++) {
        if (matrix[`${row},${col}`] !== player) {
          win = false;
          break;
        }
      }
      if (win) {
        // Update score for the winning player.
        scores[player]++;
        displayWinner.call(this, `Player ${player} wins! Score: ${scores[player]}`);
        console.log(player, 'wins!', 'Score:', scores[player]);
        gameOver = true;
        return;
      }
    }
    // Horizontal win check.
    for (let row = 0; row < rows; row++) {
      let win = true;
      for (let col = 0; col < cols; col++) {
        if (matrix[`${row},${col}`] !== player) {
          win = false;
          break;
        }
      }
      if (win) {
        scores[player]++;
        displayWinner.call(this, `Player ${player} wins! Score: ${scores[player]}`);
        console.log(player, 'wins!', 'Score:', scores[player]);
        gameOver = true;
        return;
      }
    }

    // Diagonal "\" win check.
    let win = true;
    const diagLength = Math.min(rows, cols);
    for (let i = 0; i < diagLength; i++) {
      if (matrix[`${i},${i}`] !== player) {
        win = false;
        break;
      }
    }
    if (win) {
      scores[player]++;
      displayWinner.call(this, `Player ${player} wins! Score: ${scores[player]}`);
      console.log(player, 'wins!', 'Score:', scores[player]);
      gameOver = true;
      return;
    }

    // Diagonal "/" win check.
    win = true;
    for (let i = 0; i < diagLength; i++) {
      if (matrix[`${i},${cols - 1 - i}`] !== player) {
        win = false;
        break;
      }
    }
    if (win) {
      scores[player]++;
      displayWinner.call(this, `Player ${player} wins! Score: ${scores[player]}`);
      console.log(player, 'wins!', 'Score:', scores[player]);
      gameOver = true;
      return;
    }
  }

  // Check for draw.
  let draw = true;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (matrix[`${row},${col}`] == null) {
        draw = false;
        break;
      }
    }
    if (!draw) break;
  }

  if (draw) {
    displayWinner.call(this, `It's a draw!`);
    console.log("It's a draw!");
    gameOver = true;
  }
}

function displayWinner(message) {
  let popup_cover = document.getElementById("popup-cover");
  let popup_text = document.getElementById("popup-text");
  gameOver = true;
  popup_cover.style.display = "block";
  popup_text.innerText = message;
}

function update() {
  const scoreX = document.getElementById("score-x");
  const scoreO = document.getElementById("score-o");
  scoreX.innerText = `${scores['x']}`;
  scoreO.innerText = `${scores['o']}`;
}

function restart() {
  let popup_cover = document.getElementById("popup-cover");
  popup_cover.style.display = "none";

  for (let key in matrix) {
    matrix[key] = null;
  }
  gameOver = false;
  turn = true;

  // Destroy all placed X/O pieces
  placedPieces.forEach(piece => piece.destroy());
  placedPieces = [];
}
