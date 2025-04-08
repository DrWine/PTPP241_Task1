const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const ObjectX = {
    x: 100,
    y: 100,
    width: 50,
    height: 50,
    draw: function(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
    
        let r = 75;              
    
        let angleRad = 45 * (Math.PI / 180); 
        let x = r * Math.cos(angleRad);
        let y = r * Math.sin(angleRad);
        ctx.beginPath();
        ctx.moveTo(-x, -y);           
        ctx.lineTo(x, y);
        ctx.stroke();
    
        angleRad = -45 * (Math.PI / 180);
        x = r * Math.cos(angleRad);
        y = r * Math.sin(angleRad);
        ctx.beginPath();
        ctx.moveTo(-x, -y);        
        ctx.lineTo(x, y);
        ctx.stroke();
    
        ctx.restore();
    }
    
  };
  
function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ObjectX.draw(ctx);
  }
  
function animate() {
    drawScene();
    requestAnimationFrame(animate);
    }
// animate();
  
    function draw() {
      const canvas = document.getElementById("canvas");
      if (!canvas.getContext) return;

      const ctx = canvas.getContext("2d");
      const cellSize = canvas.width / 3;

      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const x = col * cellSize;
          const y = row * cellSize;
          ctx.strokeRect(x, y, cellSize, cellSize);
        }
      }
    }

    window.addEventListener("load", draw);
    canvas.addEventListener("click", function(event) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      console.log("Click at:", x, y);

      const ctx = canvas.getContext("2d");
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    });