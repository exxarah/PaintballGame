const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

class Circle {
  constructor(x, y, radius, colour, velocity) {
    this.x = x;
    this.y = y;

    this.radius = radius;
    this.colour = colour;
    this.velocity = velocity;

    this.alpha = 1;
  }

  draw(){
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.colour;
    ctx.fill();
    ctx.restore();
  }

  update(){
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

const player = new Circle(canvas.width/2, canvas.height/2, 15, 'white', {x: 0, y: 0});
const projectiles = [];
const particles = [];
const enemies = [];

function spawnEnemies(){
  setInterval(() => {
    const radius = Math.random() * (30 - 10) + 10;

    let x, y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    const colour = `hsl(${Math.random() * 360}, 50%, 50%)`;

    const angle = Math.atan2(player.y - y, player.x - x);
    const speed = Math.random() * (6 - 1) + 1;
    const velocity = {x: Math.cos(angle) * speed, y: Math.sin(angle) * speed};

    enemies.push(new Circle(x, y, radius, colour, velocity))
  }, 1000);
}

let animationID;
function animate() {
  animationID = requestAnimationFrame(animate);

  ctx.fillStyle = 'rgba(85, 85, 85, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();

  particles.forEach((particle, index) => {
    particle.alpha -= 0.01;
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
      particle.draw();
    }
  })

  projectiles.forEach((projectile, index) => {
    projectile.update();
    projectile.draw();

    // Remove if out of bounds
    if (
      projectile.x - projectile.radius < 0 ||
      projectile.x + projectile.radius > canvas.width ||
      projectile.y - projectile.radius < 0 ||
      projectile.y + projectile.radius > canvas.height
    ){
      setTimeout(() => {
        projectiles.splice(index, 1);
      })
    }
  })

  enemies.forEach((enemy, index) => {
    enemy.update();
    enemy.draw();

    // Check Enemy-Player Collision
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationID);
    }

    // Check Enemy-Projectile Collision
    projectiles.forEach((projectile, pIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
      if (dist - enemy.radius - projectile.radius < 1) {
        // Spawn particle effects
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(new Circle(
            projectile.x, projectile.y,
            Math.random() * 3, enemy.colour,
            {x: Math.random() - 0.5, y: Math.random() - 0.5}
          ))
        }

        // Shrink/Destroy Enemy
        if (enemy.radius - 10  > 10){
          gsap.to(enemy, {radius: enemy.radius - 10})
          setTimeout(() => {
            projectiles.splice(pIndex, 1);
          })
        } else {
          // Wait till next frame to not mess with foreach
          setTimeout(() => {
            enemies.splice(index, 1);
            projectiles.splice(pIndex, 1);
          })
        }
      }
    })
  })
}

window.addEventListener('click', (event) => {
  const x = canvas.width/2;
  const y = canvas.height/2;
  const radius = 5;
  const colour = 'white';
  const angle = Math.atan2(event.clientY - canvas.height/2, event.clientX - canvas.width/2);
  const speed = 4;
  const velocity = {x: Math.cos(angle) * speed, y: Math.sin(angle) * speed};

  projectiles.push(new Circle(x, y, radius, colour, velocity))
})

animate();
spawnEnemies();
