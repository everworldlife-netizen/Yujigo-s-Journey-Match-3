/**
 * slice-sprites.mjs
 * Utility to slice sprite sheets into individual frames
 * Usage: node slice-sprites.mjs <input-spritesheet> <cols> <rows> <output-dir>
 */

import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { join, basename, extname } from 'path';

const [,, input, cols, rows, outputDir = './sprites'] = process.argv;

if (!input || !cols || !rows) {
  console.error('Usage: node slice-sprites.mjs <input> <cols> <rows> [output-dir]');
  process.exit(1);
}

const numCols = parseInt(cols, 10);
const numRows = parseInt(rows, 10);

if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

const name = basename(input, extname(input));

async function sliceSheet() {
  const image = sharp(input);
  const metadata = await image.metadata();
  const frameW = Math.floor(metadata.width / numCols);
  const frameH = Math.floor(metadata.height / numRows);

  console.log(`Sprite sheet: ${metadata.width}x${metadata.height}`);
  console.log(`Frame size: ${frameW}x${frameH}`);
  console.log(`Grid: ${numCols}x${numRows} = ${numCols * numRows} frames`);

  let idx = 0;
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const left = c * frameW;
      const top = r * frameH;
      const outFile = join(outputDir, `${name}_${String(idx).padStart(3, '0')}.png`);

      await sharp(input)
        .extract({ left, top, width: frameW, height: frameH })
        .toFile(outFile);

      console.log(`  -> ${outFile}`);
      idx++;
    }
  }

  console.log(`\nDone! ${idx} frames saved to ${outputDir}`);
}

sliceSheet().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
