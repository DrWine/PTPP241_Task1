(() => {
  const DIRS = [[0,1],[1,0],[1,1],[1,-1]];
  const opp  = (p) => players.find(q => q !== p);
  const clone = (m) => ({ ...m });

  function has3Win(b,p){
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      if(b[`${r},${c}`]!==p)continue;
      for(const[dr,dc]of DIRS){
        let ok=true;
        for(let k=1;k<WIN_LEN;k++){
          const nr=r+dr*k,nc=c+dc*k;
          if(nr<0||nr>=rows||nc<0||nc>=cols||b[`${nr},${nc}`]!==p){ok=false;break;}
        }
        if(ok)return true;
      }
    }
    return false;
  }

  function findImmediate(b,p){
    for(const k in b){
      if(b[k]!=null)continue;
      const n={...b,[k]:p};
      if(has3Win(n,p))return k;
    }
    return null;
  }

  const MM_DEPTH = 15, MM_NODES = 60000;
  const triples = (()=>{const t=[];
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)
      for(const[dr,dc]of DIRS){
        const r2=r+2*dr,c2=c+2*dc;
        if(r2<0||r2>=rows||c2<0||c2>=cols)continue;
        t.push([[r,c],[r+dr,c+dc],[r2,c2]]);
      }
    return t;
  })();
  const full = (b)=>Object.values(b).every(v=>v!=null);

  function heuristic(b,me){
    const foe=opp(me);let v=0;
    for(const[[r1,c1],[r2,c2],[r3,c3]] of triples){
      const a=b[`${r1},${c1}`],d=b[`${r2},${c2}`],e=b[`${r3},${c3}`];
      const mc=(a===me)+(d===me)+(e===me),fc=(a===foe)+(d===foe)+(e===foe);
      if(mc&&fc)continue;
      if(mc===2)v+=40;
      else if(mc===1)v+=5;
      else if(fc===2)v-=45;
      else if(fc===1)v-=6;
    }
    return v;
  }

  function alphaBeta(b,d,me,maxp,a,beta,nodes){
    if(nodes.c++>=MM_NODES) return 0;
    if(has3Win(b,me))         return  1000-d;
    if(has3Win(b,opp(me)))    return -1000+d;
    if(d>=MM_DEPTH||full(b))  return heuristic(b,me);

    if(maxp){
      let best=-Infinity;
      for(const k in b) if(!b[k]){
        const n=clone(b); n[k]=me;
        best=Math.max(best,alphaBeta(n,d+1,me,false,a,beta,nodes));
        a=Math.max(a,best); if(beta<=a)break;
      }
      return best;
    }else{
      let best=Infinity,o=opp(me);
      for(const k in b) if(!b[k]){
        const n=clone(b); n[k]=o;
        best=Math.min(best,alphaBeta(n,d+1,me,true,a,beta,nodes));
        beta=Math.min(beta,best); if(beta<=a)break;
      }
      return best;
    }
  }

  /* ---------- commit move to live board ---------- */
  function play(key,p){
    if(!key)return;
    const [r,c]=key.split(',').map(Number);
    const w=game.config.width/cols,h=game.config.height/rows;
    const x=c*w+w/2,y=r*h+h/2;
    matrix[key]=p;
    const sprite=p==='x'?'ObjectX':'ObjectO';
    const s=p==='x'?0.7:0.5, sc=game.scene.scenes[0];
    const img=sc.add.image(x,y,sprite).setScale(0);
    placedPieces.push(img);
    sc.tweens.add({targets:img,scaleX:s,scaleY:s,ease:'Back.easeOut',duration:300});
    turn=!turn; Check.call(sc);
  }

  /* ---------- hybrid AI entry ---------- */
  function aiMove(ai='o'){
    if(gameOver) return;

    let key = findImmediate(matrix, ai);            // try to win
    if(!key) key = findImmediate(matrix, opp(ai));  // try to block

    if(!key){                                       // attack with minimax
      let best=null,bestV=-Infinity,nodes={c:0};
      for(const k in matrix) if(!matrix[k]){
        const n=clone(matrix); n[k]=ai;
        const v=alphaBeta(n,1,ai,false,-Infinity,Infinity,nodes);
        if(v>bestV){bestV=v;best=k;}
        if(nodes.c>=MM_NODES) break;
      }
      key = best ?? Object.keys(matrix).find(k=>matrix[k]==null);
    }

    play(key,ai);
  }

  window.aiMove = aiMove;
})();
