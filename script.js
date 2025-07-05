const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let w = window.innerWidth;
let h = window.innerHeight;
canvas.width = w;
canvas.height = h;

const introText = document.getElementById("introText");
const heartbeatSound = document.getElementById("heartbeatSound");

// Heart points
let heartPoints = [];
for (let t = 0; t < Math.PI * 2; t += 0.05) {
  let x = 16 * Math.pow(Math.sin(t), 3);
  let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  heartPoints.push({ x: x, y: -y });
}

// Particle trail
let particles = [];

function animate(time = 0) {
  ctx.clearRect(0, 0, w, h);

  let scale = Math.min(w, h) / 40;
  let centerX = w / 2;
  let centerY = h / 2;

  let beat = 1 + Math.sin(time / 300) * 0.1;
  let beatIntensity = Math.sin(time / 300);

  // Control text opacity synced with beat
  let opacity = (beatIntensity + 1) / 2; // normalize from [-1, 1] to [0, 1]
  introText.style.opacity = opacity;

  // Play sound when peak
  if (beatIntensity > 0.95 && !heartbeatSound.playing) {
    heartbeatSound.currentTime = 0;
    heartbeatSound.play();
    heartbeatSound.playing = true;
  } else if (beatIntensity < 0.5) {
    heartbeatSound.playing = false;
  }

  // Draw heart layers
  drawHeartLayer(heartPoints, centerX, centerY, scale * beat, "rgba(255,0,0,0.8)", 3, 20);
  drawHeartLayer(heartPoints, centerX, centerY, scale * beat * 1.1, "rgba(255,0,0,0.4)", 2, 30);
  drawHeartLayer(heartPoints, centerX, centerY, scale * beat * 1.2, "rgba(255,0,0,0.2)", 1, 40);

  // Emit particles
  for (let i = 0; i < heartPoints.length; i += 10) {
    let x = centerX + heartPoints[i].x * scale * beat;
    let y = centerY + heartPoints[i].y * scale * beat;
    particles.push({
      x: x,
      y: y,
      alpha: 1,
      size: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
    });
  }

  // Update and draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.02;
    if (p.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 0, 0, ${p.alpha})`;
    ctx.fill();
  }

  requestAnimationFrame(animate);
}

function drawHeartLayer(points, cx, cy, scale, strokeStyle, lineWidth, shadowBlur) {
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    let x = cx + points[i].x * scale;
    let y = cy + points[i].y * scale;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.shadowBlur = shadowBlur;
  ctx.shadowColor = "red";
  ctx.stroke();

  // Dots
  for (let i = 0; i < points.length; i++) {
    let x = cx + points[i].x * scale;
    let y = cy + points[i].y * scale;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = strokeStyle;
    ctx.fill();
  }
}

animate();

window.addEventListener("resize", () => {
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;
});
