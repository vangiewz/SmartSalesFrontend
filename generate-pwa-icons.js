// Script para generar iconos PWA a partir del logo existente
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [
  { size: 192, name: 'pwa-192x192.png' },
  { size: 512, name: 'pwa-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' }, // iOS
  { size: 32, name: 'favicon-32x32.png' },
  { size: 16, name: 'favicon-16x16.png' }
];

const logoPath = path.join(__dirname, 'public', 'logo.png');
const outputDir = path.join(__dirname, 'public');

async function generateIcons() {
  console.log('🎨 Generando iconos PWA...');
  
  if (!fs.existsSync(logoPath)) {
    console.error('❌ No se encontró el logo en public/logo.png');
    process.exit(1);
  }

  for (const { size, name } of sizes) {
    try {
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(path.join(outputDir, name));
      
      console.log(`✅ Generado: ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Error generando ${name}:`, error.message);
    }
  }
  
  console.log('🎉 ¡Iconos PWA generados exitosamente!');
}

generateIcons();
