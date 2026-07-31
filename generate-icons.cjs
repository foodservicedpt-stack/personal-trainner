const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [192, 512];
const outputDir = '/Users/rmora/personal-trainner/public';

function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#0b0f19';
  ctx.fillRect(0, 0, size, size);
  
  // Rounded rect background
  const radius = size * 0.2;
  ctx.beginPath();
  ctx.roundRect(size * 0.1, size * 0.1, size * 0.8, size * 0.8, radius);
  ctx.fillStyle = '#1e293b';
  ctx.fill();
  
  // Dumbbell icon
  ctx.strokeStyle = '#84cc16';
  ctx.lineWidth = size * 0.06;
  ctx.lineCap = 'round';
  
  const cx = size / 2;
  const cy = size / 2;
  const barLength = size * 0.35;
  const weightRadius = size * 0.12;
  
  // Bar
  ctx.beginPath();
  ctx.moveTo(cx - barLength, cy);
  ctx.lineTo(cx + barLength, cy);
  ctx.stroke();
  
  // Left weight
  ctx.beginPath();
  ctx.arc(cx - barLength, cy, weightRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#84cc16';
  ctx.fill();
  
  // Right weight
  ctx.beginPath();
  ctx.arc(cx + barLength, cy, weightRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Center dot
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.025, 0, Math.PI * 2);
  ctx.fillStyle = '#84cc16';
  ctx.fill();
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`${outputDir}/pwa-${size}x${size}.png`, buffer);
  console.log(`Generated pwa-${size}x${size}.png`);
}

sizes.forEach(createIcon);
console.log('Icons generated successfully');
