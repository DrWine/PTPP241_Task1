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
  