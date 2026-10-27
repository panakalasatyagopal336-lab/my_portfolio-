/**
 * SUPER GOPAL: LEGENDARY ADVENTURE
 * Master Game Engine: Camera, Physics, Particle Engine, Collision,
 * Entity Lifecycles, Boss Integration, HUD and State Machine.
 */

// Canvas roundRect Polyfill for cross-browser safety
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
    const r = typeof radii === 'number' ? radii : 4;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

class SuperGopalGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Virtual Internal Resolution
    this.viewWidth = 1066;
    this.viewHeight = 600;

    // Game State: 'MENU', 'PLAYING', 'PAUSED', 'LEVEL_CLEAR', 'GAME_OVER'
    this.state = 'MENU';
    this.gameMode = 'story'; // 'story' or 'endless'
    this.currentLevelIdx = 0;
    this.levels = LevelManager.getLevels();

    // Stats
    this.score = 0;
    this.coins = 0;
    this.highScore = parseInt(localStorage.getItem('super_gopal_highscore') || '0', 10);
    this.combo = 1;
    this.comboTimer = 0;
    this.distance = 0;

    // Entities
    this.gopal = new Gopal(80, 380);
    this.platforms = [];
    this.hazards = [];
    this.items = [];
    this.enemies = [];
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.boss = null;
    this.goal = null;

    // Camera & Screen Shake
    this.camera = { x: 0, y: 0 };
    this.shakeIntensity = 0;

    // Input State
    this.input = {
      left: false,
      right: false,
      jump: false,
      jumpPressed: false,
      dash: false,
      dashPressed: false,
      attack: false,
      attackPressed: false
    };

    // Endless Generator
    this.endlessGenX = 0;

    // Setup Systems
    this.initCanvasResize();
    this.bindInputs();
    this.bindUIButtons();
    this.loadSkinPreference();

    // Pre-load Level 1 in background for animated menu backdrop
    if (this.levels && this.levels.length > 0) {
      this.loadLevel(this.levels[0]);
    }
    this.state = 'MENU';

    // Start Loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  loadSkinPreference() {
    const savedSkin = localStorage.getItem('super_gopal_skin') || 'classic';
    this.gopal.setSkin(savedSkin);
    this.updateWardrobeUI(savedSkin);
  }

  initCanvasResize() {
    const resize = () => {
      const container = document.getElementById('canvas-container');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      this.canvas.width = this.viewWidth;
      this.canvas.height = this.viewHeight;
    };
    window.addEventListener('resize', resize);
    resize();
  }

  // Bind Keyboard & Touch Controls
  bindInputs() {
    window.addEventListener('keydown', (e) => {
      // Audio unlock on user interaction
      window.audioMgr.init();

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        this.input.left = true;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        this.input.right = true;
      }
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        if (!this.input.jump) this.input.jumpPressed = true;
        this.input.jump = true;
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS' || e.code === 'ShiftLeft' || e.code === 'KeyK') {
        if (!this.input.dash) this.input.dashPressed = true;
        this.input.dash = true;
      }
      if (e.code === 'KeyX' || e.code === 'KeyJ' || e.code === 'Enter') {
        if (!this.input.attack) this.input.attackPressed = true;
        this.input.attack = true;
      }
      if (e.code === 'KeyP' || e.code === 'Escape') {
        this.togglePause();
      }
      if (e.code === 'KeyM') {
        this.toggleMute();
      }
      if (e.code === 'KeyR' && (this.state === 'GAME_OVER' || this.state === 'LEVEL_CLEAR')) {
        this.restartCurrentLevel();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.input.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.input.right = false;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') this.input.jump = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS' || e.code === 'ShiftLeft' || e.code === 'KeyK') this.input.dash = false;
      if (e.code === 'KeyX' || e.code === 'KeyJ' || e.code === 'Enter') this.input.attack = false;
    });

    // Touch Virtual Buttons
    const setupTouchBtn = (id, onDown, onUp) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      const start = (ev) => {
        ev.preventDefault();
        window.audioMgr.init();
        btn.classList.add('pressed');
        onDown();
      };
      const end = (ev) => {
        ev.preventDefault();
        btn.classList.remove('pressed');
        onUp();
      };
      btn.addEventListener('touchstart', start, { passive: false });
      btn.addEventListener('touchend', end, { passive: false });
      btn.addEventListener('mousedown', start);
      btn.addEventListener('mouseup', end);
      btn.addEventListener('mouseleave', end);
    };

    setupTouchBtn('btn-v-left', () => { this.input.left = true; }, () => { this.input.left = false; });
    setupTouchBtn('btn-v-right', () => { this.input.right = true; }, () => { this.input.right = false; });
    setupTouchBtn('btn-v-jump', () => { this.input.jump = true; this.input.jumpPressed = true; }, () => { this.input.jump = false; });
    setupTouchBtn('btn-v-dash', () => { this.input.dash = true; this.input.dashPressed = true; }, () => { this.input.dash = false; });
    setupTouchBtn('btn-v-attack', () => { this.input.attack = true; this.input.attackPressed = true; }, () => { this.input.attack = false; });
  }

  bindUIButtons() {
    // Menu Play Buttons
    document.getElementById('btn-play-story')?.addEventListener('click', () => {
      window.audioMgr.playButtonClick();
      this.startStoryMode(0);
    });

    document.getElementById('btn-play-endless')?.addEventListener('click', () => {
      window.audioMgr.playButtonClick();
      this.startEndlessMode();
    });

    document.getElementById('btn-open-wardrobe')?.addEventListener('click', () => {
      window.audioMgr.playButtonClick();
      this.openModal('wardrobe-modal');
    });

    document.getElementById('btn-open-levels')?.addEventListener('click', () => {
      window.audioMgr.playButtonClick();
      this.openModal('level-select-modal');
    });

    document.getElementById('btn-open-help')?.addEventListener('click', () => {
      window.audioMgr.playButtonClick();
      this.openModal('help-modal');
    });

    document.getElementById('btn-hud-help')?.addEventListener('click', () => {
      window.audioMgr.playButtonClick();
      this.togglePause();
      this.openModal('help-modal');
    });

    document.getElementById('btn-hud-pause')?.addEventListener('click', () => {
      window.audioMgr.playButtonClick();
      this.togglePause();
    });

    document.getElementById('btn-hud-sound')?.addEventListener('click', () => {
      this.toggleMute();
    });

    // Close Modal Buttons
    document.querySelectorAll('.close-modal-trigger').forEach((btn) => {
      btn.addEventListener('click', () => {
        window.audioMgr.playButtonClick();
        this.closeAllModals();
      });
    });

    // Level Select Cards
    document.querySelectorAll('.level-select-card').forEach((card) => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.levelIdx, 10);
        window.audioMgr.playButtonClick();
        this.startStoryMode(idx);
      });
    });

    // Skin Selection Cards
    document.querySelectorAll('.skin-card').forEach((card) => {
      card.addEventListener('click', () => {
        const skinName = card.dataset.skin;
        this.gopal.setSkin(skinName);
        localStorage.setItem('super_gopal_skin', skinName);
        this.updateWardrobeUI(skinName);
        window.audioMgr.playPowerup();
        this.showToast(`Equipped ${skinName.toUpperCase()} GOPAL!`);
      });
    });

    // Resume / Retry / Next / Quit Buttons
    document.getElementById('btn-resume')?.addEventListener('click', () => {
      window.audioMgr.playButtonClick();
      this.togglePause();
    });

    document.getElementById('btn-pause-menu')?.addEventListener('click', () => {
      window.audioMgr.playButtonClick();
      this.showMenu();
    });

    document.getElementById('btn-gameover-restart')?.addEventListener('click', () => {
      window.audioMgr.playButtonClick();
      this.restartCurrentLevel();
    });

    document.getElementById('btn-gameover-menu')?.addEventListener('click', () => {
      window.audioMgr.playButtonClick();
      this.showMenu();
    });

    document.getElementById('btn-clear-next')?.addEventListener('click', () => {
      window.audioMgr.playButtonClick();
      if (this.currentLevelIdx < this.levels.length - 1) {
        this.startStoryMode(this.currentLevelIdx + 1);
      } else {
        this.startEndlessMode();
      }
    });

    document.getElementById('btn-clear-menu')?.addEventListener('click', () => {
      window.audioMgr.playButtonClick();
      this.showMenu();
    });
  }

  updateWardrobeUI(selectedSkin) {
    document.querySelectorAll('.skin-card').forEach((c) => {
      c.classList.toggle('selected', c.dataset.skin === selectedSkin);
    });
  }

  openModal(modalId) {
    this.closeAllModals();
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach((m) => m.classList.add('hidden'));
  }

  showToast(msg) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.openModal('pause-modal');
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.closeAllModals();
    }
  }

  toggleMute() {
    const isMuted = window.audioMgr.toggleMute();
    const soundBtn = document.getElementById('btn-hud-sound');
    if (soundBtn) {
      soundBtn.textContent = isMuted ? '🔇' : '🔊';
    }
    this.showToast(isMuted ? 'Audio Muted' : 'Audio Enabled');
  }

  showMenu() {
    this.state = 'MENU';
    this.closeAllModals();
    document.getElementById('hud-overlay')?.classList.add('hidden');
    document.getElementById('main-menu-overlay')?.classList.remove('hidden');
    window.audioMgr.playBGM('menu');
  }

  startStoryMode(levelIdx = 0) {
    this.gameMode = 'story';
    this.currentLevelIdx = Math.max(0, Math.min(levelIdx, this.levels.length - 1));
    this.loadLevel(this.levels[this.currentLevelIdx]);
    this.state = 'PLAYING';

    this.closeAllModals();
    document.getElementById('main-menu-overlay')?.classList.add('hidden');
    document.getElementById('hud-overlay')?.classList.remove('hidden');

    const track = this.currentLevelIdx === 0 ? 'world1' : this.currentLevelIdx === 1 ? 'world2' : 'world3';
    window.audioMgr.playBGM(track);
  }

  startEndlessMode() {
    this.gameMode = 'endless';
    this.state = 'PLAYING';
    this.score = 0;
    this.coins = 0;
    this.distance = 0;
    this.combo = 1;

    this.closeAllModals();
    document.getElementById('main-menu-overlay')?.classList.add('hidden');
    document.getElementById('hud-overlay')?.classList.remove('hidden');

    this.setupEndlessTrack();
    window.audioMgr.playBGM('endless');
  }

  restartCurrentLevel() {
    if (this.gameMode === 'story') {
      this.startStoryMode(this.currentLevelIdx);
    } else {
      this.startEndlessMode();
    }
  }

  loadLevel(levelData) {
    this.currentLevelData = levelData;
    this.platforms = JSON.parse(JSON.stringify(levelData.platforms));
    this.hazards = JSON.parse(JSON.stringify(levelData.hazards || []));
    this.items = JSON.parse(JSON.stringify(levelData.items || []));
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.goal = levelData.goal ? { ...levelData.goal } : null;

    // Reset Gopal
    this.gopal.reset(levelData.playerStart.x, levelData.playerStart.y);

    // Instantiate Enemies
    this.enemies = (levelData.enemies || []).map((e) => {
      return {
        type: e.type,
        x: e.x,
        y: e.y,
        startX: e.x,
        startY: e.y,
        width: e.type === 'slime' ? 34 : e.type === 'drone' ? 36 : 40,
        height: e.type === 'slime' ? 26 : e.type === 'drone' ? 32 : 30,
        vx: e.speed || 1.5,
        vy: 0,
        range: e.range || 150,
        hp: e.type === 'drone' ? 2 : 1,
        facing: -1,
        timer: Math.random() * 10
      };
    });

    // Boss setup if applicable
    if (levelData.isBossLevel && levelData.boss) {
      this.boss = new Boss(levelData.boss);
    } else {
      this.boss = null;
    }

    // Camera initial
    this.camera.x = 0;
    this.camera.y = 0;

    // Update HUD
    document.getElementById('hud-stage-name').textContent = levelData.name.split(':')[0].toUpperCase();
    this.updateHUD();
  }

  setupEndlessTrack() {
    this.platforms = [
      { x: 0, y: 500, width: 900, height: 100 }
    ];
    this.hazards = [];
    this.items = [
      { x: 260, y: 440, type: 'coin' },
      { x: 320, y: 440, type: 'coin' },
      { x: 380, y: 440, type: 'coin' }
    ];
    this.enemies = [];
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.boss = null;
    this.goal = null;

    this.endlessGenX = 900;
    this.gopal.reset(100, 380);
    this.currentLevelData = {
      theme: 'endless',
      bgColors: ['#0f172a', '#1e293b', '#0ea5e9'],
      groundColor: '#1e293b',
      groundBorder: '#38bdf8',
      platformColor: '#0f172a',
      width: 9999999,
      height: 600
    };

    document.getElementById('hud-stage-name').textContent = 'ENDLESS RUSH';
    this.updateHUD();
  }

  generateNextEndlessChunk() {
    const chunkWidth = Math.floor(Math.random() * 300) + 400;
    const gap = Math.random() < 0.4 ? Math.floor(Math.random() * 80) + 70 : 0;
    const startX = this.endlessGenX + gap;
    const groundY = 500;

    // Ground platform
    this.platforms.push({
      x: startX,
      y: groundY,
      width: chunkWidth,
      height: 100
    });

    // Floating platforms
    if (Math.random() < 0.7) {
      const platY = groundY - Math.floor(Math.random() * 90 + 90);
      const platW = Math.floor(Math.random() * 80 + 100);
      this.platforms.push({
        x: startX + Math.floor(Math.random() * (chunkWidth - platW)),
        y: platY,
        width: platW,
        height: 22
      });

      // Power-up or Gems on high platforms
      const pRnd = Math.random();
      if (pRnd < 0.15) {
        this.items.push({ x: startX + 50, y: platY - 40, type: 'laddoo' });
      } else if (pRnd < 0.35) {
        this.items.push({ x: startX + 50, y: platY - 40, type: 'samosa' });
      } else if (pRnd < 0.6) {
        this.items.push({ x: startX + 50, y: platY - 40, type: 'gem' });
      }
    }

    // Coins
    const coinCount = Math.floor(Math.random() * 5) + 3;
    for (let c = 0; c < coinCount; c++) {
      this.items.push({
        x: startX + 60 + c * 45,
        y: groundY - 50 - Math.sin((c / coinCount) * Math.PI) * 50,
        type: 'coin'
      });
    }

    // Enemies & Hazards
    if (Math.random() < 0.6) {
      const eType = Math.random() < 0.6 ? 'slime' : 'drone';
      this.enemies.push({
        type: eType,
        x: startX + chunkWidth / 2,
        y: eType === 'drone' ? groundY - 140 : groundY - 30,
        startX: startX + chunkWidth / 2,
        startY: eType === 'drone' ? groundY - 140 : groundY - 30,
        width: 34,
        height: 26,
        vx: 2.0,
        vy: 0,
        range: 120,
        hp: 1,
        facing: -1,
        timer: 0
      });
    }

    this.endlessGenX = startX + chunkWidth;

    // Prune old platforms behind camera
    const pruneX = this.camera.x - 400;
    this.platforms = this.platforms.filter((p) => p.x + p.width > pruneX);
    this.items = this.items.filter((i) => i.x > pruneX);
    this.enemies = this.enemies.filter((e) => e.x > pruneX);
  }

  // Combat Spawners & Juice
  spawnProjectile(x, y, vx, vy, skin = 'classic') {
    let color = '#fbbf24';
    if (skin === 'cyber') color = '#38bdf8';
    if (skin === 'golden') color = '#fef08a';
    if (skin === 'royal') color = '#34d399';
    if (skin === 'cosmic') color = '#c084fc';

    this.projectiles.push({
      x,
      y,
      vx,
      vy,
      radius: 8,
      color,
      life: 60
    });
  }

  spawnEnemyProjectile(x, y, vx, vy) {
    this.enemyProjectiles.push({
      x,
      y,
      vx,
      vy,
      radius: 7,
      color: '#ef4444',
      life: 90
    });
  }

  spawnShockwave(x, y) {
    this.hazards.push({
      x: x - 40,
      y: y - 10,
      width: 80,
      height: 20,
      vx: 4.5,
      type: 'shockwave',
      life: 50
    });
    this.hazards.push({
      x: x - 40,
      y: y - 10,
      width: 80,
      height: 20,
      vx: -4.5,
      type: 'shockwave',
      life: 50
    });
  }

  spawnParticle(x, y, vx, vy, color, maxLife = 20, size = 4) {
    this.particles.push({
      x,
      y,
      vx,
      vy,
      color,
      life: maxLife,
      maxLife,
      size
    });
  }

  spawnPuff(x, y, color = '#ffffff', count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 3 + 1;
      this.spawnParticle(
        x,
        y,
        Math.cos(angle) * spd,
        Math.sin(angle) * spd - 1,
        color,
        Math.floor(Math.random() * 15 + 15),
        Math.random() * 4 + 2
      );
    }
  }

  showFloatingText(text, x, y, color = '#fbbf24') {
    this.floatingTexts.push({
      text,
      x,
      y,
      color,
      vy: -1.6,
      opacity: 1,
      life: 45
    });
  }

  triggerScreenShake(intensity = 10) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  onPlayerDied() {
    this.state = 'GAME_OVER';
    document.getElementById('end-score-val').textContent = this.score.toLocaleString();
    document.getElementById('end-coins-val').textContent = this.coins.toLocaleString();
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('super_gopal_highscore', this.highScore);
    }
    document.getElementById('end-best-val').textContent = this.highScore.toLocaleString();
    this.openModal('game-over-modal');
  }

  onStageCleared() {
    this.state = 'LEVEL_CLEAR';
    window.audioMgr.playStageClear();
    this.score += 2500;
    this.updateHUD();

    document.getElementById('clear-stage-name').textContent = this.currentLevelData.name;
    document.getElementById('clear-score-val').textContent = this.score.toLocaleString();
    document.getElementById('clear-coins-val').textContent = this.coins.toLocaleString();

    // Check next level availability
    const nextBtn = document.getElementById('btn-clear-next');
    if (this.currentLevelIdx >= this.levels.length - 1) {
      nextBtn.textContent = 'ENTER ENDLESS RUSH';
    } else {
      nextBtn.textContent = 'NEXT ADVENTURE';
    }

    this.openModal('level-clear-modal');
  }

  onBossDefeated() {
    setTimeout(() => {
      this.onStageCleared();
    }, 2400);
  }

  // Master Game Loop
  loop(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    if (this.state === 'PLAYING') {
      this.update(dt);
    }

    this.draw();

    // Reset single-frame input triggers
    this.input.jumpPressed = false;
    this.input.dashPressed = false;
    this.input.attackPressed = false;

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    // 1. Update Player Input & Physics
    this.gopal.handleInput(this.input, this);
    this.gopal.update(dt, this);

    // 2. Collision with Platforms
    this.resolvePlatformCollisions();

    // 3. Update Moving Platforms
    for (let p of this.platforms) {
      if (p.moving) {
        if (!p.timer) p.timer = 0;
        p.timer += dt * p.speed;
        if (p.axis === 'y') {
          p.y = p.y + Math.sin(p.timer) * 1.5;
        } else {
          p.x = p.x + Math.sin(p.timer) * 1.8;
        }
      }
    }

    // 4. Update Hazards & Chasms
    for (let h of this.hazards) {
      if (h.type === 'shockwave') {
        h.x += h.vx;
        h.life--;
        // Hurt player
        if (this.checkAABB(this.gopal, h)) {
          this.gopal.takeDamage(1, this);
        }
      } else if (h.type === 'chasm' || h.type === 'lava') {
        if (this.gopal.y > 560) {
          this.gopal.takeDamage(3, this); // Instant pit death
        }
      } else {
        if (this.checkAABB(this.gopal, h)) {
          this.gopal.takeDamage(1, this);
        }
      }
    }
    this.hazards = this.hazards.filter((h) => !h.life || h.life > 0);

    // 5. Update Collectibles & Coin Magnet
    for (let item of this.items) {
      if (item.collected) continue;

      // Magnet pull effect
      if (this.gopal.powerups.magnet > 0 && (item.type === 'coin' || item.type === 'gem')) {
        const dx = (this.gopal.x + this.gopal.width / 2) - item.x;
        const dy = (this.gopal.y + this.gopal.height / 2) - item.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 260) {
          item.x += (dx / dist) * 7.5;
          item.y += (dy / dist) * 7.5;
        }
      }

      // Check Gopal pickup
      const itemBox = { x: item.x - 14, y: item.y - 14, width: 28, height: 28 };
      if (this.checkAABB(this.gopal, itemBox)) {
        item.collected = true;
        this.collectItem(item);
      }
    }
    this.items = this.items.filter((i) => !i.collected);

    // 6. Update Projectiles
    for (let p of this.projectiles) {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;

      // Projectile particle trail
      this.spawnParticle(p.x, p.y, -p.vx * 0.1, -p.vy * 0.1, p.color, 12, 3);

      // Check hit Boss
      if (this.boss && this.boss.hp > 0 && this.checkPointInRect(p.x, p.y, this.boss)) {
        this.boss.takeDamage(1, this);
        p.life = 0;
      }

      // Check hit Enemies
      for (let e of this.enemies) {
        if (e.hp > 0 && this.checkPointInRect(p.x, p.y, e)) {
          e.hp--;
          p.life = 0;
          window.audioMgr.playEnemyHit();
          this.spawnPuff(e.x + e.width / 2, e.y + e.height / 2, '#38bdf8', 15);
          if (e.hp <= 0) {
            this.defeatEnemy(e);
          }
        }
      }
    }
    this.projectiles = this.projectiles.filter((p) => p.life > 0);

    // 7. Update Enemy Projectiles
    for (let ep of this.enemyProjectiles) {
      ep.x += ep.vx;
      ep.y += ep.vy;
      ep.life--;
      this.spawnParticle(ep.x, ep.y, 0, 0, '#ef4444', 10, 2);

      if (this.checkPointInRect(ep.x, ep.y, this.gopal)) {
        ep.life = 0;
        this.gopal.takeDamage(1, this);
      }
    }
    this.enemyProjectiles = this.enemyProjectiles.filter((ep) => ep.life > 0);

    // 8. Update Enemies
    for (let e of this.enemies) {
      if (e.hp <= 0) continue;
      e.timer += dt;

      // Enemy AI Patrol
      e.x += e.vx;
      if (e.x > e.startX + e.range) {
        e.vx = -Math.abs(e.vx);
        e.facing = -1;
      } else if (e.x < e.startX - e.range) {
        e.vx = Math.abs(e.vx);
        e.facing = 1;
      }

      // Drone float bobbing
      if (e.type === 'drone') {
        e.y = e.startY + Math.sin(e.timer * 4) * 16;
      }

      // Check collision with Gopal
      if (this.checkAABB(this.gopal, e)) {
        // Invincible Gopal smashes through!
        if (this.gopal.powerups.laddoo > 0) {
          this.defeatEnemy(e);
        } else if (this.gopal.vy > 1 && this.gopal.y + this.gopal.height - 12 < e.y + 12) {
          // Stomp enemy from above!
          this.gopal.vy = -10; // Bounce up!
          window.audioMgr.playEnemyHit();
          this.spawnPuff(e.x + e.width / 2, e.y, '#fbbf24', 18);
          this.defeatEnemy(e);
        } else {
          // Gopal takes damage
          this.gopal.takeDamage(1, this);
        }
      }
    }
    this.enemies = this.enemies.filter((e) => e.hp > 0);

    // 9. Update Boss if present
    if (this.boss) {
      this.boss.update(dt, this.gopal, this);

      // Check collision with Gopal
      if (this.boss.hp > 0 && this.checkAABB(this.gopal, this.boss)) {
        this.gopal.takeDamage(1, this);
      }
    }

    // 10. Check Goal / Portal reach
    if (this.goal && this.checkAABB(this.gopal, this.goal)) {
      this.onStageCleared();
    }

    // 11. Endless generator update
    if (this.gameMode === 'endless') {
      this.distance = Math.floor(this.gopal.x / 10);
      if (this.gopal.x + 1200 > this.endlessGenX) {
        this.generateNextEndlessChunk();
      }
    }

    // 12. Update Particles & Floating Text
    for (let part of this.particles) {
      part.x += part.vx;
      part.y += part.vy;
      part.life--;
    }
    this.particles = this.particles.filter((p) => p.life > 0);

    for (let ft of this.floatingTexts) {
      ft.y += ft.vy;
      ft.life--;
      ft.opacity = ft.life / 45;
    }
    this.floatingTexts = this.floatingTexts.filter((ft) => ft.life > 0);

    // Screen Shake decay
    if (this.shakeIntensity > 0) {
      this.shakeIntensity *= 0.88;
      if (this.shakeIntensity < 0.3) this.shakeIntensity = 0;
    }

    // 13. Camera Follow
    const targetCamX = this.gopal.x - this.viewWidth * 0.38;
    // Lock camera in Boss arena
    if (this.boss && this.gopal.x > this.currentLevelData.bossArenaX) {
      this.camera.x += (this.currentLevelData.bossArenaX - this.camera.x) * 0.08;
    } else {
      const maxCamX = Math.max(0, this.currentLevelData.width - this.viewWidth);
      const clampedX = Math.max(0, Math.min(maxCamX, targetCamX));
      this.camera.x += (clampedX - this.camera.x) * 0.12;
    }

    // Update HUD display
    this.updateHUD();
  }

  // AABB Bounding Box Collision Detection
  checkAABB(r1, r2) {
    if (!r1 || !r2) return false;
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  }

  // Point in Rectangle Collision Detection
  checkPointInRect(px, py, rect) {
    if (!rect) return false;
    return (
      px >= rect.x &&
      px <= rect.x + rect.width &&
      py >= rect.y &&
      py <= rect.y + rect.height
    );
  }

  resolvePlatformCollisions() {
    this.gopal.isGrounded = false;

    // Projected next position
    const nextX = this.gopal.x + this.gopal.vx;
    const nextY = this.gopal.y + this.gopal.vy;

    // Check each platform
    for (let p of this.platforms) {
      // Check horizontal collision
      if (
        nextX < p.x + p.width &&
        nextX + this.gopal.width > p.x &&
        this.gopal.y < p.y + p.height &&
        this.gopal.y + this.gopal.height > p.y
      ) {
        if (this.gopal.vx > 0) {
          this.gopal.x = p.x - this.gopal.width;
        } else if (this.gopal.vx < 0) {
          this.gopal.x = p.x + p.width;
        }
        this.gopal.vx = 0;
      }
    }

    this.gopal.x += this.gopal.vx;

    // Check vertical collision
    for (let p of this.platforms) {
      if (
        this.gopal.x < p.x + p.width &&
        this.gopal.x + this.gopal.width > p.x &&
        nextY < p.y + p.height &&
        nextY + this.gopal.height > p.y
      ) {
        // Landing on top of platform
        if (this.gopal.vy >= 0 && this.gopal.y + this.gopal.height <= p.y + 16) {
          this.gopal.y = p.y - this.gopal.height;
          this.gopal.vy = 0;
          this.gopal.isGrounded = true;
          this.gopal.isJumping = false;
          this.gopal.canDoubleJump = true;

          // Ground pound shockwave
          if (this.gopal.isGroundPounding) {
            this.gopal.isGroundPounding = false;
            window.audioMgr.playEnemyHit();
            this.triggerScreenShake(14);
            this.spawnPuff(this.gopal.x + this.gopal.width / 2, this.gopal.y + this.gopal.height, '#fbbf24', 22);
            this.spawnShockwave(this.gopal.x + this.gopal.width / 2, this.gopal.y + this.gopal.height);
          }
        } else if (this.gopal.vy < 0) {
          // Head hit bottom of platform
          this.gopal.y = p.y + p.height;
          this.gopal.vy = 0;
        }
      }
    }

    if (!this.gopal.isGrounded) {
      this.gopal.y += this.gopal.vy;
    }
  }

  collectItem(item) {
    if (item.type === 'coin') {
      this.coins++;
      this.score += 100 * this.combo;
      window.audioMgr.playCoin(this.coins % 8);
      this.spawnPuff(item.x, item.y, '#fbbf24', 8);
      this.showFloatingText(`+${100 * this.combo}`, item.x, item.y - 10, '#fbbf24');
    } else if (item.type === 'gem') {
      this.coins += 5;
      this.score += 500 * this.combo;
      window.audioMgr.playGem();
      this.spawnPuff(item.x, item.y, '#34d399', 15);
      this.showFloatingText(`+${500 * this.combo} GEM!`, item.x, item.y - 15, '#34d399');
    } else if (item.type === 'laddoo') { // Golden Laddoo Invincibility
      this.gopal.powerups.laddoo = 10; // 10 seconds!
      this.score += 1000;
      window.audioMgr.playPowerup();
      this.showFloatingText('GOLDEN LADDOO! INVINCIBLE!', this.gopal.x, this.gopal.y - 30, '#fbbf24');
      this.showToast('🟡 GOLDEN LADDOO ACTIVATED: Super Speed & Invincibility!');
    } else if (item.type === 'samosa') { // Super Samosa HP Boost
      this.gopal.hp = Math.min(this.gopal.maxHp, this.gopal.hp + 2);
      this.gopal.powerups.samosa = 12;
      this.score += 500;
      window.audioMgr.playPowerup();
      this.showFloatingText('SUPER SAMOSA! +HP & HIGH JUMP!', this.gopal.x, this.gopal.y - 30, '#f97316');
      this.showToast('🥟 SUPER SAMOSA: HP Restored & High Jump Boost!');
    } else if (item.type === 'magnet') {
      this.gopal.powerups.magnet = 15;
      window.audioMgr.playPowerup();
      this.showFloatingText('MAGNETIC CHAI! COIN PULL!', this.gopal.x, this.gopal.y - 30, '#38bdf8');
      this.showToast('🧲 COIN MAGNET ACTIVATED!');
    } else if (item.type === 'shield') {
      this.gopal.shield = Math.min(2, this.gopal.shield + 1);
      window.audioMgr.playPowerup();
      this.showFloatingText('AEGIS SHIELD EQUIPPED!', this.gopal.x, this.gopal.y - 30, '#38bdf8');
    } else if (item.type === 'rapidBlaster') {
      this.gopal.powerups.rapidBlaster = 14;
      window.audioMgr.playPowerup();
      this.showFloatingText('TRIPLE PLASMA BLASTER!', this.gopal.x, this.gopal.y - 30, '#c084fc');
      this.showToast('⚡ TRIPLE BLASTER ACTIVATED!');
    }
  }

  defeatEnemy(enemy) {
    this.score += 250 * this.combo;
    this.combo++;
    this.comboTimer = 180;
    this.showFloatingText(`+${250 * this.combo} (x${this.combo})`, enemy.x, enemy.y - 15, '#f59e0b');
    this.spawnPuff(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#ef4444', 20);
  }

  updateHUD() {
    // Hearts display
    const heartsContainer = document.getElementById('hud-hearts');
    if (heartsContainer) {
      let heartsHtml = '';
      for (let i = 0; i < this.gopal.maxHp; i++) {
        heartsHtml += i < this.gopal.hp ? '♥' : '♡';
      }
      if (this.gopal.shield > 0) {
        heartsHtml += ' 🛡️';
      }
      heartsContainer.innerHTML = heartsHtml;
    }

    // Coins & Score
    const coinsDisplay = document.getElementById('hud-coins');
    if (coinsDisplay) coinsDisplay.textContent = this.coins;

    const scoreDisplay = document.getElementById('hud-score');
    if (scoreDisplay) scoreDisplay.textContent = this.score;

    // Level Progress Bar
    const progressFill = document.getElementById('hud-progress-bar');
    if (progressFill && this.currentLevelData) {
      let pct = 0;
      if (this.gameMode === 'story' && this.currentLevelData.width) {
        pct = Math.min(100, Math.max(0, (this.gopal.x / (this.currentLevelData.width - 200)) * 100));
      } else {
        pct = (this.distance % 1000) / 10;
      }
      progressFill.style.width = `${pct}%`;
    }

    // Active Powerups Badges
    const dock = document.getElementById('hud-powerup-dock');
    if (dock) {
      let html = '';
      if (this.gopal.powerups.laddoo > 0) {
        html += `<div class="powerup-pill">🟡 LADDOO: ${Math.ceil(this.gopal.powerups.laddoo)}s</div>`;
      }
      if (this.gopal.powerups.samosa > 0) {
        html += `<div class="powerup-pill">🥟 SAMOSA: ${Math.ceil(this.gopal.powerups.samosa)}s</div>`;
      }
      if (this.gopal.powerups.magnet > 0) {
        html += `<div class="powerup-pill">🧲 MAGNET: ${Math.ceil(this.gopal.powerups.magnet)}s</div>`;
      }
      if (this.gopal.powerups.rapidBlaster > 0) {
        html += `<div class="powerup-pill">⚡ TRIPLE BLAST: ${Math.ceil(this.gopal.powerups.rapidBlaster)}s</div>`;
      }
      dock.innerHTML = html;
    }
  }

  // Master Render Function
  draw() {
    this.ctx.clearRect(0, 0, this.viewWidth, this.viewHeight);

    this.ctx.save();

    // Screen Shake Offset
    if (this.shakeIntensity > 0) {
      const shakeX = (Math.random() - 0.5) * this.shakeIntensity;
      const shakeY = (Math.random() - 0.5) * this.shakeIntensity;
      this.ctx.translate(shakeX, shakeY);
    }

    // Draw Parallax Scenery Background
    this.drawParallaxBackground();

    // Camera Translation for World Entities
    this.ctx.translate(-this.camera.x, -this.camera.y);

    // Draw Goal Gate
    if (this.goal) {
      this.drawGoalGate(this.goal);
    }

    // Draw Platforms
    this.drawPlatforms();

    // Draw Hazards
    this.drawHazards();

    // Draw Collectibles
    this.drawCollectibles();

    // Draw Enemies
    this.drawEnemies();

    // Draw Boss
    if (this.boss) {
      this.boss.draw(this.ctx);
    }

    // Draw Gopal!
    this.gopal.draw(this.ctx);

    // Draw Projectiles
    this.drawProjectiles();

    // Draw Particles
    this.drawParticles();

    // Draw Floating Text
    this.drawFloatingTexts();

    this.ctx.restore();

    // If Boss Level, draw Boss HP Bar at top
    if (this.boss && this.boss.hp > 0 && this.gopal.x > this.currentLevelData.bossArenaX - 200) {
      this.drawBossHPBar();
    }
  }

  drawParallaxBackground() {
    const bgColors = this.currentLevelData?.bgColors || ['#0284c7', '#38bdf8', '#bae6fd'];
    const grad = this.ctx.createLinearGradient(0, 0, 0, this.viewHeight);
    grad.addColorStop(0, bgColors[0]);
    grad.addColorStop(0.6, bgColors[1]);
    grad.addColorStop(1, bgColors[2]);
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);

    // Parallax Mountain / Skyline Silhouette
    this.ctx.save();
    const p1 = this.camera.x * 0.2;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.viewHeight);
    for (let x = 0; x <= this.viewWidth + 100; x += 120) {
      const hillH = 180 + Math.sin((x + p1) * 0.008) * 80 + Math.cos((x + p1) * 0.015) * 40;
      this.ctx.lineTo(x, this.viewHeight - hillH);
    }
    this.ctx.lineTo(this.viewWidth, this.viewHeight);
    this.ctx.closePath();
    this.ctx.fill();

    // Closer parallax hills
    const p2 = this.camera.x * 0.45;
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.viewHeight);
    for (let x = 0; x <= this.viewWidth + 100; x += 90) {
      const hillH = 100 + Math.sin((x + p2) * 0.012) * 50;
      this.ctx.lineTo(x, this.viewHeight - hillH);
    }
    this.ctx.lineTo(this.viewWidth, this.viewHeight);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  drawPlatforms() {
    const cData = this.currentLevelData;
    const gColor = cData?.groundColor || '#15803d';
    const bColor = cData?.groundBorder || '#166534';
    const pColor = cData?.platformColor || '#16a34a';

    for (let p of this.platforms) {
      // Cull offscreen platforms
      if (p.x + p.width < this.camera.x - 50 || p.x > this.camera.x + this.viewWidth + 50) continue;

      this.ctx.fillStyle = p.height > 40 ? gColor : pColor;
      this.ctx.strokeStyle = bColor;
      this.ctx.lineWidth = 3;

      this.ctx.beginPath();
      this.ctx.roundRect(p.x, p.y, p.width, p.height, 6);
      this.ctx.fill();
      this.ctx.stroke();

      // Top highlighted grass/metal strip
      this.ctx.fillStyle = bColor;
      this.ctx.fillRect(p.x, p.y, p.width, 5);
    }
  }

  drawHazards() {
    for (let h of this.hazards) {
      if (h.type === 'spikes') {
        this.ctx.fillStyle = '#cbd5e1';
        this.ctx.strokeStyle = '#64748b';
        this.ctx.lineWidth = 1.5;
        const count = Math.floor(h.width / 16);
        for (let i = 0; i < count; i++) {
          this.ctx.beginPath();
          this.ctx.moveTo(h.x + i * 16, h.y + h.height);
          this.ctx.lineTo(h.x + i * 16 + 8, h.y);
          this.ctx.lineTo(h.x + (i + 1) * 16, h.y + h.height);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.stroke();
        }
      } else if (h.type === 'laser') {
        this.ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
        this.ctx.strokeStyle = '#38bdf8';
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = '#38bdf8';
        this.ctx.shadowBlur = 12;
        this.ctx.strokeRect(h.x, h.y + 6, h.width, 10);
        this.ctx.fillRect(h.x, h.y + 6, h.width, 10);
        this.ctx.shadowBlur = 0;
      } else if (h.type === 'shockwave') {
        this.ctx.fillStyle = '#f97316';
        this.ctx.shadowColor = '#ea580c';
        this.ctx.shadowBlur = 14;
        this.ctx.beginPath();
        this.ctx.arc(h.x + h.width / 2, h.y + 10, 18, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      }
    }
  }

  drawCollectibles() {
    for (let item of this.items) {
      if (item.collected) continue;
      if (item.x < this.camera.x - 30 || item.x > this.camera.x + this.viewWidth + 30) continue;

      const bob = Math.sin(performance.now() * 0.006 + item.x) * 5;
      const cy = item.y + bob;

      if (item.type === 'coin') {
        this.ctx.save();
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.strokeStyle = '#d97706';
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = '#fbbf24';
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        this.ctx.arc(item.x, cy, 10, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#fffbeb';
        this.ctx.font = 'bold 10px Outfit';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('$', item.x, cy);
        this.ctx.restore();
      } else if (item.type === 'gem') {
        this.ctx.save();
        this.ctx.fillStyle = '#34d399';
        this.ctx.shadowColor = '#34d399';
        this.ctx.shadowBlur = 12;
        this.ctx.beginPath();
        this.ctx.moveTo(item.x, cy - 12);
        this.ctx.lineTo(item.x + 10, cy);
        this.ctx.lineTo(item.x, cy + 12);
        this.ctx.lineTo(item.x - 10, cy);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
      } else if (item.type === 'laddoo') {
        // Golden Laddoo
        this.ctx.save();
        this.ctx.fillStyle = '#f59e0b';
        this.ctx.shadowColor = '#fbbf24';
        this.ctx.shadowBlur = 16;
        this.ctx.beginPath();
        this.ctx.arc(item.x, cy, 14, 0, Math.PI * 2);
        this.ctx.fill();

        // Garnish pistachios/silver leaf
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(item.x - 4, cy - 4, 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      } else if (item.type === 'samosa') {
        // Super Samosa
        this.ctx.save();
        this.ctx.fillStyle = '#d97706';
        this.ctx.strokeStyle = '#78350f';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(item.x, cy - 14);
        this.ctx.lineTo(item.x + 14, cy + 10);
        this.ctx.lineTo(item.x - 14, cy + 10);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
      } else if (item.type === 'magnet') {
        this.ctx.font = '22px Outfit';
        this.ctx.fillText('🧲', item.x - 10, cy + 8);
      } else if (item.type === 'shield') {
        this.ctx.font = '22px Outfit';
        this.ctx.fillText('🛡️', item.x - 10, cy + 8);
      } else if (item.type === 'rapidBlaster') {
        this.ctx.font = '22px Outfit';
        this.ctx.fillText('⚡', item.x - 8, cy + 8);
      }
    }
  }

  drawEnemies() {
    for (let e of this.enemies) {
      if (e.hp <= 0) continue;
      if (e.x < this.camera.x - 50 || e.x > this.camera.x + this.viewWidth + 50) continue;

      this.ctx.save();
      const cx = e.x + e.width / 2;
      const cy = e.y + e.height / 2;

      if (e.type === 'slime') {
        const squish = Math.sin(e.timer * 8) * 4;
        this.ctx.fillStyle = '#10b981';
        this.ctx.strokeStyle = '#059669';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.ellipse(cx, cy + 2, e.width / 2 + squish * 0.5, e.height / 2 - squish * 0.5, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Slime eyes
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(cx - 5, cy - 2, 4, 0, Math.PI * 2);
        this.ctx.arc(cx + 5, cy - 2, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#0f172a';
        this.ctx.beginPath();
        this.ctx.arc(cx - 5 + e.facing, cy - 2, 2, 0, Math.PI * 2);
        this.ctx.arc(cx + 5 + e.facing, cy - 2, 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (e.type === 'drone') {
        this.ctx.fillStyle = '#0284c7';
        this.ctx.strokeStyle = '#38bdf8';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Eye lens
        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (e.type === 'cyberHound') {
        this.ctx.fillStyle = '#475569';
        this.ctx.fillRect(e.x, e.y, e.width, e.height);
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillRect(e.x + (e.facing === 1 ? e.width - 8 : 2), e.y + 4, 6, 6);
      } else if (e.type === 'fireImp') {
        this.ctx.fillStyle = '#f97316';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }
  }

  drawGoalGate(goal) {
    this.ctx.save();
    // Portal frame
    this.ctx.strokeStyle = '#fbbf24';
    this.ctx.lineWidth = 5;
    this.ctx.shadowColor = '#fbbf24';
    this.ctx.shadowBlur = 20;

    this.ctx.strokeRect(goal.x, goal.y, goal.width, goal.height);

    // Swirling portal aura
    const grad = this.ctx.createLinearGradient(goal.x, goal.y, goal.x + goal.width, goal.y + goal.height);
    grad.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
    grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.6)');
    grad.addColorStop(1, 'rgba(168, 85, 247, 0.5)');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(goal.x, goal.y, goal.width, goal.height);

    // Goal Flag Banner
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.font = 'bold 16px Outfit';
    this.ctx.fillText('🏁 GOAL', goal.x - 10, goal.y - 14);
    this.ctx.restore();
  }

  drawProjectiles() {
    for (let p of this.projectiles) {
      this.ctx.save();
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 12;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    for (let ep of this.enemyProjectiles) {
      this.ctx.save();
      this.ctx.fillStyle = ep.color;
      this.ctx.shadowColor = ep.color;
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(ep.x, ep.y, ep.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  drawParticles() {
    for (let p of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = p.life / p.maxLife;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  drawFloatingTexts() {
    for (let ft of this.floatingTexts) {
      this.ctx.save();
      this.ctx.globalAlpha = ft.opacity;
      this.ctx.fillStyle = ft.color;
      this.ctx.font = 'bold 16px Outfit, sans-serif';
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      this.ctx.shadowBlur = 6;
      this.ctx.fillText(ft.text, ft.x, ft.y);
      this.ctx.restore();
    }
  }

  drawBossHPBar() {
    this.ctx.save();
    const barWidth = 420;
    const barHeight = 18;
    const bx = (this.viewWidth - barWidth) / 2;
    const by = 80;

    // Background track
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    this.ctx.strokeStyle = '#ef4444';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.roundRect(bx, by, barWidth, barHeight, 8);
    this.ctx.fill();
    this.ctx.stroke();

    // HP Fill
    const pct = Math.max(0, this.boss.hp / this.boss.maxHp);
    const fillWidth = (barWidth - 4) * pct;
    const grad = this.ctx.createLinearGradient(bx, by, bx + barWidth, by);
    grad.addColorStop(0, '#f97316');
    grad.addColorStop(1, '#ef4444');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.roundRect(bx + 2, by + 2, fillWidth, barHeight - 4, 6);
    this.ctx.fill();

    // Boss Name text
    this.ctx.fillStyle = '#fef08a';
    this.ctx.font = 'bold 13px Outfit';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`👑 ${this.boss.name} (${this.boss.hp}/${this.boss.maxHp})`, this.viewWidth / 2, by - 6);
    this.ctx.restore();
  }
}

// Instantiate master game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.superGopalGame = new SuperGopalGame();
});
