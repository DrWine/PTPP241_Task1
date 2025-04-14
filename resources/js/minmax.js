// Tree node for the minimax tree
class TreeNode {
  constructor(matrix, points = 0, parent = null) {
    this.matrix = matrix; // Game board state
    this.points = points;
    this.parent = parent;
    this.children = [];
    this.score = null;
  }

  addChild(childNode) {
    this.children.push(childNode);
  }

  isLeaf() {
    return this.children.length === 0;
  }
}

function cloneMatrix(matrix) {
  return { ...matrix };
}

function getOpponent(player) {
  return players.find(p => p !== player);
}

function evaluateBoard(matrix, aiPlayer) {
let score = 0;
const winningLines = [];

// Add rows
for (let i = 0; i < rows; i++) {
  let line = [];
  for (let j = 0; j < cols; j++) {
    line.push(`${i},${j}`);
  }
  winningLines.push(line);
}

// Add columns
for (let j = 0; j < cols; j++) {
  let line = [];
  for (let i = 0; i < rows; i++) {
    line.push(`${i},${j}`);
  }
  winningLines.push(line);
}

// Add diagonals
let diag1 = [], diag2 = [];
for (let i = 0; i < rows; i++) {
  diag1.push(`${i},${i}`);
  diag2.push(`${i},${cols - 1 - i}`);
}
winningLines.push(diag1, diag2);

for (let line of winningLines) {
  let aiCount = 0;
  let opponentCount = 0;
  for (let key of line) {
    if (matrix[key] === aiPlayer) aiCount++;
    else if (matrix[key] !== null) opponentCount++;
  }
  if (aiCount > 0 && opponentCount === 0) {
    score += aiCount;
  }
  else if (opponentCount > 0 && aiCount === 0) {
    score -= opponentCount;
  }
}

return score;
}

function min_max(node, depth, isMaximizing, aiPlayer, maxDepth) {
  if (HasLost(node.matrix, aiPlayer, false) === 1) {
    node.score = 10 - depth;
    return node.score;
  }
  if (HasLost(node.matrix, aiPlayer, true) === 1) {
    node.score = -10 + depth;
    return node.score;
  }
  
  let emptyFound = false;
  for (let key in node.matrix) {
    if (node.matrix[key] == null) {
      emptyFound = true;
      break;
    }
  }
  if (!emptyFound) {
    node.score = 0;
    return 0;
  }

  if (depth === maxDepth) {
    const heuristicScore = evaluateBoard(node.matrix, aiPlayer);
    node.score = heuristicScore;
    return heuristicScore;
  }
  
  let bestScore = isMaximizing ? -Infinity : Infinity;
  
  for (let key in node.matrix) {
    if (node.matrix[key] != null) continue;
    
    let cloned = cloneMatrix(node.matrix);
    cloned[key] = isMaximizing ? aiPlayer : getOpponent(aiPlayer);
    
    let child = new TreeNode(cloned, 0, node);
    node.addChild(child);
    
    let score = min_max(child, depth + 1, !isMaximizing, aiPlayer, maxDepth);
    
    if (isMaximizing) {
      bestScore = Math.max(bestScore, score);
    } else {
      bestScore = Math.min(bestScore, score);
    }
  }
  
  node.score = bestScore;
  return bestScore;
}

function aiMove(aiPlayer = 'x') {
  if (gameOver) return;
  
  let bestScore = -Infinity;
  let bestMoveKey = null;
  
  const maxDepth = 4;
  
  let root = new TreeNode(cloneMatrix(matrix));
  
  for (let key in matrix) {
    if (matrix[key] !== null) continue;
    
    let cloned = cloneMatrix(matrix);
    cloned[key] = aiPlayer;
    
    let child = new TreeNode(cloned, 0, root);
    root.addChild(child);
    
    // Use the maxDepth parameter in the minimax function
    let score = min_max(child, 0, false, aiPlayer, maxDepth);
    if (score > bestScore) {
      bestScore = score;
      bestMoveKey = key;
    }
  }
  
  if (bestMoveKey != null) {
    let [row, col] = bestMoveKey.split(',').map(Number);
    const cellWidth = game.config.width / cols;
    const cellHeight = game.config.height / rows;
    const x = col * cellWidth + cellWidth / 2;
    const y = row * cellHeight + cellHeight / 2;
    
    matrix[bestMoveKey] = aiPlayer;
    // Choose asset conditionally based on aiPlayer
    let asset = aiPlayer === 'x' ? 'ObjectX' : 'ObjectO';
    let piece = game.scene.scenes[0].add.image(x, y, asset).setScale(aiPlayer === 'x' ? 0.7 : 0.5);
    placedPieces.push(piece);
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

  // Still in play
  return 0;
}
