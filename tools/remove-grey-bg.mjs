/**
 * Remove grey backgrounds from AI-generated sprite sheets.
 * Converts near-neutral grey pixels to transparent RGBA.
 *
 * Detection: a pixel is "background grey" if:
 * - R, G, B channels are all within 15 of each other (low saturation)
 * - Average brightness is between 90 and 175
 *
 * Edge feathering: pixels near the grey/art boundary get partial
 * alpha for cleaner edges.
 *
 * Usage: node tools/remove-grey-bg.mjs
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const SPRITESHEETS = [
  'public/assets/images/yujigo/yujigosprites.png',
  'public/assets/images/yujigo/kirumisprites.png',
  'public/assets/images/yujigo/npcsprites.png',
];

// Grey detection thresholds
const MAX_CHANNEL_DIFF = 15;
const MIN_BRIGHTNESS = 90;
const MAX_BRIGHTNESS = 175;

async function removeGreyBackground(filePath) {
  const absPath = path.resolve(root, filePath);
  console.log(`Processing ${filePath}`);

  const { data, info } = await sharp(absPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  console.log(`  Size: ${width}x${height}, channels: ${channels}`);

  // First pass: mark grey pixels
  const isGrey = new Uint8Array(width * height);
  let greyCount = 0;

  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
    const avg = (r + g + b) / 3;
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));

    if (maxDiff < MAX_CHANNEL_DIFF && avg > MIN_BRIGHTNESS && avg < MAX_BRIGHTNESS) {
      isGrey[i] = 1;
      greyCount++;
    }
  }

  console.log(`  Grey pixels detected: ${greyCount}/${width * height} (${(greyCount / (width * height) * 100).toFixed(1)}%)`);

  // Second pass: set alpha
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const idx = i * 4;

      if (isGrey[i]) {
        let nearArt = false;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              if (!isGrey[ny * width + nx]) {
                nearArt = true;
              }
            }
          }
        }

        if (nearArt) {
          data[idx + 3] = 40; // Edge pixel: partial transparency
        } else {
          data[idx + 3] = 0;  // Interior grey: fully transparent
        }
      }
    }
  }

  await sharp(data, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(absPath);

  console.log(`  Saved with transparency!`);
}

async function main() {
  for (const sheet of SPRITESHEETS) {
    await removeGreyBackground(sheet);
  }
  console.log('\n! All sprite sheets now have transparent backgrounds.');
}

main().catch(console.error);
