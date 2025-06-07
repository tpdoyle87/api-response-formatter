import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const sizes = [16, 32, 48, 128];

// Ensure directories exist
const iconDir = path.join(process.cwd(), 'dist', 'icons');
fs.mkdirSync(iconDir, { recursive: true });

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#007bff';
  ctx.fillRect(0, 0, size, size);
  
  // Draw curly braces
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.5}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('{ }', size / 2, size / 2);
  
  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  const filePath = path.join(iconDir, `icon-${size}.png`);
  fs.writeFileSync(filePath, buffer);
  console.log(`✅ Created ${filePath}`);
});

console.log('🎨 All icons generated successfully!');