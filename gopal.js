/**
 * SUPER GOPAL: The Legendary Protagonist
 * Complete Character Controller, Physics, Procedural Canvas Vector Rendering,
 * Dynamic Cape Simulation, and Particle Trail Generation.
 */

class Gopal {
  constructor(x, y) {
    // Spatial & Physics
    this.x = x;
    this.y = y;
    this.width = 38;
    this.height = 54;
    this.vx = 0;
    this.vy = 0;
    
    // Movement Tuning
    this.speed = 4.8;
    this.jumpForce = -12.5;
    this.gravity = 0.58;
    this.friction = 0.82;
    this.maxFallSpeed = 15;

    // State Flags
    this.isGrounded = false;
    this.isJumping = false;
    this.canDoubleJump = true;
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.isGroundPounding = false;
    this.facing = 1; // 1 = right, -1 = left
    this.isAttacking = false;
    this.attackTimer = 0;

    // Health & Lives
    this.maxHp = 3;
    this.hp = 3;
    this.shield = 0; // Absorption shields
    this.invulnerableTimer = 0;

    // Power-ups
    this.powerups = {
      laddoo: 0,   // Invincibility + Rainbow speed
      samosa: 0,   // High Jump + Strength
      magnet: 0,   // Coin Pull
      rapidBlaster: 0 // Triple Fireball Blaster
    };

    // Animation & Cape Physics
    this.animTimer = 0;
    this.runCycle = 0;
    this.flipAngle = 0; // For double jump somersault
    this.skin = 'classic'; // 'classic', 'cyber', 'golden', 'royal', 'cosmic'

    // Cape points for cloth physics
    this.capePoints = [
      { x: this.x, y: this.y + 16 },
      { x: this.x - 8, y: this.y + 24 },
      { x: this.x - 16, y: this.y + 34 },
      { x: this.x - 24, y: this.y + 44 }
    ];
  }

  setSkin(skinName) {
    this.skin = skinName;
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.hp = this.maxHp;
    this.shield = 0;
    this.invulnerableTimer = 0;
    this.isGrounded = false;
    this.canDoubleJump = true;
    this.isDashing = false;
    this.isGroundPounding = false;
    this.flipAngle = 0;
    this.powerups = { laddoo: 0, samosa: 0, magnet: 0, rapidBlaster: 0 };
  }

  // Handle Input Execution
  handleInput(input, game) {
    if (this.hp <= 0) return;

    // Horizontal Movement
    if (!this.isDashing && !this.isGroundPounding) {
      if (game && game.gameMode === 'endless') {
        // Endless Rush: dynamic forward speed scaling + brake/turbo controls
        const speedRamp = Math.min(3.6, (game.distance || 0) / 750);
        const baseSpeed = 5.4 + speedRamp;
        let topSpeed = baseSpeed;
        if (this.powerups.laddoo > 0) topSpeed *= 1.35;

        if (input.left) {
          // Brake / slow down to time precision jumps
          this.vx = Math.max(2.2, this.vx - 1.2);
          this.facing = 1;
        } else if (input.right) {
          // Turbo sprint forward
          this.vx = Math.min(topSpeed * 1.28, this.vx + 1.4);
          this.facing = 1;
        } else {
          // Smoothly cruise at current top speed
          this.vx = this.vx * 0.90 + topSpeed * 0.10;
          this.facing = 1;
        }
      } else {
        // Story Mode standard exploration
        if (input.left) {
          this.vx -= 1.0;
          this.facing = -1;
        }
        if (input.right) {
          this.vx += 1.0;
          this.facing = 1;
        }

        // Max run speed clamp (boosted if Golden Laddoo active)
        let topSpeed = this.speed;
        if (this.powerups.laddoo > 0) topSpeed *= 1.4;
        this.vx = Math.max(-topSpeed, Math.min(topSpeed, this.vx));
      }
    }

    // Jump / Double Jump
    if (input.jumpPressed) {
      if (this.isGrounded) {
        const boost = this.powerups.samosa > 0 ? 1.25 : 1.0;
        this.vy = this.jumpForce * boost;
        this.isGrounded = false;
        this.isJumping = true;
        this.canDoubleJump = true;
        window.audioMgr.playJump();
        game.spawnPuff(this.x + this.width / 2, this.y + this.height, '#ffffff');
      } else if (this.canDoubleJump) {
        const boost = this.powerups.samosa > 0 ? 1.2 : 1.0;
        this.vy = this.jumpForce * 0.95 * boost;
        this.canDoubleJump = false;
        this.flipAngle = this.facing * Math.PI * 2;
        window.audioMgr.playDoubleJump();
        game.spawnPuff(this.x + this.width / 2, this.y + this.height, '#38bdf8');
      }
    }

    // Dash / Slide (Down key or Dash button)
    if (input.dashPressed && this.dashCooldown <= 0 && !this.isDashing) {
      if (this.isGrounded) {
        this.isDashing = true;
        this.dashTimer = 16; // frames
        this.dashCooldown = 35;
        this.vx = this.facing * 12;
        window.audioMgr.playSlide();
        game.spawnPuff(this.x + this.width / 2, this.y + this.height, '#fbbf24', 8);
      } else {
        // In-air Ground Pound!
        this.isGroundPounding = true;
        this.vy = 18;
        this.vx = 0;
        window.audioMgr.playSlide();
      }
    }

    // Attack / Energy Blast (X / J / Button)
    if (input.attackPressed && this.attackTimer <= 0) {
      this.attack(game);
    }
  }

  attack(game) {
    this.isAttacking = true;
    this.attackTimer = 18;
    window.audioMgr.playAttack();

    const spawnX = this.facing === 1 ? this.x + this.width + 6 : this.x - 12;
    const spawnY = this.y + this.height * 0.45;

    // Normal blast or Triple blaster
    if (this.powerups.rapidBlaster > 0) {
      game.spawnProjectile(spawnX, spawnY - 6, this.facing * 11, -1.5, this.skin);
      game.spawnProjectile(spawnX, spawnY, this.facing * 12, 0, this.skin);
      game.spawnProjectile(spawnX, spawnY + 6, this.facing * 11, 1.5, this.skin);
    } else {
      game.spawnProjectile(spawnX, spawnY, this.facing * 10, 0, this.skin);
    }

    // Kickback recoil
    this.vx -= this.facing * 1.2;
  }

  takeDamage(amount = 1, game) {
    if (this.invulnerableTimer > 0 || this.powerups.laddoo > 0 || this.hp <= 0) {
      return false;
    }

    // Shield protection
    if (this.shield > 0) {
      this.shield--;
      this.invulnerableTimer = 45;
      window.audioMgr.playHurt();
      game.spawnPuff(this.x + this.width / 2, this.y + this.height / 2, '#38bdf8', 15);
      game.showFloatingText('SHIELD BROKEN!', this.x, this.y - 20, '#38bdf8');
      return false;
    }

    this.hp -= amount;
    this.invulnerableTimer = 65; // ~1 second of i-frames
    window.audioMgr.playHurt();
    game.triggerScreenShake(8);
    game.spawnPuff(this.x + this.width / 2, this.y + this.height / 2, '#f43f5e', 20);

    // Knockback
    this.vy = -6;
    this.vx = -this.facing * 5;

    if (this.hp <= 0) {
      this.hp = 0;
      window.audioMgr.playGameOver();
      game.onPlayerDied();
    }
    return true;
  }

  update(dt, game) {
    this.animTimer += dt;

    // Update timers
    if (this.invulnerableTimer > 0) this.invulnerableTimer--;
    if (this.attackTimer > 0) this.attackTimer--;
    if (this.dashCooldown > 0) this.dashCooldown--;

    if (this.isDashing) {
      this.dashTimer--;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
      }
      // Dash particle trail
      if (Math.random() < 0.6) {
        game.spawnParticle(
          this.x + (this.facing === 1 ? 0 : this.width),
          this.y + Math.random() * this.height,
          -this.facing * (Math.random() * 3 + 2),
          (Math.random() - 0.5) * 2,
          this.getSkinAccentColor(),
          16,
          4
        );
      }
    }

    // Power-up durations decrement
    for (let key in this.powerups) {
      if (this.powerups[key] > 0) {
        this.powerups[key] -= dt;
        if (this.powerups[key] <= 0) {
          this.powerups[key] = 0;
          game.showFloatingText(`${key.toUpperCase()} EXPIRED`, this.x, this.y - 25, '#94a3b8');
        }
      }
    }

    // Golden Laddoo trail
    if (this.powerups.laddoo > 0 && Math.random() < 0.7) {
      game.spawnParticle(
        this.x + Math.random() * this.width,
        this.y + Math.random() * this.height,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
        ['#fbbf24', '#f43f5e', '#38bdf8', '#34d399'][Math.floor(Math.random() * 4)],
        18,
        5
      );
    }

    // Apply Gravity
    this.vy += this.gravity;
    if (this.vy > this.maxFallSpeed) this.vy = this.maxFallSpeed;

    // Apply Friction
    if (!this.isDashing) {
      if (!game || game.gameMode !== 'endless') {
        this.vx *= this.friction;
        if (Math.abs(this.vx) < 0.1) this.vx = 0;
      }
    }

    // Ground pound landing check is handled in physics collision
    if (Math.abs(this.vx) > 0.5 && this.isGrounded) {
      this.runCycle += 0.28;
      if (Math.random() < 0.18) {
        game.spawnParticle(
          this.x + this.width / 2,
          this.y + this.height,
          -this.facing * Math.random() * 2,
          -Math.random() * 2,
          '#64748b',
          14,
          3
        );
      }
    } else {
      this.runCycle = 0;
    }

    // Smooth Flip Angle restoration
    if (this.flipAngle !== 0) {
      const step = 0.35;
      if (this.flipAngle > 0) {
        this.flipAngle = Math.max(0, this.flipAngle - step);
      } else {
        this.flipAngle = Math.min(0, this.flipAngle + step);
      }
    }

    // Update Cape physics simulation
    this.updateCape();
  }

  updateCape() {
    // Shoulder attachment point
    const shoulderX = this.x + (this.facing === 1 ? 10 : this.width - 10);
    const shoulderY = this.y + 18;
    this.capePoints[0].x = shoulderX;
    this.capePoints[0].y = shoulderY;

    // Trailing points with spring and wind
    for (let i = 1; i < this.capePoints.length; i++) {
      const prev = this.capePoints[i - 1];
      const p = this.capePoints[i];

      // Wind pull opposing facing direction + velocity lag
      const targetX = prev.x - this.facing * (8 + i * 2) - this.vx * 1.5;
      const targetY = prev.y + (10 + Math.sin(this.animTimer * 8 + i) * 3) - this.vy * 0.4;

      p.x += (targetX - p.x) * 0.35;
      p.y += (targetY - p.y) * 0.35;
    }
  }

  getSkinAccentColor() {
    switch (this.skin) {
      case 'cyber': return '#38bdf8';
      case 'golden': return '#fbbf24';
      case 'royal': return '#34d399';
      case 'cosmic': return '#c084fc';
      default: return '#f43f5e';
    }
  }

  // Procedural Canvas Vector Rendering for Gopal
  draw(ctx) {
    ctx.save();

    // Damage flicker
    if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer / 4) % 2 === 1) {
      ctx.globalAlpha = 0.45;
    }

    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    // Somrsault / Flip rotation
    if (this.flipAngle !== 0) {
      ctx.translate(centerX, centerY);
      ctx.rotate(this.flipAngle);
      ctx.translate(-centerX, -centerY);
    }

    // Draw Dynamic Billowing Hero Cape (Behind Gopal)
    this.drawCape(ctx);

    // Gopal's Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(centerX, this.y + this.height + 2, this.width * 0.55, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Invincibility or Shield glowing aura
    if (this.powerups.laddoo > 0) {
      const grad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 38);
      grad.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
      grad.addColorStop(0.7, 'rgba(244, 63, 94, 0.2)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 38, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.shield > 0) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 32, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Body Rendering
    ctx.translate(centerX, centerY);
    ctx.scale(this.facing, 1);
    ctx.translate(-centerX, -centerY);

    this.renderBodyParts(ctx);

    ctx.restore();
  }

  drawCape(ctx) {
    if (this.isDashing) return; // Cape tucks in during dash

    ctx.save();
    let capeColor = '#dc2626'; // Default red
    let capeBorder = '#991b1b';

    if (this.skin === 'cyber') {
      capeColor = 'rgba(56, 189, 248, 0.85)';
      capeBorder = '#0284c7';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
    } else if (this.skin === 'golden') {
      capeColor = '#f59e0b';
      capeBorder = '#b45309';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 15;
    } else if (this.skin === 'royal') {
      capeColor = '#be123c';
      capeBorder = '#881337';
    } else if (this.skin === 'cosmic') {
      capeColor = '#7c3aed';
      capeBorder = '#4c1d95';
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 12;
    }

    ctx.fillStyle = capeColor;
    ctx.strokeStyle = capeBorder;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(this.capePoints[0].x, this.capePoints[0].y);
    for (let i = 1; i < this.capePoints.length; i++) {
      ctx.lineTo(this.capePoints[i].x, this.capePoints[i].y);
    }
    // Return back to shoulder to form cape ribbon width
    ctx.lineTo(this.capePoints[this.capePoints.length - 1].x, this.capePoints[this.capePoints.length - 1].y + 10);
    for (let i = this.capePoints.length - 2; i >= 0; i--) {
      ctx.lineTo(this.capePoints[i].x, this.capePoints[i].y + 6);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  renderBodyParts(ctx) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    // Palette per skin
    let skinColors = {
      suit: '#1e40af',       // Deep Royal Blue
      suitTrim: '#fbbf24',   // Gold Trim
      flesh: '#e0a96d',      // Warm Tan
      hair: '#1e293b',       // Dark Charcoal
      accent: '#f59e0b',     // Gold
      crest: 'G'             // Gopal 'G'
    };

    if (this.skin === 'cyber') {
      skinColors = {
        suit: '#0f172a',
        suitTrim: '#38bdf8',
        flesh: '#f1f5f9',
        hair: '#0284c7',
        accent: '#00f2fe',
        crest: '⚡'
      };
    } else if (this.skin === 'golden') {
      skinColors = {
        suit: '#fef08a',
        suitTrim: '#f59e0b',
        flesh: '#fde68a',
        hair: '#fbbf24',
        accent: '#fbbf24',
        crest: '★'
      };
    } else if (this.skin === 'royal') {
      skinColors = {
        suit: '#065f46',
        suitTrim: '#fbbf24',
        flesh: '#e0a96d',
        hair: '#111827',
        accent: '#e11d48',
        crest: '👑'
      };
    } else if (this.skin === 'cosmic') {
      skinColors = {
        suit: '#3b0764',
        suitTrim: '#c084fc',
        flesh: '#e9d5ff',
        hair: '#581c87',
        accent: '#a855f7',
        crest: '✦'
      };
    }

    // Stance offsets (crouch/dash)
    const crouchOffset = this.isDashing ? 14 : 0;
    const legOffset1 = Math.sin(this.runCycle) * 7;
    const legOffset2 = Math.sin(this.runCycle + Math.PI) * 7;

    // 1. LEGS
    ctx.fillStyle = skinColors.suitTrim;
    if (this.isGrounded) {
      // Running legs
      ctx.fillRect(cx - 10, cy + 14 + crouchOffset, 7, 14 - legOffset1 * 0.4);
      ctx.fillRect(cx + 3, cy + 14 + crouchOffset, 7, 14 - legOffset2 * 0.4);
      // Boots
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(cx - 11, cy + 24 - legOffset1 * 0.4 + crouchOffset, 9, 6);
      ctx.fillRect(cx + 2, cy + 24 - legOffset2 * 0.4 + crouchOffset, 9, 6);
    } else {
      // In air tucked knees
      ctx.fillRect(cx - 9, cy + 12, 7, 10);
      ctx.fillRect(cx + 2, cy + 8, 7, 12);
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(cx - 10, cy + 18, 9, 5);
      ctx.fillRect(cx + 1, cy + 16, 9, 5);
    }

    // 2. TORSO / TUNIC
    ctx.fillStyle = skinColors.suit;
    ctx.beginPath();
    ctx.roundRect(cx - 13, cy - 8 + crouchOffset, 26, 23, 6);
    ctx.fill();

    // Belt & Emblem
    ctx.fillStyle = skinColors.suitTrim;
    ctx.fillRect(cx - 13, cy + 9 + crouchOffset, 26, 4);

    // Hero Gopal Crest ("G" or icon)
    ctx.font = 'bold 11px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = skinColors.accent;
    ctx.fillText(skinColors.crest, cx, cy - 1 + crouchOffset);

    // 3. HEAD & FACE
    const headY = cy - 20 + crouchOffset;
    ctx.fillStyle = skinColors.flesh;
    ctx.beginPath();
    ctx.arc(cx, headY, 12, 0, Math.PI * 2);
    ctx.fill();

    // Hair / Turban / Helm
    ctx.fillStyle = skinColors.hair;
    ctx.beginPath();
    ctx.arc(cx, headY - 4, 12.5, Math.PI * 0.8, Math.PI * 2.2);
    ctx.fill();
    // Front hair swoop
    ctx.fillRect(cx - 5, headY - 14, 13, 6);

    // Eyes & Smile
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx + 4, headY - 1, 2, 0, Math.PI * 2); // Front eye
    ctx.arc(cx - 2, headY - 1, 1.8, 0, Math.PI * 2); // Back eye
    ctx.fill();

    // Cheerful / Determined mouth
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    if (this.hp <= 1) {
      // Grimace when low HP
      ctx.moveTo(cx + 1, headY + 5);
      ctx.lineTo(cx + 6, headY + 5);
    } else {
      // Heroic confident smile
      ctx.arc(cx + 3, headY + 4, 3, 0.1 * Math.PI, 0.9 * Math.PI);
    }
    ctx.stroke();

    // 4. ARMS / HANDS
    ctx.fillStyle = skinColors.flesh;
    if (this.isAttacking) {
      // Cast / Punch forward
      ctx.fillStyle = skinColors.suit;
      ctx.fillRect(cx + 6, cy - 4 + crouchOffset, 16, 6);
      ctx.fillStyle = skinColors.accent;
      ctx.beginPath();
      ctx.arc(cx + 23, cy - 1 + crouchOffset, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Normal arm swing
      const armSwing = Math.sin(this.runCycle + Math.PI) * 5;
      ctx.fillStyle = skinColors.suit;
      ctx.fillRect(cx + 2 + armSwing, cy - 4 + crouchOffset, 6, 12);
      ctx.fillStyle = skinColors.flesh;
      ctx.fillRect(cx + 2 + armSwing, cy + 6 + crouchOffset, 6, 5);
    }
  }
}

window.Gopal = Gopal;
