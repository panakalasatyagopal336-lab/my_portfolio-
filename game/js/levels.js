/**
 * SUPER GOPAL: LEVEL DATA & ENEMY DEFINITIONS
 * Worlds: Emerald Valley, Cyber Metropolis, Magma Citadel (with Boss), and Endless Mode.
 */

class LevelManager {
  static getLevels() {
    return [
      // ==========================================
      // WORLD 1: EMERALD VALLEY
      // ==========================================
      {
        id: 'world1',
        name: 'World 1: Emerald Valley',
        theme: 'valley',
        bgColors: ['#0284c7', '#38bdf8', '#bae6fd'],
        groundColor: '#15803d',
        groundBorder: '#166534',
        platformColor: '#16a34a',
        width: 3800,
        height: 600,
        playerStart: { x: 80, y: 380 },
        goal: { x: 3600, y: 340, width: 40, height: 160 },
        
        // Static and moving platforms
        platforms: [
          // Ground segments with gaps
          { x: 0, y: 500, width: 850, height: 100 },
          { x: 950, y: 500, width: 900, height: 100 },
          { x: 1950, y: 500, width: 800, height: 100 },
          { x: 2850, y: 500, width: 950, height: 100 },

          // Elevated stepping stones & floating islands
          { x: 240, y: 400, width: 140, height: 26 },
          { x: 440, y: 320, width: 160, height: 26 },
          { x: 680, y: 250, width: 130, height: 26 },

          // Over the first chasm
          { x: 870, y: 430, width: 60, height: 20 },
          { x: 1100, y: 390, width: 180, height: 26 },
          { x: 1360, y: 310, width: 140, height: 26 },
          { x: 1580, y: 240, width: 160, height: 26 },

          // Moving platforms
          { x: 1820, y: 380, width: 100, height: 22, moving: true, range: 140, speed: 1.8, axis: 'x' },
          { x: 2200, y: 380, width: 120, height: 26 },
          { x: 2400, y: 290, width: 140, height: 26 },
          { x: 2620, y: 360, width: 100, height: 22, moving: true, range: 100, speed: 2.2, axis: 'y' },

          // High secret bridge
          { x: 2050, y: 200, width: 220, height: 22 },
          { x: 3000, y: 410, width: 160, height: 26 },
          { x: 3240, y: 330, width: 180, height: 26 }
        ],

        // Hazards / Spikes
        hazards: [
          { x: 850, y: 580, width: 100, height: 20, type: 'chasm' },
          { x: 1850, y: 580, width: 100, height: 20, type: 'chasm' },
          { x: 2750, y: 580, width: 100, height: 20, type: 'chasm' },
          { x: 1250, y: 476, width: 70, height: 24, type: 'spikes' },
          { x: 2320, y: 476, width: 80, height: 24, type: 'spikes' }
        ],

        // Collectibles (Coins, Gems, Power-ups)
        items: [
          // Coin arcs
          { x: 260, y: 360, type: 'coin' },
          { x: 300, y: 340, type: 'coin' },
          { x: 340, y: 360, type: 'coin' },
          
          { x: 470, y: 280, type: 'coin' },
          { x: 510, y: 260, type: 'gem' },
          { x: 550, y: 280, type: 'coin' },

          // Secret Golden Laddoo on high perch!
          { x: 730, y: 200, type: 'laddoo' },

          { x: 1140, y: 350, type: 'coin' },
          { x: 1190, y: 350, type: 'coin' },
          { x: 1240, y: 350, type: 'coin' },
          { x: 1420, y: 260, type: 'samosa' }, // Super Samosa!

          { x: 1640, y: 190, type: 'gem' },
          { x: 2120, y: 150, type: 'rapidBlaster' }, // Triple staff

          { x: 2450, y: 240, type: 'magnet' },
          { x: 3040, y: 360, type: 'coin' },
          { x: 3090, y: 360, type: 'coin' },
          { x: 3300, y: 280, type: 'gem' }
        ],

        // Enemies
        enemies: [
          { type: 'slime', x: 500, y: 468, range: 180, speed: 1.4 },
          { type: 'slime', x: 1350, y: 468, range: 220, speed: 1.5 },
          { type: 'drone', x: 1420, y: 210, range: 120, speed: 2.0 },
          { type: 'slime', x: 2150, y: 468, range: 160, speed: 1.6 },
          { type: 'drone', x: 2460, y: 190, range: 150, speed: 2.2 },
          { type: 'slime', x: 3100, y: 468, range: 180, speed: 1.8 }
        ]
      },

      // ==========================================
      // WORLD 2: CYBER METROPOLIS
      // ==========================================
      {
        id: 'world2',
        name: 'World 2: Cyber Metropolis',
        theme: 'cyber',
        bgColors: ['#090d16', '#1e1b4b', '#312e81'],
        groundColor: '#1e293b',
        groundBorder: '#38bdf8',
        platformColor: '#0f172a',
        width: 4200,
        height: 600,
        playerStart: { x: 80, y: 380 },
        goal: { x: 4000, y: 340, width: 44, height: 160 },

        platforms: [
          { x: 0, y: 500, width: 700, height: 100 },
          { x: 800, y: 500, width: 800, height: 100 },
          { x: 1750, y: 500, width: 900, height: 100 },
          { x: 2800, y: 500, width: 600, height: 100 },
          { x: 3550, y: 500, width: 650, height: 100 },

          // Neon gantries
          { x: 220, y: 390, width: 160, height: 24 },
          { x: 450, y: 300, width: 140, height: 24 },
          { x: 670, y: 230, width: 180, height: 24 },

          // Moving Laser Elevators
          { x: 920, y: 370, width: 110, height: 22, moving: true, range: 120, speed: 2.2, axis: 'y' },
          { x: 1150, y: 280, width: 150, height: 24 },
          { x: 1400, y: 360, width: 120, height: 22, moving: true, range: 150, speed: 2.4, axis: 'x' },

          { x: 1950, y: 390, width: 160, height: 24 },
          { x: 2200, y: 310, width: 160, height: 24 },
          { x: 2460, y: 230, width: 180, height: 24 },

          { x: 2950, y: 380, width: 110, height: 22, moving: true, range: 130, speed: 2.6, axis: 'y' },
          { x: 3180, y: 290, width: 140, height: 24 },
          { x: 3420, y: 380, width: 100, height: 22, moving: true, range: 140, speed: 2.4, axis: 'x' },
          { x: 3680, y: 410, width: 180, height: 24 }
        ],

        hazards: [
          { x: 700, y: 580, width: 100, height: 20, type: 'chasm' },
          { x: 1600, y: 580, width: 150, height: 20, type: 'chasm' },
          { x: 2650, y: 580, width: 150, height: 20, type: 'chasm' },
          { x: 3400, y: 580, width: 150, height: 20, type: 'chasm' },
          { x: 1050, y: 476, width: 120, height: 24, type: 'laser' },
          { x: 2050, y: 476, width: 140, height: 24, type: 'laser' }
        ],

        items: [
          { x: 250, y: 340, type: 'coin' },
          { x: 490, y: 250, type: 'shield' },
          { x: 720, y: 180, type: 'gem' },

          { x: 1200, y: 230, type: 'magnet' },
          { x: 1800, y: 450, type: 'coin' },
          { x: 1850, y: 450, type: 'coin' },
          { x: 1900, y: 450, type: 'coin' },

          { x: 2250, y: 260, type: 'rapidBlaster' },
          { x: 2520, y: 170, type: 'laddoo' }, // Invincibility for the gauntlet
          { x: 3230, y: 240, type: 'samosa' },
          { x: 3730, y: 360, type: 'gem' }
        ],

        enemies: [
          { type: 'cyberHound', x: 400, y: 468, range: 240, speed: 2.8 },
          { type: 'drone', x: 750, y: 170, range: 140, speed: 2.4 },
          { type: 'cyberHound', x: 1200, y: 468, range: 250, speed: 3.0 },
          { type: 'drone', x: 2280, y: 240, range: 180, speed: 2.6 },
          { type: 'cyberHound', x: 2900, y: 468, range: 220, speed: 3.2 },
          { type: 'drone', x: 3240, y: 220, range: 140, speed: 2.5 }
        ]
      },

      // ==========================================
      // WORLD 3: MAGMA CITADEL & BOSS BATTLE
      // ==========================================
      {
        id: 'world3',
        name: 'World 3: Magma Citadel (Boss Encounter)',
        theme: 'magma',
        bgColors: ['#1c0b0b', '#450a0a', '#7f1d1d'],
        groundColor: '#292524',
        groundBorder: '#f97316',
        platformColor: '#1c1917',
        width: 3200,
        height: 600,
        playerStart: { x: 80, y: 380 },
        isBossLevel: true,
        bossArenaX: 2100, // Camera locks here for Boss fight!

        platforms: [
          { x: 0, y: 500, width: 600, height: 100 },
          { x: 700, y: 500, width: 450, height: 100 },
          { x: 1250, y: 500, width: 600, height: 100 },
          // Giant Boss Arena floor
          { x: 1950, y: 500, width: 1250, height: 100 },

          // Obsidian Pillars & Step Crags
          { x: 180, y: 400, width: 140, height: 26 },
          { x: 380, y: 310, width: 140, height: 26 },
          { x: 620, y: 360, width: 100, height: 22, moving: true, range: 110, speed: 2.0, axis: 'y' },
          { x: 820, y: 280, width: 160, height: 26 },
          { x: 1080, y: 360, width: 120, height: 22, moving: true, range: 130, speed: 2.2, axis: 'x' },

          { x: 1380, y: 380, width: 140, height: 26 },
          { x: 1600, y: 290, width: 150, height: 26 },

          // Boss Arena Vantage Platforms
          { x: 2150, y: 360, width: 160, height: 24 },
          { x: 2500, y: 270, width: 200, height: 24 },
          { x: 2850, y: 360, width: 160, height: 24 }
        ],

        hazards: [
          { x: 600, y: 580, width: 100, height: 20, type: 'lava' },
          { x: 1150, y: 580, width: 100, height: 20, type: 'lava' },
          { x: 1850, y: 580, width: 100, height: 20, type: 'lava' },
          { x: 840, y: 476, width: 90, height: 24, type: 'fireJets' },
          { x: 1420, y: 476, width: 90, height: 24, type: 'fireJets' }
        ],

        items: [
          { x: 220, y: 350, type: 'coin' },
          { x: 420, y: 260, type: 'samosa' },
          { x: 880, y: 230, type: 'shield' },
          { x: 1650, y: 230, type: 'rapidBlaster' }, // Powerful weapons for the boss!
          { x: 1980, y: 440, type: 'laddoo' }, // Pre-boss buff
          { x: 2200, y: 310, type: 'gem' },
          { x: 2580, y: 220, type: 'samosa' },
          { x: 2900, y: 310, type: 'gem' }
        ],

        enemies: [
          { type: 'fireImp', x: 420, y: 468, range: 180, speed: 2.0 },
          { type: 'fireImp', x: 920, y: 468, range: 160, speed: 2.2 },
          { type: 'fireImp', x: 1500, y: 468, range: 200, speed: 2.4 }
        ],

        // Boss Configuration
        boss: {
          name: 'MALAKOR THE VOID TITAN',
          x: 2750,
          y: 280,
          width: 90,
          height: 110,
          maxHp: 25,
          hp: 25
        }
      }
    ];
  }
}

// Boss AI Controller
class Boss {
  constructor(cfg) {
    this.name = cfg.name;
    this.x = cfg.x;
    this.y = cfg.y;
    this.startX = cfg.x;
    this.startY = cfg.y;
    this.width = cfg.width;
    this.height = cfg.height;
    this.maxHp = cfg.maxHp;
    this.hp = cfg.hp;
    this.vx = 0;
    this.vy = 0;
    this.state = 'hover'; // hover, slam, retreat, cast
    this.timer = 0;
    this.attackCooldown = 80;
    this.invulnerableTimer = 0;
    this.wingAngle = 0;
    this.facing = -1;
  }

  takeDamage(amount, game) {
    if (this.invulnerableTimer > 0 || this.hp <= 0) return false;
    this.hp -= amount;
    this.invulnerableTimer = 25;
    window.audioMgr.playBossHit();
    game.triggerScreenShake(12);
    game.spawnPuff(this.x + this.width / 2, this.y + this.height / 2, '#ef4444', 25);
    game.showFloatingText(`-${amount * 50}`, this.x + 20, this.y - 10, '#ef4444');

    if (this.hp <= 0) {
      this.hp = 0;
      this.onDefeated(game);
    }
    return true;
  }

  onDefeated(game) {
    window.audioMgr.playStageClear();
    game.triggerScreenShake(24);
    // Mega victory fireworks explosion
    for (let i = 0; i < 60; i++) {
      game.spawnParticle(
        this.x + Math.random() * this.width,
        this.y + Math.random() * this.height,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
        ['#fbbf24', '#f43f5e', '#38bdf8', '#34d399', '#ffffff'][Math.floor(Math.random() * 5)],
        45,
        7
      );
    }
    game.onBossDefeated();
  }

  update(dt, gopal, game) {
    this.timer++;
    this.wingAngle += 0.15;
    if (this.invulnerableTimer > 0) this.invulnerableTimer--;

    if (this.hp <= 0) {
      this.y += 3;
      return;
    }

    // Facing direction towards Gopal
    this.facing = gopal.x < this.x ? -1 : 1;

    // Boss State Machine
    if (this.state === 'hover') {
      // Gentle floating sine wave
      this.y = this.startY + Math.sin(this.timer * 0.05) * 45;
      this.x += (gopal.x + 280 * this.facing - this.x) * 0.03;

      this.attackCooldown--;
      if (this.attackCooldown <= 0) {
        const rand = Math.random();
        if (rand < 0.55) {
          this.state = 'cast';
          this.timer = 0;
        } else {
          this.state = 'slamPrep';
          this.timer = 0;
        }
      }
    } else if (this.state === 'cast') {
      // Fire 3 dark plasma bolts at Gopal
      if (this.timer === 20 || this.timer === 35 || this.timer === 50) {
        window.audioMgr.playAttack();
        const angle = Math.atan2((gopal.y + 20) - (this.y + 50), gopal.x - (this.x + 30));
        game.spawnEnemyProjectile(
          this.x + (this.facing === -1 ? 0 : this.width),
          this.y + 50,
          Math.cos(angle) * 7.5,
          Math.sin(angle) * 7.5
        );
      }
      if (this.timer > 75) {
        this.state = 'hover';
        this.attackCooldown = 90;
      }
    } else if (this.state === 'slamPrep') {
      // Rise high up, then slam down into ground!
      this.y -= 4;
      if (this.timer > 30) {
        this.state = 'slamming';
        this.targetX = gopal.x;
      }
    } else if (this.state === 'slamming') {
      this.x += (this.targetX - this.x) * 0.15;
      this.y += 18;
      // Reached floor
      if (this.y >= 430) {
        this.y = 430;
        this.state = 'stunned';
        this.timer = 0;
        window.audioMgr.playEnemyHit();
        game.triggerScreenShake(18);
        game.spawnPuff(this.x + this.width / 2, this.y + this.height, '#f97316', 30);
        
        // Ground shockwave left & right
        game.spawnShockwave(this.x + this.width / 2, 490);
      }
    } else if (this.state === 'stunned') {
      // Vulnerability window where Boss rests!
      if (this.timer > 90) {
        this.state = 'retreat';
      }
    } else if (this.state === 'retreat') {
      this.y += (this.startY - this.y) * 0.08;
      this.x += (this.startX - this.x) * 0.08;
      if (Math.abs(this.y - this.startY) < 10) {
        this.state = 'hover';
        this.attackCooldown = 70;
      }
    }
  }

  draw(ctx) {
    ctx.save();
    if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer / 3) % 2 === 1) {
      ctx.globalAlpha = 0.5;
    }

    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    // Draw Dark Titan Wings
    const wingFlap = Math.sin(this.wingAngle) * 20;
    ctx.fillStyle = '#450a0a';
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;

    // Left Wing
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy - 10);
    ctx.quadraticCurveTo(cx - 70, cy - 50 + wingFlap, cx - 100, cy + wingFlap);
    ctx.lineTo(cx - 40, cy + 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right Wing
    ctx.beginPath();
    ctx.moveTo(cx + 20, cy - 10);
    ctx.quadraticCurveTo(cx + 70, cy - 50 + wingFlap, cx + 100, cy + wingFlap);
    ctx.lineTo(cx + 40, cy + 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Dark Armor Torso
    const grad = ctx.createLinearGradient(cx, cy - 40, cx, cy + 50);
    grad.addColorStop(0, '#1c1917');
    grad.addColorStop(0.7, '#292524');
    grad.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(cx - 36, cy - 40, 72, 85, 16);
    ctx.fill();

    // Glowing Core Gem
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(cx, cy - 5, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Horns / Crown
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.moveTo(cx - 30, cy - 40);
    ctx.lineTo(cx - 45, cy - 75);
    ctx.lineTo(cx - 15, cy - 45);
    ctx.lineTo(cx, cy - 65);
    ctx.lineTo(cx + 15, cy - 45);
    ctx.lineTo(cx + 45, cy - 75);
    ctx.lineTo(cx + 30, cy - 40);
    ctx.closePath();
    ctx.fill();

    // Glowing Demonic Eyes
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(cx - 14, cy - 22, 5, 0, Math.PI * 2);
    ctx.arc(cx + 14, cy - 22, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Floating Stun Stars if Stunned
    if (this.state === 'stunned') {
      ctx.fillStyle = '#f59e0b';
      ctx.font = '18px Outfit';
      ctx.fillText('💫', cx - 20 + Math.sin(this.timer * 0.2) * 20, cy - 60);
      ctx.fillText('💫', cx + 20 + Math.cos(this.timer * 0.2) * 20, cy - 60);
    }

    ctx.restore();
  }
}

window.LevelManager = LevelManager;
window.Boss = Boss;
