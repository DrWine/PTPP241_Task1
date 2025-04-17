const MAX_DEPTH  = 7;                   
const MAX_NODES  = 50_000;                
const DIRS       = [[0,1],[1,0],[1,1],[1,-1]]; // → ↓ ↘ ↙

const cloneMatrix = (m) => ({ ...m });
const getOpponent = (p) => players.find(q => q !== p);

function hasConsecutiveWin(board, player) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[`${r},${c}`] !== player) continue;
      for (const [dr, dc] of DIRS) {
        const r2 = r + dr * (WIN_LEN - 1);
        const c2 = c + dc * (WIN_LEN - 1);
        if (r2 < 0 || r2 >= rows || c2 < 0 || c2 >= cols) continue;
        let ok = true;
        for (let k = 1; k < WIN_LEN; k++) {
          if (board[`${r + dr*k},${c + dc*k}`] !== player) { ok = false; break; }
        }
        if (ok) return true;
      }
    }
  }
  return false;
}

const isBoardFull = (board) => Object.values(board).every(v => v != null);

function evaluate(board, ai, depth) {
  if (hasConsecutiveWin(board, ai))               return  10 - depth;
  if (hasConsecutiveWin(board, getOpponent(ai)))  return -10 + depth;
  return 0;                                       
}

function alphaBeta(board, depth, maximizing, ai, alpha, beta, budget) {
  if (budget.used++ >= MAX_NODES) return 0;            
  if (depth >= MAX_DEPTH || isBoardFull(board)) {
    return evaluate(board, ai, depth);
  }

  if (maximizing) {
    let best = -Infinity;
    for (const k in board) {
      if (board[k] !== null) continue;
      const next = cloneMatrix(board); next[k] = ai;
      best  = Math.max(best,
               alphaBeta(next, depth+1, false, ai, alpha, beta, budget));
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;                            
    }
    return best;
  } else {
    let best =  Infinity;
    const opp = getOpponent(ai);
    for (const k in board) {
      if (board[k] !== null) continue;
      const next = cloneMatrix(board); next[k] = opp;
      best  = Math.min(best,
               alphaBeta(next, depth+1, true, ai, alpha, beta, budget));
      beta  = Math.min(beta, best);
      if (beta <= alpha) break;                        
    }
    return best;
  }
}

function aiMove(aiPlayer = 'o') {
  if (gameOver) return;

  let bestKey = null;
  let bestVal = -Infinity;
  const budget = { used: 0 };                   

  for (const k in matrix) {
    if (matrix[k] !== null) continue;
    const next = cloneMatrix(matrix); next[k] = aiPlayer;
    const val  = alphaBeta(next, 1, false, aiPlayer, -Infinity, Infinity, budget);
    if (val > bestVal) { bestVal = val; bestKey = k; }
    if (budget.used >= MAX_NODES) break;         
  }

  if (bestKey == null) {
    bestKey = Object.keys(matrix).find(k => matrix[k] == null);
    if (!bestKey) return;                     
  }

  const [r,c] = bestKey.split(',').map(Number);
  const cellW = game.config.width  / cols;
  const cellH = game.config.height / rows;
  const x     = c * cellW + cellW / 2;
  const y     = r * cellH + cellH / 2;

  matrix[bestKey] = aiPlayer;

  const sprite   = aiPlayer === 'x' ? 'ObjectX' : 'ObjectO';
  const endScale = aiPlayer === 'x' ? 0.7 : 0.5;
  const scene    = game.scene.scenes[0];

  const img = scene.add.image(x, y, sprite).setScale(0);
  placedPieces.push(img);

  scene.tweens.add({
    targets: img, scaleX: endScale, scaleY: endScale,
    ease: 'Back.easeOut', duration: 300
  });

  turn = !turn;
  Check.call(scene);
}
