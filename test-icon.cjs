const fs = require('fs');
const { createCanvas } = require('canvas');

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#000000');
  gradient.addColorStop(1, '#1d1d1f');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Chip Border
  ctx.strokeStyle = '#0071e3';
  ctx.lineWidth = size * 0.05;
  ctx.strokeRect(size * 0.2, size * 0.2, size * 0.6, size * 0.6);

  // Inner details
  ctx.fillStyle = '#f5f5f7';
  ctx.fillRect(size * 0.4, size * 0.4, size * 0.2, size * 0.2);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`./public/icons/icon-${size}.png`, buffer);
  
  if (size === 512) {
    fs.writeFileSync(`./public/icons/icon-maskable-${size}.png`, buffer);
  }
}

generateIcon(192);
generateIcon(512);
