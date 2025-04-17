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
const cols = 5;
const rows = 5;
let matrix = {};
let players = ['o', 'x'];
let scores = { 'o': 0, 'x': 0 };
let placedPieces = [];
let turn = true;
let gameOver = false;
const WIN_LEN = 3;

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

  const settingsJSON = getCookie("GameSettings");
  if (!settingsJSON) {
    window.location.assign("http://localhost:5500/menu.html");
    return;
  }

  const settings = JSON.parse(settingsJSON);
  const isVsAI = settings.PlayAgainstPlayerOr === 'off';
  const humanIsX = settings.PlayAsXorO === 'on';
  const humanPlayer = humanIsX ? 'x' : 'o';
  const currentPlayer = turn ? 'x' : 'o';

  // block if not human's turn in vs-AI mode
  if (isVsAI && currentPlayer !== humanPlayer) return;

  // play human move
  matrix[key] = currentPlayer;
  const asset = currentPlayer === 'x' ? 'ObjectX' : 'ObjectO';
  const scale = currentPlayer === 'x' ? 0.7 : 0.5;

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

  // trigger AI move (if enabled and game not finished)
  const nextPlayer = turn ? 'x' : 'o';
  if (isVsAI && !gameOver && nextPlayer !== humanPlayer) {
    aiMove(nextPlayer);
  }
}


function Check() {
  const dirs = [
    [0, 1],   // →
    [1, 0],   // ↓
    [1, 1],   // ↘
    [1, -1]   // ↙
  ];

  for (const player of players) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {

        if (matrix[`${r},${c}`] !== player) continue;     

        for (const [dr, dc] of dirs) {
          const r2 = r + dr * (WIN_LEN - 1);
          const c2 = c + dc * (WIN_LEN - 1);

          if (r2 < 0 || r2 >= rows || c2 < 0 || c2 >= cols) continue;

          let streak = true;
          for (let k = 1; k < WIN_LEN; k++) {
            if (matrix[`${r + dr * k},${c + dc * k}`] !== player) {
              streak = false;
              break;
            }
          }
          if (streak) {
            declareWin.call(this, player);
            return;
          }
        }
      }
    }
  }

  for (const key in matrix) {
    if (matrix[key] == null) return;   
  }
  displayWinner.call(this, "It's a draw!");
  console.log("It's a draw!");
  gameOver = true;
}

function displayWinner(message) {
  let popup_cover = document.getElementById("popup-cover");
  let popup_text = document.getElementById("popup-text");
  gameOver = true;
  popup_cover.style.display = "block";
  popup_text.innerText = message;
}

function declareWin(player) {
  scores[player] += 1;
  displayWinner.call(this, `Player ${player} wins! Score: ${scores[player]}`);
  console.log(player, "wins!", "Score:", scores[player]);
  gameOver = true;
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
