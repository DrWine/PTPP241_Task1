function cloneMatrix(matrix) {
  return { ...matrix };
}

function getOpponent(player) {
  return players.find(p => p !== player);
}

function checkWin(matrix, player) {
  for (let row = 0; row < rows; row++) {
    let win = true;
    for (let col = 0; col < cols; col++) {
      if (matrix[`${row},${col}`] !== player) { win = false; break; }
    }
    if (win) return true;
  }
  for (let col = 0; col < cols; col++) {
    let win = true;
    for (let row = 0; row < rows; row++) {
      if (matrix[`${row},${col}`] !== player) { win = false; break; }
    }
    if (win) return true;
  }
  let win = true;
  for (let i = 0; i < rows; i++) {
    if (matrix[`${i},${i}`] !== player) { win = false; break; }
  }
  if (win) return true;
  win = true;
  for (let i = 0; i < rows; i++) {
    if (matrix[`${i},${cols - 1 - i}`] !== player) { win = false; break; }
  }
  return win;
}

function terminalScore(matrix, aiPlayer, depth) {
  if (checkWin(matrix, aiPlayer)) return 10 - depth;
  if (checkWin(matrix, getOpponent(aiPlayer))) return -10 + depth;
  for (let key in matrix) {
    if (matrix[key] === null) return null;
  }
  return 0;
}

function alphaBeta(matrix, depth, isMaximizing, aiPlayer, alpha, beta) {
  let score = terminalScore(matrix, aiPlayer, depth);
  if (score !== null) return score;
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let key in matrix) {
      if (matrix[key] !== null) continue;
      let newMatrix = cloneMatrix(matrix);
      newMatrix[key] = aiPlayer;
      let evalScore = alphaBeta(newMatrix, depth + 1, false, aiPlayer, alpha, beta);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let key in matrix) {
      if (matrix[key] !== null) continue;
      let newMatrix = cloneMatrix(matrix);
      newMatrix[key] = getOpponent(aiPlayer);
      let evalScore = alphaBeta(newMatrix, depth + 1, true, aiPlayer, alpha, beta);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function aiMove(aiPlayer = 'o') {
  if (gameOver) return;
  let bestScore = -Infinity;
  let bestMoveKey = null;
  for (let key in matrix) {
    if (matrix[key] !== null) continue;
    let newMatrix = cloneMatrix(matrix);
    newMatrix[key] = aiPlayer;
    let score = alphaBeta(newMatrix, 0, false, aiPlayer, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      bestMoveKey = key;
    }
  }
  if (bestMoveKey !== null) {
    let [row, col] = bestMoveKey.split(',').map(Number);
    const cellWidth = game.config.width / cols;
    const cellHeight = game.config.height / rows;
    const x = col * cellWidth + cellWidth / 2;
    const y = row * cellHeight + cellHeight / 2;
    matrix[bestMoveKey] = aiPlayer;
    let asset = aiPlayer === 'x' ? 'ObjectX' : 'ObjectO';
    let finalScale = aiPlayer === 'x' ? 0.7 : 0.5;
    let piece = game.scene.scenes[0].add.image(x, y, asset).setScale(0);
    placedPieces.push(piece);
    game.scene.scenes[0].tweens.add({
      targets: piece,
      scaleX: finalScale,
      scaleY: finalScale,
      ease: 'Back.easeOut',
      duration: 300,
    });
    turn = !turn;
    Check.call(game.scene.scenes[0]);
  }
}


function HasLost(MATRIX, ai, MODE) {
  // MODE 0- HASWON, 1-HASLOST
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    if (player === ai && MODE === true) continue; 

    // Check columns
    for (let col = 0; col < cols; col++) {
      let win = true;
      for (let row = 0; row < rows; row++) {
        if (MATRIX[`${row},${col}`] !== player) {
          win = false;
          break;
        }
      }
      if (win) return 1; // AI lost
    }

    // Check rows
    for (let row = 0; row < rows; row++) {
      let win = true;
      for (let col = 0; col < cols; col++) {
        if (MATRIX[`${row},${col}`] !== player) {
          win = false;
          break;
        }
      }
      if (win) return 1; // AI lost
    }

    // Diagonal "\"
    let win = true;
    for (let i = 0; i < rows; i++) {
      if (MATRIX[`${i},${i}`] !== player) {
        win = false;
        break;
      }
    }
    if (win) return 1; // AI lost

    // Diagonal "/"
    win = true;
    for (let i = 0; i < rows; i++) {
      if (MATRIX[`${i},${cols - 1 - i}`] !== player) {
        win = false;
        break;
      }
    }
    if (win) return 1; // AI lost
  }

  // Check for draw
  let draw = true;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (MATRIX[`${row},${col}`] == null) {
        draw = false;
        break;
      }
    }
    if (!draw) break;
  }

  if (draw) return 3;

  return 0;
}
 