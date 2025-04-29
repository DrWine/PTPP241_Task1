
   const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 600,
    backgroundColor: '#0f1425',
    parent: 'game-container',
    scene: { preload, create, update }
  };
  
  const game   = new Phaser.Game(config);
  let cols   = 3;
  let rows   = 3;
  let WIN_LEN = 3;
  
  let matrix        = {};
  let players       = ['x', 'o'];          
  let scores        = { x: 0, o: 0 };
  let placedPieces  = [];
  let turn          = true;                // true = X to move
  let gameOver      = false;
  
  function preload() {
    this.load.image('ObjectX', 'http://127.0.0.1:5500/resources/images/ObjectX.svg');
    this.load.image('ObjectO', 'http://127.0.0.1:5500/resources/images/ObjectO.svg');
  }
  
  function create() {
    const sJSON = getCookie('GameSettings');
    if (!sJSON) { window.location.assign('http://localhost:5500/menu.html'); return; }
  
    const s        = JSON.parse(sJSON);
    const b3x3     = s.BoardSize3x3or5x5 === 'off';
    if (b3x3){
      cols = 5; rows = 5; WIN_LEN = 4;
    }
    

    const cellW = this.sys.game.config.width  / cols;
    const cellH = this.sys.game.config.height / rows;
    const outer = 0x0f1425;
    const inner = 0x0066a7;
  
    const g = this.add.graphics();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cellW;
        const y = r * cellH;
        matrix[`${r},${c}`] = null;
  
        g.fillStyle(inner, 1).fillRect(x, y, cellW, cellH);
  
        const rect = this.add.rectangle(
          x + cellW/2, y + cellH/2, cellW - 8, cellH - 8, outer
        ).setInteractive();
  
        rect.on('pointerdown', () =>
          TakeTurn.call(this, x + cellW/2, y + cellH/2, r, c));
      }
    }
  
    maybeStartAI.call(this);
  }
  
  function maybeStartAI() {
    const sJSON = getCookie('GameSettings');
    if (!sJSON) return;
    const s        = JSON.parse(sJSON);
    const vsAI     = s.PlayAgainstPlayerOr === 'off';
    const humanIsX = s.PlayAsXorO === 'on';
  
    if (vsAI && !humanIsX && turn && !gameOver) {
      aiMove('x');
    }
  }
  
  function TakeTurn(x, y, row, col) {
    if (gameOver) return;
  
    const key = `${row},${col}`;
    if (matrix[key] !== null) return;
  
    const sJSON = getCookie('GameSettings');
    if (!sJSON) { window.location.assign('http://localhost:5500/menu.html'); return; }
  
    const s        = JSON.parse(sJSON);
    const vsAI     = s.PlayAgainstPlayerOr === 'off';
    const humanIsX = s.PlayAsXorO === 'on';
    const human    = humanIsX ? 'x' : 'o';
    const player   = turn ? 'x' : 'o';
  
    /* If user clicks during the robot’s turn, just ignore the click. */
    if (vsAI && player !== human) return;
  
    matrix[key] = player;
    const sprite = player === 'x' ? 'ObjectX' : 'ObjectO';
    const scale  = player === 'x' ? 0.7 : 0.5;
  
    const img = this.add.image(x, y, sprite).setScale(0);
    placedPieces.push(img);
    this.tweens.add({ targets: img, scaleX: scale, scaleY: scale,
                      ease: 'Back.easeOut', duration: 300 });
  
    turn = !turn;
    Check.call(this);
  
    const next = turn ? 'x' : 'o';
    if (vsAI && !gameOver && next !== human) aiMove(next);
  }
  
  function Check() {
    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    for (const p of players)
      for (let r=0;r<rows;r++)
        for (let c=0;c<cols;c++) {
          if (matrix[`${r},${c}`] !== p) continue;
          for (const [dr,dc] of dirs) {
            const r2 = r + dr*(WIN_LEN-1);
            const c2 = c + dc*(WIN_LEN-1);
            if (r2<0||r2>=rows||c2<0||c2>=cols) continue;
            let ok = true;
            for (let k=1;k<WIN_LEN;k++)
              if (matrix[`${r+dr*k},${c+dc*k}`]!==p){ok=false;break;}
            if (ok){declareWin.call(this,p);return;}
          }
        }
  
    if (Object.values(matrix).every(v=>v!=null)) {
      displayWinner.call(this,"It's a draw!");
      console.log("It's a draw!"); gameOver=true;
    }
  }
  
  function displayWinner(msg){
    const cover = document.getElementById('popup-cover');
    const text  = document.getElementById('popup-text');
    cover.style.display='block'; text.innerText=msg; gameOver=true;
  }
  function declareWin(p){
    scores[p]++; displayWinner.call(this,`Player ${p} wins! Score: ${scores[p]}`);
    console.log(p,'wins!',scores[p]); gameOver=true;
  }
  function update(){
    document.getElementById('score-x').innerText = scores.x;
    document.getElementById('score-o').innerText = scores.o;
  }
  
  function restart(){
    document.getElementById('popup-cover').style.display='none';
    for(const k in matrix) matrix[k]=null;
    placedPieces.forEach(p=>p.destroy()); placedPieces.length=0;
    turn=true; gameOver=false;
    maybeStartAI.call(game.scene.scenes[0]);
  }

  