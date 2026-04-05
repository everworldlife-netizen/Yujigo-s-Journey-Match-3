import Phaser from 'phaser';

/**
 * Centralized tween/animation creation for all game animations.
 * All durations, easings, and behaviors from PRD Section 7.
 * Includes both returnable tweens (for await) and fire-and-forget
 * effects (particles, floating text) that self-clean.
 */

// Berry-themed particle colors
export const BERRY_COLORS: Record<string, number[]> = {
  strawberry: [0xff6b6b, 0xff8888, 0xffaaaa, 0xffe0e0],
  blueberry: [0x6b9fff, 0x88bbff, 0xaaddff, 0xd0e8ff],
  blackberry: [0x6a4c93, 0x8b6db5, 0xac8ed7, 0xcdaffa],
  raspberry: [0xff6b9d, 0xff88b5, 0xffaacc, 0xffd0e0],
  lemon: [0xffe066, 0xffeb88, 0xfff5aa, 0xfffacc],
  moon: [0xd4a5ff, 0xe0bbff, 0xecd1ff, 0xf8e8ff],
  dark: [0x7bc6a0, 0x99d8b8, 0xb7ead0, 0xd5fce8],
};

const AnimationFactory = {

  // ── Setup ──

  /** Generate procedural textures for particles (call once in GameScene.create) */
  ensureTextures(scene: Phaser.Scene): void {
    if (!scene.textures.exists('particle_circle')) {
      const gfx = scene.add.graphics();
      gfx.fillStyle(0xffffff, 1);
      gfx.fillCircle(8, 8, 7);
      gfx.generateTexture('particle_circle', 16, 16);
      gfx.destroy();
    }
    if (!scene.textures.exists('particle_soft')) {
      const gfx = scene.add.graphics();
      for (let i = 12; i > 0; i--) {
        gfx.fillStyle(0xffffff, 0.08 * (12 - i) / 12);
        gfx.fillCircle(12, 12, i);
      }
      gfx.generateTexture('particle_soft', 24, 24);
      gfx.destroy();
    }
    if (!scene.textures.exists('particle_spark')) {
      const gfx = scene.add.graphics();
      gfx.fillStyle(0xffffff, 1);
      gfx.fillTriangle(6, 0, 12, 6, 6, 12);
      gfx.fillTriangle(0, 6, 6, 0, 6, 12);
      gfx.generateTexture('particle_spark', 12, 12);
      gfx.destroy();
    }
  },

  // ── Piece Animations ──

  /** Piece idle breathing: scale 1.0 → 1.02 → 1.0 looping */
  pieceIdle(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject): Phaser.Tweens.Tween {
    return scene.tweens.add({
      targets: target,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
  },

  /** Piece selected: scale up 1.12 with slight rotation */
  pieceSelected(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject): Phaser.Tweens.Tween {
    return scene.tweens.add({
      targets: target,
      scaleX: 1.12,
      scaleY: 1.12,
      duration: 150,
      ease: 'Back.Out',
    });
  },

  /** Piece deselect: return to normal scale */
  pieceDeselect(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject): Phaser.Tweens.Tween {
    return scene.tweens.add({
      targets: target,
      scaleX: 1,
      scaleY: 1,
      duration: 100,
      ease: 'Quad.Out',
    });
  },

  // ── Swap Animations ──

  /** Valid swap: pieces slide to new positions */
  swapPieces(
    scene: Phaser.Scene,
    spriteA: Phaser.GameObjects.GameObject, toA: { x: number; y: number },
    spriteB: Phaser.GameObjects.GameObject, toB: { x: number; y: number },
  ): Phaser.Tweens.Tween[] {
    return [
      scene.tweens.add({ targets: spriteA, x: toA.x, y: toA.y, duration: 200, ease: 'Cubic.InOut' }),
      scene.tweens.add({ targets: spriteB, x: toB.x, y: toB.y, duration: 200, ease: 'Cubic.InOut' }),
    ];
  },

  /** Invalid swap: slide halfway then bounce back */
  swapInvalid(
    scene: Phaser.Scene,
    spriteA: Phaser.GameObjects.GameObject, posA: { x: number; y: number },
    spriteB: Phaser.GameObjects.GameObject, posB: { x: number; y: number },
  ): Phaser.Tweens.TweenChain[] {
    const midX = (posA.x + posB.x) / 2;
    const midY = (posA.y + posB.y) / 2;
    return [
      scene.tweens.chain({
        targets: spriteA,
        tweens: [
          { x: midX, y: midY, duration: 100, ease: 'Quad.Out' },
          { x: posA.x, y: posA.y, duration: 200, ease: 'Bounce.Out' },
        ],
      }),
      scene.tweens.chain({
        targets: spriteB,
        tweens: [
          { x: midX, y: midY, duration: 100, ease: 'Quad.Out' },
          { x: posB.x, y: posB.y, duration: 200, ease: 'Bounce.Out' },
        ],
      }),
    ];
  },

  // ── Match Clear Animations ──

  /** Per-piece match clear: flash white, scale up 1.3, shrink to 0 */
  matchClearPiece(scene: Phaser.Scene, target: Phaser.GameObjects.Sprite): Phaser.Tweens.Tween {
    target.setTint(0xffffff);
    scene.time.delayedCall(80, () => { if (target.active) target.clearTint(); });
    return scene.tweens.add({
      targets: target,
      scaleX: { from: 1.3, to: 0 },
      scaleY: { from: 1.3, to: 0 },
      alpha: { from: 1, to: 0 },
      duration: 300,
      ease: 'Quad.In',
      delay: 80,
    });
  },

  /** Particle burst at match position, colored to berry type */
  matchBurst(scene: Phaser.Scene, x: number, y: number, berryType: string): void {
    const colors = BERRY_COLORS[berryType] || [0xffffff, 0xeeeeee];
    const emitter = scene.add.particles(x, y, 'particle_circle', {
      speed: { min: 80, max: 200 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: { min: 300, max: 600 },
      angle: { min: 0, max: 360 },
      tint: colors,
      quantity: 8,
      emitting: false,
    });
    emitter.setDepth(25);
    emitter.explode();
    scene.time.delayedCall(700, () => emitter.destroy());

    const sparkle = scene.add.particles(x, y, 'particle_spark', {
      speed: { min: 30, max: 120 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: { min: 400, max: 800 },
      angle: { min: 0, max: 360 },
      tint: [0xffffff, 0xfffacd],
      quantity: 5,
      emitting: false,
    });
    sparkle.setDepth(26);
    sparkle.explode();
    scene.time.delayedCall(900, () => sparkle.destroy());
  },

  // ── Cascade & Spawn ──

  /** Cascade fall: piece drops with satisfying bounce */
  cascadeFall(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, toY: number, distance: number, staggerDelay: number): Phaser.Tweens.Tween {
    const duration = 150 + distance * 40;
    return scene.tweens.add({
      targets: target,
      y: toY,
      duration,
      ease: 'Bounce.Out',
      delay: staggerDelay,
    });
  },

  /** Spawn drop-in: new pieces fall from above with stagger squash */
  spawnDropIn(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, toY: number, staggerDelay: number): Phaser.Tweens.Tween {
    return scene.tweens.add({
      targets: target,
      y: toY,
      duration: 300,
      ease: 'Back.Out',
      delay: staggerDelay,
    });
  },

  /** Landing squash-and-stretch on cascade/spawn landing */
  landingSquash(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, delay: number): Phaser.Tweens.Tween {
    return scene.tweens.add({
      targets: target,
      scaleX: { from: 1.15, to: 1 },
      scaleY: { from: 0.85, to: 1 },
      duration: 200,
      ease: 'Elastic.Out',
      delay,
    });
  },

  // ── Floating Score Text ──

  /** Score number floating up from match position and fading */
  floatingScore(scene: Phaser.Scene, score: number, x: number, y: number, multiplier: number = 1): void {
    const color = multiplier >= 4 ? '#ff4444' : multiplier >= 3 ? '#ff8800' : multiplier >= 2 ? '#ffaa00' : '#ffdd44';
    const fontSize = multiplier >= 3 ? '22px' : multiplier >= 2 ? '18px' : '16px';
    const text = scene.add.text(x, y, `+${score}`, {
      fontFamily: 'Georgia, "Palatino Linotype", serif',
      fontSize,
      color,
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 3,
      shadow: { offsetX: 1, offsetY: 1, color: '#00000033', blur: 4, fill: true },
    }).setOrigin(0.5).setDepth(30).setAlpha(0).setScale(0.5);

    scene.tweens.add({ targets: text, scaleX: 1.2, scaleY: 1.2, alpha: 1, duration: 150, ease: 'Back.Out' });
    scene.tweens.add({ targets: text, y: y - 60, scaleX: 0.8, scaleY: 0.8, alpha: 0, delay: 300, duration: 600, ease: 'Quad.In', onComplete: () => text.destroy() });
  },

  // ── Combo Text ──

  /** Dramatic combo label: Great! Amazing! Magical! INCREDIBLE! */
  comboPopup(scene: Phaser.Scene, label: string, chain: number): void {
    const { width, height } = scene.scale;
    const colors: Record<string, string> = { 'Great!': '#ff8800', 'Amazing!': '#ff4488', 'Magical!': '#aa44ff', 'INCREDIBLE!': '#ff2222' };
    const color = colors[label] || '#ff8800';
    const size = Math.min(36, 24 + chain * 3);
    const text = scene.add.text(width / 2, height * 0.32, label, {
      fontFamily: 'Georgia, "Palatino Linotype", serif',
      fontSize: `${size}px`,
      color,
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 5,
      shadow: { offsetX: 2, offsetY: 2, color: '#00000044', blur: 8, fill: true },
    }).setOrigin(0.5).setDepth(100).setAlpha(0).setScale(0.2);

    scene.tweens.add({ targets: text, scaleX: 1.4, scaleY: 1.4, alpha: 1, duration: 250, ease: 'Back.Out' });
    scene.tweens.add({ targets: text, scaleX: 1, scaleY: 1, delay: 250, duration: 200, ease: 'Quad.Out' });
    scene.tweens.add({ targets: text, angle: { from: -3, to: 3 }, duration: 100, yoyo: true, repeat: 2, delay: 250, ease: 'Sine.InOut' });
    scene.tweens.add({ targets: text, y: text.y - 50, alpha: 0, delay: 1000, duration: 500, ease: 'Quad.In', onComplete: () => text.destroy() });

    if (chain >= 3) {
      const sparkle = scene.add.particles(width / 2, height * 0.32, 'particle_spark', {
        speed: { min: 40, max: 100 }, scale: { start: 0.5, end: 0 }, alpha: { start: 0.8, end: 0 },
        lifespan: 800, angle: { min: 0, max: 360 }, tint: [0xffd700, 0xffaa00, 0xffffff], quantity: 12, emitting: false,
      });
      sparkle.setDepth(99);
      sparkle.explode();
      scene.time.delayedCall(900, () => sparkle.destroy());
    }
  },

  // ── Powerup Effects ──

  /** Powerup creation: radial glow burst at spawn position */
  powerupCreate(scene: Phaser.Scene, x: number, y: number): void {
    const burst = scene.add.particles(x, y, 'particle_soft', {
      speed: { min: 60, max: 180 }, scale: { start: 0.8, end: 0 }, alpha: { start: 1, end: 0 },
      lifespan: { min: 400, max: 700 }, angle: { min: 0, max: 360 }, tint: [0xffd700, 0xffaa00, 0xffffff], quantity: 15, emitting: false,
    });
    burst.setDepth(25);
    burst.explode();
    scene.time.delayedCall(800, () => burst.destroy());

    const ring = scene.add.graphics().setDepth(24);
    ring.lineStyle(3, 0xffd700, 0.8);
    ring.strokeCircle(x, y, 5);
    scene.tweens.add({ targets: ring, scaleX: 4, scaleY: 4, alpha: 0, duration: 400, ease: 'Quad.Out', onComplete: () => ring.destroy() });
  },

  /** Line clear sweep effect */
  lineClearSweep(scene: Phaser.Scene, y: number, direction: 'h' | 'v', gridWidth: number, startX: number): void {
    const count = 20;
    for (let i = 0; i < count; i++) {
      const px = direction === 'h' ? startX + (gridWidth * i / count) : startX + gridWidth / 2;
      const py = direction === 'v' ? y + (gridWidth * i / count) : y;
      scene.time.delayedCall(i * 20, () => {
        const spark = scene.add.particles(px, py, 'particle_circle', {
          speed: { min: 20, max: 80 }, scale: { start: 0.5, end: 0 }, lifespan: 400,
          tint: [0xffd700, 0xffffff], quantity: 3, emitting: false,
        });
        spark.setDepth(25);
        spark.explode();
        scene.time.delayedCall(500, () => spark.destroy());
      });
    }
  },

  /** Bomb explosion: large circular burst */
  bombExplosion(scene: Phaser.Scene, x: number, y: number): void {
    const burst = scene.add.particles(x, y, 'particle_circle', {
      speed: { min: 100, max: 300 }, scale: { start: 0.8, end: 0 }, alpha: { start: 1, end: 0 },
      lifespan: { min: 400, max: 800 }, angle: { min: 0, max: 360 },
      tint: [0xff4444, 0xff8800, 0xffdd00, 0xffffff], quantity: 25, emitting: false,
    });
    burst.setDepth(25);
    burst.explode();
    scene.time.delayedCall(900, () => burst.destroy());

    const ring = scene.add.graphics().setDepth(24);
    ring.lineStyle(4, 0xff8800, 0.9);
    ring.strokeCircle(x, y, 10);
    scene.tweens.add({ targets: ring, scaleX: 6, scaleY: 6, alpha: 0, duration: 500, ease: 'Quad.Out', onComplete: () => ring.destroy() });
  },

  // ── Screen Effects ──

  /** Screen shake: intensity scales with combo chain */
  screenShake(scene: Phaser.Scene, intensity: number = 1): void {
    const amount = Math.min(0.015, 0.003 * intensity);
    const duration = Math.min(500, 200 + intensity * 50);
    scene.cameras.main.shake(duration, amount);
  },

  // ── UI Animations ──

  /** Star earned: scale 0 bounce to 1 */
  starEarned(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, delay: number = 0): Phaser.Tweens.Tween {
    return scene.tweens.add({
      targets: target,
      scaleX: { from: 0, to: 1 },
      scaleY: { from: 0, to: 1 },
      duration: 600,
      ease: 'Elastic.Out',
      delay,
    });
  },

  /** Score tick-up: animate a text number from start to end */
  scoreTick(scene: Phaser.Scene, textObj: Phaser.GameObjects.Text, from: number, to: number): Phaser.Tweens.Tween {
    const obj = { value: from };
    return scene.tweens.add({
      targets: obj,
      value: to,
      duration: 500,
      ease: 'Quad.Out',
      onUpdate: () => textObj.setText(String(Math.round(obj.value))),
    });
  },

  /** Moves counter urgency pulse (last 5 moves) */
  urgencyPulse(scene: Phaser.Scene, target: Phaser.GameObjects.Text): Phaser.Tweens.Tween {
    return scene.tweens.add({
      targets: target,
      scaleX: { from: 1, to: 1.2 },
      scaleY: { from: 1, to: 1.2 },
      duration: 300,
      yoyo: true,
      ease: 'Sine.InOut',
    });
  },

  /** Goal completion celebration burst */
  goalComplete(scene: Phaser.Scene, x: number, y: number): void {
    const burst = scene.add.particles(x, y, 'particle_spark', {
      speed: { min: 50, max: 150 }, scale: { start: 0.6, end: 0 }, lifespan: 600,
      tint: [0x44ff44, 0x88ff88, 0xffd700], quantity: 10, emitting: false,
    });
    burst.setDepth(50);
    burst.explode();
    scene.time.delayedCall(700, () => burst.destroy());
  },

  /** Board entrance: staggered drop-in for all pieces */
  boardEntrance(scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite, targetY: number, row: number, col: number): Phaser.Tweens.Tween {
    const delay = row * 50 + col * 20 + Math.random() * 30;
    return scene.tweens.add({
      targets: sprite,
      y: targetY,
      alpha: { from: 0, to: 1 },
      duration: 450,
      ease: 'Back.Out',
      delay,
    });
  },

  // ── Obstacle Animations ──

  /** Ice crack: white flash + scale wiggle + particle shards */
  iceCrack(scene: Phaser.Scene, x: number, y: number, destroyed: boolean): void {
    const burst = scene.add.particles(x, y, 'particle_spark', {
      speed: { min: 40, max: destroyed ? 150 : 80 }, scale: { start: 0.4, end: 0 },
      alpha: { start: 1, end: 0 }, lifespan: { min: 300, max: 500 }, angle: { min: 0, max: 360 },
      tint: [0xaaddff, 0xcceeFF, 0xffffff], quantity: destroyed ? 12 : 5, emitting: false,
    });
    burst.setDepth(25);
    burst.explode();
    scene.time.delayedCall(600, () => burst.destroy());
  },

  /** Crate break: wooden splinter particles */
  crateBreak(scene: Phaser.Scene, x: number, y: number): void {
    const burst = scene.add.particles(x, y, 'particle_circle', {
      speed: { min: 60, max: 200 }, scale: { start: 0.5, end: 0 }, alpha: { start: 1, end: 0 },
      lifespan: { min: 400, max: 700 }, angle: { min: 0, max: 360 },
      tint: [0xc4903c, 0x8b6e3c, 0xdab06a], quantity: 15, emitting: false,
    });
    burst.setDepth(25);
    burst.explode();
    scene.time.delayedCall(800, () => burst.destroy());
  },

  /** Chain break: metallic spark burst */
  chainBreak(scene: Phaser.Scene, x: number, y: number, destroyed: boolean): void {
    const burst = scene.add.particles(x, y, 'particle_spark', {
      speed: { min: 30, max: destroyed ? 120 : 60 }, scale: { start: 0.3, end: 0 }, lifespan: 400,
      tint: [0x888888, 0xaaaaaa, 0xffd700], quantity: destroyed ? 10 : 4, emitting: false,
    });
    burst.setDepth(25);
    burst.explode();
    scene.time.delayedCall(500, () => burst.destroy());
  },

  /** Honey dissolve: golden drip effect */
  honeyDissolve(scene: Phaser.Scene, x: number, y: number): void {
    const burst = scene.add.particles(x, y, 'particle_soft', {
      speed: { min: 10, max: 50 }, scale: { start: 0.6, end: 0 }, alpha: { start: 0.8, end: 0 },
      lifespan: 500, angle: { min: 60, max: 120 },
      tint: [0xffcc00, 0xffaa00, 0xffe066], quantity: 8, emitting: false,
    });
    burst.setDepth(25);
    burst.explode();
    scene.time.delayedCall(600, () => burst.destroy());
  },

  /** Obstacle overlay damage wiggle */
  obstacleHit(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject): Phaser.Tweens.Tween {
    return scene.tweens.add({
      targets: target,
      x: { from: (target as Phaser.GameObjects.Sprite).x - 3, to: (target as Phaser.GameObjects.Sprite).x + 3 },
      duration: 60,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.InOut',
    });
  },

  /** Obstacle destroy: scale up + fade out */
  obstacleDestroy(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject): Phaser.Tweens.Tween {
    return scene.tweens.add({
      targets: target,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 250,
      ease: 'Quad.Out',
    });
  },
};

export default AnimationFactory;
