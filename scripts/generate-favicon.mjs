import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// Clean, minimal favicon - white paper plane on purple
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="108" fill="url(#bg)"/>
  <!-- Paper plane / send icon -->
  <path d="M112 256 L400 112 L256 400 L224 288 L112 256 Z" fill="white"/>
  <path d="M224 288 L400 112" stroke="rgba(139,92,246,0.3)" stroke-width="16" stroke-linecap="round"/>
</svg>`;

async function generateFavicons() {
  console.log('Generating favicons...');

  // Create base buffer from SVG
  const svgBuffer = Buffer.from(faviconSvg);

  // Generate different sizes
  const sizes = [16, 32, 48, 64, 128, 180, 192, 512];

  for (const size of sizes) {
    const outputPath = join(publicDir, `favicon-${size}x${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Created: favicon-${size}x${size}.png`);
  }

  // Create standard favicon.ico (32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(join(publicDir, 'favicon.png'));
  console.log('Created: favicon.png');

  // Create apple-touch-icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(join(publicDir, 'apple-touch-icon.png'));
  console.log('Created: apple-touch-icon.png');

  // Create android icons
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(join(publicDir, 'android-chrome-192x192.png'));
  console.log('Created: android-chrome-192x192.png');

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(join(publicDir, 'android-chrome-512x512.png'));
  console.log('Created: android-chrome-512x512.png');

  // Create web manifest
  const manifest = {
    name: 'VIP eSim',
    short_name: 'VIP eSim',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
    theme_color: '#6366f1',
    background_color: '#ffffff',
    display: 'standalone'
  };

  writeFileSync(
    join(publicDir, 'site.webmanifest'),
    JSON.stringify(manifest, null, 2)
  );
  console.log('Created: site.webmanifest');

  console.log('\nAll favicons generated successfully!');
}

generateFavicons().catch(console.error);
