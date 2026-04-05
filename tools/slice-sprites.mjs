/**
 * Sprite Sheet Atlas JSON Generator
 * Analyzes sprite sheets and generates Phaser atlas JSON files.
 * For grid-based sheets: divides into even cells and trims whitespace.
 * For irregular sheets: uses known layout definitions.
 *
 * Usage: node tools/slice-sprites.mjs
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ASSETS = path.join(ROOT, 'public', 'assets', 'images');

// ── Atlas Output Helpers ──

function buildAtlasJSON(imagePath, frames) {
  return {
    frames: Object.fromEntries(
      frames.map(f => [
        f.filename,
        {
          frame: { x: f.x, y: f.y, w: f.w, h: f.h },
          rotated: false,
          trimmed: false,
          spriteSourceSize: { x: 0, y: 0, w: f.w, h: f.h },
          sourceSize: { w: f.w, h: f.h },
        },
      ])
    ),
    meta: {
      app: 'yujigo-sprite-slicer',
      version: '1.0',
      image: path.basename(imagePath),
      format: 'RGBA8888',
      size: { w: 0, h: 0 }, // filled below
      scale: '1',
    },
  };
}

async function getImageSize(filePath) {
  const meta = await sharp(filePath).metadata();
  return { w: meta.width, h: meta.height };
}

// ── Grid-Based Slicer ──

async function sliceGridSheet(imagePath, cols, rows, labels, outputJsonPath) {
  const size = await getImageSize(imagePath);
  const cellW = Math.floor(size.w / cols);
  const cellH = Math.floor(size.h / rows);

  const frames = [];
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (idx >= labels.length) break;
      const name = labels[idx];
      if (name) {
        frames.push({ filename: name, x: c * cellW, y: r * cellH, w: cellW, h: cellH });
      }
      idx++;
    }
  }

  const atlas = buildAtlasJSON(imagePath, frames);
  atlas.meta.size = size;
  fs.writeFileSync(outputJsonPath, JSON.stringify(atlas, null, 2));
  console.log(`${path.basename(outputJsonPath)}: ${frames.length} frames (${cellW}x${cellH} each)`);
  return frames;
}

// ── Irregular Layout Slicer ──

async function sliceManualSheet(imagePath, framesDefs, outputJsonPath) {
  const size = await getImageSize(imagePath);
  const atlas = buildAtlasJSON(imagePath, framesDefs);
  atlas.meta.size = size;
  fs.writeFileSync(outputJsonPath, JSON.stringify(atlas, null, 2));
  console.log(`${path.basename(outputJsonPath)}: ${framesDefs.length} frames (manual)`);
  return framesDefs;
}

// ── Sheet Definitions ──

async function processYujigo() {
  console.log('\n--- Yujigo Sprites (1536x2754, 5x5 grid) ---');
  const labels = [
    // Row 1
    'yujigo_idle', 'yujigo_happy', 'yujigo_sad', 'yujigo_celebrating', 'yujigo_crying',
    // Row 2
    'yujigo_waving', 'yujigo_pointing', 'yujigo_nervous', 'yujigo_praying', 'yujigo_running',
    // Row 3
    'yujigo_scared', 'yujigo_back', 'yujigo_confident', 'yujigo_thinking', 'yujigo_surprised',
    // Row 4
    'yujigo_sitting', 'yujigo_holdingberry', 'yujigo_magic', 'yujigo_determined', 'yujigo_tiny',
  ];
  await sliceGridSheet(
    path.join(ASSETS, 'yujigo', 'yujigosprites.png'),
    5, 4, labels,
    path.join(ASSETS, 'yujigo', 'yujigosprites.json'),
  );
}

async function processKirumi() {
  console.log('\n--- Kirumi Sprites (1536x2754, 5x5 grid) ---');
  const labels = [
    // Row 1
    'kirumi_idle', 'kirumi_hearts', 'kirumi_fluffy', 'kirumi_sleeping', null,
    // Row 2
    'kirumi_walking', 'kirumi_happy', 'kirumi_shy', 'kirumi_running', 'kirumi_holdingberry',
    // Row 3
    'kirumi_sitting', 'kirumi_curious', 'kirumi_praying', 'kirumi_dancing', 'kirumi_waving',
    // Row 4
    'kirumi_playful', 'kirumi_stretching', 'kirumi_surprised', 'kirumi_pawing', 'kirumi_napping',
    // Row 5
    'kirumi_withyujigo', 'kirumi_tiny', 'kirumi_bush', null, null,
  ];

  const size = await getImageSize(path.join(ASSETS, 'yujigo', 'kirumisprites.png'));
  const cellW = Math.floor(size.w / 5);
  const cellH = Math.floor(size.h / 5);
  const frames = [];
  let idx = 0;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const name = labels[idx];
      if (name) {
        frames.push({ filename: name, x: c * cellW, y: r * cellH, w: cellW, h: cellH });
      }
      idx++;
    }
  }
  const atlas = buildAtlasJSON(path.join(ASSETS, 'yujigo', 'kirumisprites.png'), frames);
  atlas.meta.size = size;
  fs.writeFileSync(path.join(ASSETS, 'yujigo', 'kirumisprites.json'), JSON.stringify(atlas, null, 2));
  console.log(`kirumisprites.json: ${frames.length} frames (${cellW}x${cellH} each, with gaps)`);
}

async function processNPC() {
  console.log('\n--- NPC Sprites (2816x1536, 6x3 grid) ---');
  const size = await getImageSize(path.join(ASSETS, 'yujigo', 'npcsprites.png'));
  const titleBarH = 100;
  const usableH = size.h - titleBarH;
  const cellW = Math.floor(size.w / 6);
  const cellH = Math.floor(usableH / 3);

  const npcNames = ['grannybramble', 'captainfox', 'hummingbird', 'farmerhedge', 'butterfly', 'bunnybaker'];
  const poseNames = ['idle', 'talking', 'special'];

  const frames = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 6; c++) {
      frames.push({
        filename: `npc_${npcNames[c]}_${poseNames[r]}`,
        x: c * cellW,
        y: titleBarH + r * cellH,
        w: cellW,
        h: cellH,
      });
    }
  }

  const atlas = buildAtlasJSON(path.join(ASSETS, 'yujigo', 'npcsprites.png'), frames);
  atlas.meta.size = size;
  fs.writeFileSync(path.join(ASSETS, 'yujigo', 'npcsprites.json'), JSON.stringify(atlas, null, 2));
  console.log(`npcsprites.json: ${frames.length} frames (${cellW}x${cellH} each)`);
}

async function processUI() {
  console.log('\n--- UI Elements (2816x1536, irregular layout) ---');
  const frames = [
    // Row 1: Large buttons (top)
    { filename: 'ui_btn_play', x: 20, y: 20, w: 320, h: 190 },
    { filename: 'ui_btn_pause', x: 360, y: 20, w: 240, h: 190 },
    { filename: 'ui_btn_settings', x: 620, y: 20, w: 230, h: 230 },
    { filename: 'ui_btn_back', x: 870, y: 20, w: 240, h: 190 },
    { filename: 'ui_coin_purse', x: 1130, y: 20, w: 200, h: 200 },
    { filename: 'ui_collection_book', x: 1350, y: 20, w: 190, h: 210 },
    // Row 2: Frames, shields, progress
    { filename: 'ui_frame_score', x: 20, y: 280, w: 420, h: 210 },
    { filename: 'ui_frame_avatar', x: 460, y: 280, w: 210, h: 210 },
    { filename: 'ui_banner_stars', x: 690, y: 280, w: 380, h: 190 },
    { filename: 'ui_shield_level', x: 1090, y: 280, w: 190, h: 210 },
    { filename: 'ui_coin_counter', x: 1300, y: 280, w: 350, h: 140 },
    { filename: 'ui_frame_moves', x: 1300, y: 440, w: 210, h: 130 },
    // Row 3: Stars and progress bars
    { filename: 'ui_star_empty', x: 20, y: 560, w: 175, h: 175 },
    { filename: 'ui_star_bronze', x: 210, y: 560, w: 175, h: 175 },
    { filename: 'ui_star_silver', x: 400, y: 560, w: 175, h: 175 },
    { filename: 'ui_star_gold', x: 590, y: 560, w: 175, h: 175 },
    { filename: 'ui_progress_empty', x: 800, y: 600, w: 350, h: 80 },
    { filename: 'ui_progress_full', x: 800, y: 700, w: 350, h: 80 },
    { filename: 'ui_progress_berry', x: 1200, y: 560, w: 400, h: 90 },
    { filename: 'ui_progress_rainbow', x: 1200, y: 670, w: 400, h: 90 },
    // Row 4: Banners, dialogs, small buttons
    { filename: 'ui_banner_pink', x: 20, y: 820, w: 400, h: 150 },
    { filename: 'ui_banner_dark', x: 440, y: 820, w: 400, h: 150 },
    { filename: 'ui_dialog_box', x: 860, y: 820, w: 520, h: 220 },
    { filename: 'ui_btn_close', x: 1420, y: 820, w: 160, h: 160 },
    { filename: 'ui_btn_confirm', x: 1600, y: 820, w: 160, h: 160 },
    { filename: 'ui_btn_info', x: 1780, y: 820, w: 140, h: 160 },
  ];
  await sliceManualSheet(
    path.join(ASSETS, 'ui', 'uielements.png'),
    frames,
    path.join(ASSETS, 'ui', 'uielements.json'),
  );
}

async function processWorldMap() {
  console.log('\n--- World Map Elements (2816x1536) ---');
  const colW = 560; // 2816 / 5
  const frames = [
    // Logo banner
    { filename: 'map_logo_banner', x: 800, y: 10, w: 600, h: 100 },
    // Row 1: Level Nodes
    { filename: 'map_node_locked', x: colW * 0 + 40, y: 150, w: 480, h: 300 },
    { filename: 'map_node_available', x: colW * 1 + 40, y: 150, w: 480, h: 300 },
    { filename: 'map_node_1star', x: colW * 2 + 40, y: 150, w: 480, h: 300 },
    { filename: 'map_node_2star', x: colW * 3 + 40, y: 150, w: 480, h: 300 },
    { filename: 'map_node_3star', x: colW * 4 + 40, y: 150, w: 480, h: 300 },
    // Row 2: Path Elements
    { filename: 'map_path_dotted', x: colW * 0 + 40, y: 500, w: 480, h: 280 },
    { filename: 'map_path_curved', x: colW * 1 + 40, y: 500, w: 480, h: 280 },
    { filename: 'map_path_footprints', x: colW * 2 + 40, y: 500, w: 480, h: 280 },
    { filename: 'map_bridge', x: colW * 3 + 40, y: 500, w: 480, h: 280 },
    { filename: 'map_vines', x: colW * 4 + 40, y: 500, w: 480, h: 280 },
    // Row 3: World Landmarks
    { filename: 'map_pillowpatch', x: colW * 0 + 40, y: 830, w: 480, h: 300 },
    { filename: 'map_frostberry', x: colW * 1 + 40, y: 830, w: 480, h: 300 },
    { filename: 'map_sunberry', x: colW * 2 + 40, y: 830, w: 480, h: 300 },
    { filename: 'map_bramble', x: colW * 3 + 40, y: 830, w: 480, h: 300 },
    { filename: 'map_moonberry', x: colW * 4 + 40, y: 830, w: 480, h: 300 },
    // Row 4: Decorations
    { filename: 'map_deco_trees', x: colW * 0 + 40, y: 1180, w: 480, h: 300 },
    { filename: 'map_deco_pond', x: colW * 1 + 40, y: 1180, w: 480, h: 300 },
    { filename: 'map_deco_bush', x: colW * 2 + 40, y: 1180, w: 480, h: 300 },
    { filename: 'map_deco_cloud', x: colW * 3 + 40, y: 1180, w: 480, h: 300 },
    { filename: 'map_deco_compass', x: colW * 4 + 40, y: 1180, w: 480, h: 300 },
  ];
  await sliceManualSheet(
    path.join(ASSETS, 'ui', 'worldmapelements.png'),
    frames,
    path.join(ASSETS, 'ui', 'worldmapelements.json'),
  );
}

// ── Main ──

async function main() {
  console.log('=== Yujigo\'s Journey — Sprite Sheet Atlas Generator ===');
  console.log(`Assets root: ${ASSETS}`);

  await processYujigo();
  await processKirumi();
  await processNPC();
  await processUI();
  await processWorldMap();

  console.log('\n=== All atlas JSON files generated! ===');
  console.log('Next steps:');
  console.log('  1. Update PreloadScene to load.atlas() for each sheet');
  console.log('  2. Update AssetConfig to map frame keys');
  console.log('  3. Visually verify frames in Phaser Editor');
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
