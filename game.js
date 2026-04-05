// ============================================
// YUJIGO'S JOURNEY - AAA MATCH 3 GAME
// Built with Phaser 3 - Candy Crush Quality
// ============================================

const COLS = 8;
const ROWS = 8;
const CELL = 68;
const PAD = 4;
const OX = 80;
const OY = 140;
const NUM_COLORS = 6;

const GEMS = [
  { name:'ruby',    base:0xff2255, mid:0xff5577, hi:0xff99aa, lo:0xaa1133, glow:0xff4477 },
  { name:'sapphire', base:0x2255ff, mid:0x5577ff, hi:0x99aaff, lo:0x1133aa, glow:0x4477ff },
  { name:'emerald', base:0x22ff55, mid:0x55ff77, hi:0x99ffaa, lo:0x11aa33, glow:0x44ff77 },
  { name:'topaz',   base:0xffcc22, mid:0xffdd55, hi:0xffee99, lo:0xaa8811, glow:0xffdd44 },
  { name:'amethyst', base:0xbb22ff, mid:0xcc55ff, hi:0xdd99ff, lo:0x7711aa, glow:0xcc44ff },
  { name:'citrine', base:0xff8822, mid:0xffaa55, hi:0xffcc99, lo:0xaa5511, glow:0xffaa44 },
];

class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    GEMS.forEach((g, i) => {
      const canvas = document.createElement('canvas');
      canvas.width = 64; canvas.height = 64;
      const ctx = canvas.getContext('2d');
      this.drawGem(ctx, g);
      this.textures.addCanvas('gem_' + i, canvas);
    });

    const sg = this.add.graphics();
    sg.lineStyle(3, 0xffffff, 0.9);
    sg.strokeCircle(36, 36, 32);
    sg.lineStyle(2, 0xffff00, 0.6);
    sg.strokeCircle(36, 36, 34);
    sg.generateTexture('select_ring', 72, 72);
    sg.destroy();

    const pc = document.createElement('canvas');
    pc.width = 16; pc.height = 16;
    const pctx = pc.getContext('2d');
    const pgr = pctx.createRadialGradient(8,8,0,8,8,8);
    pgr.addColorStop(0, 'rgba(255,255,255,1)');
    pgr.addColorStop(0.4, 'rgba(255,255,200,0.8)');
    pgr.addColorStop(1, 'rgba(255,255,100,0)');
    pctx.fillStyle = pgr;
    pctx.fillRect(0,0,16,16);
    this.textures.addCanvas('spark', pc);

    const sc = document.createElement('canvas');
    sc.width = 24; sc.height = 24;
    const sctx = sc.getContext('2d');
    sctx.fillStyle = '#ffffff';
    sctx.beginPath();
    for (let j = 0; j < 5; j++) {
      const a = (j * 72 - 90) * Math.PI / 180;
      const a2 = ((j * 72) + 36 - 90) * Math.PI / 180;
      sctx.lineTo(12 + Math.cos(a) * 10, 12 + Math.sin(a) * 10);
      sctx.lineTo(12 + Math.cos(a2) * 4, 12 + Math.sin(a2) * 4);
    }
    sctx.closePath(); sctx.fill();
    this.textures.addCanvas('star', sc);

    const bg = this.add.graphics();
    bg.fillStyle(0x2a1a4a, 1); bg.fillRect(0, 0, CELL, CELL);
    bg.fillStyle(0x231545, 1); bg.fillRect(2, 2, CELL-4, CELL-4);
    bg.fillStyle(0x1e1240, 0.5); bg.fillRoundedRect(4, 4, CELL-8, CELL-8, 8);
    bg.generateTexture('cell_bg', CELL, CELL);
    bg.destroy();

    const bg2 = this.add.graphics();
    bg2.fillStyle(0x251748, 1); bg2.fillRect(0, 0, CELL, CELL);
    bg2.fillStyle(0x1e1240, 1); bg2.fillRect(2, 2, CELL-4, CELL-4);
    bg2.fillStyle(0x1a0e3a, 0.5); bg2.fillRoundedRect(4, 4, CELL-8, CELL-8, 8);
    bg2.generateTexture('cell_bg2', CELL, CELL);
    bg2.destroy();

    this.scene.start('GameScene');
  }

  drawGem(ctx, g) {
    const cx = 32, cy = 32, r = 26;
    ctx.beginPath();
    ctx.arc(cx+2, cy+3, r, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fill();
    const grad = ctx.createRadialGradient(cx-8, cy-10, 4, cx, cy, r);
    const toCSS = (hex) => '#' + hex.toString(16).padStart(6,'0');
    grad.addColorStop(0, toCSS(g.hi));
    grad.addColorStop(0.35, toCSS(g.mid));
    grad.addColorStop(0.7, toCSS(g.base));
    grad.addColorStop(1, toCSS(g.lo));
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.fillStyle = grad;
    ctx.fill();
    const gloss = ctx.createRadialGradient(cx-4, cy-12, 2, cx, cy-6, 20);
    gloss.addColorStop(0, 'rgba(255,255,255,0.7)');
    gloss.addColorStop(0.5, 'rgba(255,255,255,0.15)');
    gloss.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.ellipse(cx-2, cy-10, 18, 12, -0.2, 0, Math.PI*2);
    ctx.fillStyle = gloss;
    ctx.fill();
    const spec = ctx.createRadialGradient(cx-8, cy-14, 0, cx-8, cy-14, 8);
    spec.addColorStop(0, 'rgba(255,255,255,0.95)');
    spec.addColorStop(0.5, 'rgba(255,255,255,0.3)');
    spec.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(cx-8, cy-14, 8, 0, Math.PI*2);
    ctx.fillStyle = spec;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx-12, cy-10, 3, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fill();
    const rim = ctx.createRadialGradient(cx+6, cy+16, 0, cx+6, cy+16, 14);
    rim.addColorStop(0, 'rgba(255,255,255,0.2)');
    rim.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(cx+6, cy+16, 14, 0, Math.PI*2);
    ctx.fillStyle = rim;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.strokeStyle = toCSS(g.lo);
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.grid = [];
    this.selectedGem = null;
    this.selectRing = null;
    this.isProcessing = false;
    this.score = 0;
    this.movesLeft = 30;
    this.targetScore = 5000;
    this.comboCount = 0;
    this.hintTimer = null;
    this.idleTweens = [];
  }

  create() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0d0521, 0x0d0521, 0x1a0a3e, 0x2d1569, 1);
    bg.fillRect(0, 0, 800, 750);
    this.bgEmitter = this.add.particles(400, 375, 'spark', {
      x: { min: 0, max: 800 }, y: { min: 0, max: 750 },
      scale: { start: 0.3, end: 0 }, alpha: { start: 0.3, end: 0 },
      speed: { min: 5, max: 20 }, lifespan: 4000,
      frequency: 300, blendMode: 'ADD',
      tint: [0x6633ff, 0x3366ff, 0xcc33ff, 0xff33cc]
    });
    const boardW = COLS * CELL + 16, boardH = ROWS * CELL + 16;
    const board = this.add.graphics();
    board.fillStyle(0x0a0520, 0.8);
    board.fillRoundedRect(OX-8, OY-8, boardW, boardH, 12);
    board.lineStyle(2, 0x4422aa, 0.6);
    board.strokeRoundedRect(OX-8, OY-8, boardW, boardH, 12);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const tex = (r + c) % 2 === 0 ? 'cell_bg' : 'cell_bg2';
        this.add.image(OX + c * CELL + CELL/2, OY + r * CELL + CELL/2, tex);
      }
    }
    const uiBg = this.add.graphics();
    uiBg.fillStyle(0x0a0520, 0.9);
    uiBg.fillRoundedRect(60, 10, 680, 110, 16);
    uiBg.lineStyle(2, 0x6633cc, 0.5);
    uiBg.strokeRoundedRect(60, 10, 680, 110, 16);
    this.add.text(401, 37, "YUJIGO'S JOURNEY", { fontSize: '32px', fontFamily: 'Arial Black', color: '#6633cc' }).setOrigin(0.5).setAlpha(0.5);
    this.add.text(400, 35, "YUJIGO'S JOURNEY", { fontSize: '32px', fontFamily: 'Arial Black', color: '#ffcc33', stroke: '#aa6600', strokeThickness: 4 }).setOrigin(0.5);
    this.add.graphics().fillStyle(0x1a0a3e, 1).fillRoundedRect(80, 70, 180, 40, 8);
    this.add.text(100, 76, 'SCORE', { fontSize: '11px', fontFamily: 'Arial', color: '#8866cc' });
    this.scoreText = this.add.text(240, 82, '0', { fontSize: '22px', fontFamily: 'Arial Black', color: '#ffffff' }).setOrigin(1, 0);
    this.add.graphics().fillStyle(0x1a0a3e, 1).fillRoundedRect(300, 70, 120, 40, 8);
    this.add.text(315, 76, 'MOVES', { fontSize: '11px', fontFamily: 'Arial', color: '#8866cc' });
    this.movesText = this.add.text(400, 82, '30', { fontSize: '22px', fontFamily: 'Arial Black', color: '#ffcc33' }).setOrigin(1, 0);
    this.add.graphics().fillStyle(0x1a0a3e, 1).fillRoundedRect(450, 70, 270, 40, 8);
    this.add.text(465, 76, 'TARGET: 5,000', { fontSize: '11px', fontFamily: 'Arial', color: '#8866cc' });
    this.add.graphics().fillStyle(0x0a0520, 1).fillRoundedRect(465, 94, 240, 10, 5);
    this.progressBar = this.add.graphics();
    this.updateProgressBar();
    this.comboText = this.add.text(400, 400, '', { fontSize: '36px', fontFamily: 'Arial Black', color: '#ff33cc', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5).setAlpha(0).setDepth(100);
    this.initGrid();
    this.removeInitialMatches();
    this.animateGridIn();
    this.selectRing = this.add.image(0, 0, 'select_ring').setVisible(false).setDepth(50);
    this.tweens.add({ targets: this.selectRing, angle: 360, duration: 2000, repeat: -1 });
    this.resetHintTimer();
  }

  updateProgressBar() {
    this.progressBar.clear();
    const pct = Math.min(this.score / this.targetScore, 1);
    if (pct > 0) {
      this.progressBar.fillStyle(pct < 0.5 ? 0xffcc33 : pct < 0.8 ? 0x66ff33 : 0x33ffcc, 1);
      this.progressBar.fillRoundedRect(465, 94, 240 * pct, 10, 5);
    }
  }

  getPos(row, col) { return { x: OX + col * CELL + CELL/2, y: OY + row * CELL + CELL/2 }; }

  initGrid() {
    this.grid = [];
    for (let r = 0; r < ROWS; r++) {
      this.grid[r] = [];
      for (let c = 0; c < COLS; c++) {
        this.grid[r][c] = this.createGem(r, c, Phaser.Math.Between(0, NUM_COLORS-1));
      }
    }
  }

  createGem(row, col, colorIdx) {
    const p = this.getPos(row, col);
    const gem = this.add.image(p.x, p.y, 'gem_' + colorIdx).setDepth(10);
    gem.setInteractive({ useHandCursor: true });
    gem.colorIdx = colorIdx; gem.gridRow = row; gem.gridCol = col;
    gem.setScale(0);
    gem.on('pointerdown', () => this.onGemClick(gem));
    gem.on('pointerover', () => { if (!this.isProcessing) this.tweens.add({ targets: gem, scaleX: 1.12, scaleY: 1.12, duration: 80, ease: 'Sine.Out' }); });
    gem.on('pointerout', () => { if (!this.isProcessing && gem !== this.selectedGem) this.tweens.add({ targets: gem, scaleX: 1, scaleY: 1, duration: 80 }); });
    return gem;
  }

  removeInitialMatches() {
    let safe = false;
    while (!safe) {
      safe = true;
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if (c < COLS-2 && this.grid[r][c].colorIdx === this.grid[r][c+1].colorIdx && this.grid[r][c].colorIdx === this.grid[r][c+2].colorIdx) {
          let nc; do { nc = Phaser.Math.Between(0, NUM_COLORS-1); } while (nc === this.grid[r][c].colorIdx);
          this.grid[r][c].colorIdx = nc; this.grid[r][c].setTexture('gem_'+nc); safe = false;
        }
        if (r < ROWS-2 && this.grid[r][c].colorIdx === this.grid[r+1][c].colorIdx && this.grid[r][c].colorIdx === this.grid[r+2][c].colorIdx) {
          let nc; do { nc = Phaser.Math.Between(0, NUM_COLORS-1); } while (nc === this.grid[r][c].colorIdx);
          this.grid[r][c].colorIdx = nc; this.grid[r][c].setTexture('gem_'+nc); safe = false;
        }
      }
    }
  }

  animateGridIn() {
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const gem = this.grid[r][c]; const ty = gem.y; gem.y = -50;
      this.tweens.add({ targets: gem, y: ty, scaleX: 1, scaleY: 1, duration: 500, delay: c * 60 + r * 30, ease: 'Bounce.Out' });
    }
  }

  resetHintTimer() {
    if (this.hintTimer) this.hintTimer.remove();
    this.clearHints();
    this.hintTimer = this.time.delayedCall(4000, () => this.showHint());
  }
  clearHints() {
    this.idleTweens.forEach(t => t.remove()); this.idleTweens = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (this.grid[r] && this.grid[r][c]) this.grid[r][c].setScale(1);
  }
  showHint() {
    if (this.isProcessing) return;
    const move = this.findValidMove();
    if (!move) return;
    const gem = this.grid[move.row][move.col];
    const t = this.tweens.add({ targets: gem, scaleX: 1.15, scaleY: 0.9, duration: 400, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.idleTweens.push(t);
  }
  findValidMove() {
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (c < COLS-1) { this.swapGrid(r,c,r,c+1); if (this.hasMatch()) { this.swapGrid(r,c,r,c+1); return {row:r,col:c}; } this.swapGrid(r,c,r,c+1); }
      if (r < ROWS-1) { this.swapGrid(r,c,r+1,c); if (this.hasMatch()) { this.swapGrid(r,c,r+1,c); return {row:r,col:c}; } this.swapGrid(r,c,r+1,c); }
    }
    return null;
  }
  swapGrid(r1,c1,r2,c2) { const t = this.grid[r1][c1]; this.grid[r1][c1] = this.grid[r2][c2]; this.grid[r2][c2] = t; }
  hasMatch() {
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS-2; c++) if (this.grid[r][c].colorIdx === this.grid[r][c+1].colorIdx && this.grid[r][c].colorIdx === this.grid[r][c+2].colorIdx) return true;
    for (let r = 0; r < ROWS-2; r++) for (let c = 0; c < COLS; c++) if (this.grid[r][c].colorIdx === this.grid[r+1][c].colorIdx && this.grid[r][c].colorIdx === this.grid[r+2][c].colorIdx) return true;
    return false;
  }

  onGemClick(gem) {
    if (this.isProcessing || this.movesLeft <= 0) return;
    this.resetHintTimer();
    if (!this.selectedGem) {
      this.selectedGem = gem;
      this.selectRing.setPosition(gem.x, gem.y).setVisible(true);
      this.tweens.add({ targets: gem, scaleX: 1.15, scaleY: 1.15, duration: 120, ease: 'Back.Out' });
    } else if (gem === this.selectedGem) {
      this.tweens.add({ targets: gem, scaleX: 1, scaleY: 1, duration: 100 });
      this.selectRing.setVisible(false); this.selectedGem = null;
    } else {
      const dr = Math.abs(gem.gridRow - this.selectedGem.gridRow);
      const dc = Math.abs(gem.gridCol - this.selectedGem.gridCol);
      if ((dr===1&&dc===0)||(dr===0&&dc===1)) { this.trySwap(this.selectedGem, gem); }
      else {
        this.tweens.add({ targets: this.selectedGem, scaleX: 1, scaleY: 1, duration: 100 });
        this.selectedGem = gem; this.selectRing.setPosition(gem.x, gem.y);
        this.tweens.add({ targets: gem, scaleX: 1.15, scaleY: 1.15, duration: 120, ease: 'Back.Out' });
      }
    }
  }

  trySwap(a, b) {
    this.isProcessing = true; this.selectRing.setVisible(false);
    this.tweens.add({ targets: a, scaleX: 1, scaleY: 1, duration: 80 });
    this.selectedGem = null; this.comboCount = 0;
    const rA=a.gridRow,cA=a.gridCol,rB=b.gridRow,cB=b.gridCol;
    const pA={x:a.x,y:a.y},pB={x:b.x,y:b.y};
    this.grid[rA][cA]=b; this.grid[rB][cB]=a;
    a.gridRow=rB; a.gridCol=cB; b.gridRow=rA; b.gridCol=cA;
    this.tweens.add({ targets: a, x: pB.x, y: pB.y, duration: 220, ease: 'Back.Out' });
    this.tweens.add({ targets: b, x: pA.x, y: pA.y, duration: 220, ease: 'Back.Out',
      onComplete: () => {
        const matches = this.findMatches();
        if (matches.length > 0) {
          this.movesLeft--; this.movesText.setText(''+this.movesLeft);
          if (this.movesLeft <= 5) this.movesText.setColor('#ff3333');
          this.processMatches(matches);
        } else {
          this.grid[rA][cA]=a; this.grid[rB][cB]=b;
          a.gridRow=rA; a.gridCol=cA; b.gridRow=rB; b.gridCol=cB;
          this.tweens.add({ targets: a, x: pA.x, y: pA.y, duration: 220, ease: 'Back.Out' });
          this.tweens.add({ targets: b, x: pB.x, y: pB.y, duration: 220, ease: 'Back.Out',
            onComplete: () => { this.isProcessing = false; this.resetHintTimer(); }
          });
        }
      }
    });
  }

  findMatches() {
    const m = new Set();
    for (let r=0;r<ROWS;r++) for (let c=0;c<COLS-2;c++) {
      const ci=this.grid[r][c].colorIdx;
      if (ci===this.grid[r][c+1].colorIdx&&ci===this.grid[r][c+2].colorIdx) {
        m.add(r+','+c); m.add(r+','+(c+1)); m.add(r+','+(c+2));
        if (c<COLS-3&&ci===this.grid[r][c+3].colorIdx) m.add(r+','+(c+3));
        if (c<COLS-4&&ci===this.grid[r][c+4].colorIdx) m.add(r+','+(c+4));
      }
    }
    for (let r=0;r<ROWS-2;r++) for (let c=0;c<COLS;c++) {
      const ci=this.grid[r][c].colorIdx;
      if (ci===this.grid[r+1][c].colorIdx&&ci===this.grid[r+2][c].colorIdx) {
        m.add(r+','+c); m.add((r+1)+','+c); m.add((r+2)+','+c);
        if (r<ROWS-3&&ci===this.grid[r+3][c].colorIdx) m.add((r+3)+','+c);
        if (r<ROWS-4&&ci===this.grid[r+4][c].colorIdx) m.add((r+4)+','+c);
      }
    }
    return [...m].map(s=>{const[r,c]=s.split(',').map(Number);return{row:r,col:c};});
  }

  processMatches(matches) {
    this.comboCount++;
    const mul = Math.min(this.comboCount, 5);
    this.score += matches.length * 50 * mul;
    this.scoreText.setText('' + this.score);
    this.updateProgressBar();
    if (this.comboCount > 1) {
      const names = ['','','SWEET!','TASTY!','DELICIOUS!','DIVINE!'];
      const cols = ['','','#ffcc33','#ff8833','#ff3366','#cc33ff'];
      this.comboText.setText(names[mul]+' x'+mul).setColor(cols[mul]).setAlpha(1).setScale(0);
      this.tweens.add({ targets: this.comboText, scaleX:1.2, scaleY:1.2, duration:300, ease:'Back.Out',
        onComplete:()=>{ this.tweens.add({ targets:this.comboText, scaleX:1,scaleY:1,alpha:0, duration:600, delay:400, ease:'Cubic.In' }); }
      });
    }
    if (matches.length >= 4) this.cameras.main.shake(200, 0.003 * matches.length);
    if (this.comboCount >= 3) {
      const se = this.add.particles(400, 400, 'star', { speed:{min:100,max:300}, scale:{start:0.8,end:0}, lifespan:800, quantity:12, emitting:false, tint:[0xffcc33,0xff33cc,0x33ccff], blendMode:'ADD', rotate:{min:0,max:360} });
      se.explode(12); this.time.delayedCall(1000, ()=>se.destroy());
    }
    matches.forEach(m => {
      const gem = this.grid[m.row][m.col]; if (!gem) return;
      const color = GEMS[gem.colorIdx];
      const popup = this.add.text(gem.x, gem.y, '+'+(50*mul), { fontSize:'18px', fontFamily:'Arial Black', color:'#ffffff', stroke:'#000000', strokeThickness:3 }).setOrigin(0.5).setDepth(80);
      this.tweens.add({ targets:popup, y:gem.y-70, alpha:0, scaleX:1.3, scaleY:1.3, duration:900, ease:'Cubic.Out', onComplete:()=>popup.destroy() });
      const em = this.add.particles(gem.x, gem.y, 'spark', { speed:{min:100,max:280}, scale:{start:1.8,end:0}, tint:[color.base,color.hi,color.glow,0xffffff], lifespan:600, quantity:12, emitting:false, blendMode:'ADD', rotate:{min:0,max:360} });
      em.explode(12); this.time.delayedCall(700, ()=>em.destroy());
      this.tweens.add({ targets:gem, scaleX:1.4, scaleY:1.4, duration:80, ease:'Sine.Out',
        onComplete:()=>{ this.tweens.add({ targets:gem, scaleX:0, scaleY:0, alpha:0, angle:180, duration:180, ease:'Back.In', onComplete:()=>gem.destroy() }); }
      });
      this.grid[m.row][m.col] = null;
    });
    this.time.delayedCall(350, () => this.cascadeGems());
  }

  cascadeGems() {
    let moved = false;
    for (let c=0;c<COLS;c++) for (let r=ROWS-1;r>=0;r--) {
      if (this.grid[r][c]===null) for (let a=r-1;a>=0;a--) {
        if (this.grid[a][c]!==null) {
          const gem=this.grid[a][c]; this.grid[r][c]=gem; this.grid[a][c]=null; gem.gridRow=r;
          const tp=this.getPos(r,c);
          this.tweens.add({ targets:gem, y:tp.y, duration:280+(r-a)*40, ease:'Bounce.Out', delay:(r-a)*30 });
          moved=true; break;
        }
      }
    }
    for (let c=0;c<COLS;c++) {
      let empty=0; for (let r=0;r<ROWS;r++) if (this.grid[r][c]===null) empty++;
      let fi=0;
      for (let r=0;r<ROWS;r++) if (this.grid[r][c]===null) {
        const ci=Phaser.Math.Between(0,NUM_COLORS-1);
        const gem=this.createGem(r,c,ci); const ty=gem.y;
        gem.y=OY-(empty-fi)*CELL-40; gem.setScale(1); this.grid[r][c]=gem;
        this.tweens.add({ targets:gem, y:ty, duration:380+fi*50, ease:'Bounce.Out', delay:150+fi*40 });
        fi++; moved=true;
      }
    }
    this.time.delayedCall(moved?650:80, ()=>{
      const nm=this.findMatches();
      if (nm.length>0) { this.processMatches(nm); }
      else {
        this.isProcessing=false; this.resetHintTimer();
        if (!this.findValidMove()) { this.shuffleBoard(); return; }
        if (this.score>=this.targetScore) this.showEndScreen('LEVEL COMPLETE!','#33ffcc',true);
        else if (this.movesLeft<=0) this.showEndScreen('OUT OF MOVES','#ff3366',false);
      }
    });
  }

  shuffleBoard() {
    this.isProcessing=true;
    const st=this.add.text(400,400,'NO MOVES!\nSHUFFLING...',{fontSize:'28px',fontFamily:'Arial Black',color:'#ffcc33',stroke:'#000000',strokeThickness:4,align:'center'}).setOrigin(0.5).setDepth(100).setAlpha(0);
    this.tweens.add({ targets:st, alpha:1, duration:300, onComplete:()=>{
      this.time.delayedCall(800,()=>{ st.destroy();
        for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
          const ci=Phaser.Math.Between(0,NUM_COLORS-1);
          this.grid[r][c].colorIdx=ci; this.grid[r][c].setTexture('gem_'+ci);
        }
        this.removeInitialMatches();
        for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
          this.grid[r][c].setScale(0);
          this.tweens.add({ targets:this.grid[r][c], scaleX:1, scaleY:1, duration:300, delay:(r+c)*20, ease:'Back.Out' });
        }
        this.time.delayedCall(1200,()=>{ this.isProcessing=false; this.resetHintTimer(); });
      });
    }});
  }

  showEndScreen(text, color, isWin) {
    this.isProcessing=true;
    const ov=this.add.graphics().setDepth(90);
    ov.fillStyle(0x000000,0.7); ov.fillRect(0,0,800,750);
    ov.setAlpha(0);
    this.tweens.add({ targets:ov, alpha:1, duration:500 });
    this.time.delayedCall(300,()=>{
      const p=this.add.graphics().setDepth(91);
      p.fillStyle(0x1a0a3e,1); p.fillRoundedRect(150,200,500,300,20);
      p.lineStyle(3,isWin?0x33ffcc:0xff3366,0.8); p.strokeRoundedRect(150,200,500,300,20);
      const t=this.add.text(400,270,text,{fontSize:'40px',fontFamily:'Arial Black',color:color,stroke:'#000000',strokeThickness:5}).setOrigin(0.5).setDepth(92).setScale(0);
      this.tweens.add({ targets:t, scaleX:1, scaleY:1, duration:500, ease:'Back.Out' });
      const fs=this.add.text(400,340,'Final Score: '+this.score,{fontSize:'24px',fontFamily:'Arial',color:'#ffffff'}).setOrigin(0.5).setDepth(92).setAlpha(0);
      this.tweens.add({ targets:fs, alpha:1, duration:400, delay:300 });
      const bbg=this.add.graphics().setDepth(92);
      bbg.fillStyle(isWin?0x22aa66:0xaa2244,1); bbg.fillRoundedRect(300,400,200,55,12);
      const btn=this.add.text(400,427,'PLAY AGAIN',{fontSize:'20px',fontFamily:'Arial Black',color:'#ffffff'}).setOrigin(0.5).setDepth(92).setAlpha(0).setInteractive({useHandCursor:true});
      this.tweens.add({ targets:btn, alpha:1, duration:400, delay:600 });
      btn.on('pointerdown',()=>this.scene.restart());
      if (isWin) {
        this.add.particles(400,200,'star',{speed:{min:50,max:200},scale:{start:0.6,end:0},lifespan:2000,frequency:100,blendMode:'ADD',tint:[0xffcc33,0x33ffcc,0xff33cc,0x3366ff],angle:{min:250,max:290},gravityY:50}).setDepth(93);
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 750,
  backgroundColor: '#0d0521',
  parent: document.body,
  scene: [BootScene, GameScene],
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
};
const game = new Phaser.Game(config);
