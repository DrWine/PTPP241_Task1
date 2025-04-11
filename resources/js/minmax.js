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

/**
 * Recursive brute-force Minimax algorithm.
 * @param {TreeNode} node - Current game tree node.
 * @param {number} depth - Current depth of recursion.
 * @param {boolean} isMaximizing - True if it's the maximizing player's turn.
 * @param {string} aiPlayer - The AI player's symbol.
 * @returns {number} The calculated minimax score for the node.
 */

function min_max(node, depth, isMaximizing, aiPlayer) {
    if (HasLost(node.matrix, aiPlayer, false) === 1) {
      node.score = 10 - depth;
      return node.score;
    }
    if (HasLost(node.matrix, aiPlayer, true) === 1) {
      node.score = -10 + depth;
      return node.score;
    }
    
    // Check for draw
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
    
    let bestScore = isMaximizing ? -Infinity : Infinity;
    
    for (let key in node.matrix) {
      if (node.matrix[key] != null) continue;
      
      let cloned = cloneMatrix(node.matrix);
      cloned[key] = isMaximizing ? aiPlayer : getOpponent(aiPlayer);
      
      let child = new TreeNode(cloned, 0, node);
      node.addChild(child);
      
      let score = min_max(child, depth + 1, !isMaximizing, aiPlayer);
      
      if (isMaximizing) {
        bestScore = Math.max(bestScore, score);
      } else {
        bestScore = Math.min(bestScore, score);
      }
    }
    
    node.score = bestScore;
    return bestScore;
  }
  
  /**
   * AI helper to choose and execute the best move using the minimax algorithm.
   */
let aiPlayer = 'x';
function aiMove() {
    if (gameOver) return;
    
    let bestScore = -Infinity;
    let bestMoveKey = null;
    
    let root = new TreeNode(cloneMatrix(matrix));
    
    for (let key in matrix) {
      if (matrix[key] !== null) continue;
      
      let cloned = cloneMatrix(matrix);
      cloned[key] = aiPlayer;
      
      let child = new TreeNode(cloned, 0, root);
      root.addChild(child);
      
      let score = min_max(child, 0, false, aiPlayer);
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
      let piece = game.scene.scenes[0].add.image(x, y, 'ObjectX').setScale(0.7);
      placedPieces.push(piece);
      turn = !turn;
      Check.call(game.scene.scenes[0]);
    }
  }


function HasLost(MATRIX, ai, MODE) {
    //MODE 0- HASWON, 1-HASLOST
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