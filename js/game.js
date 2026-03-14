import * as THREE from 'three';
import {
  GRAVITY, JUMP_FORCE, MOVE_SPEED, MAX_FALL_SPEED,
  PLAYER_WIDTH, PLAYER_HEIGHT, VIEW_WIDTH, VIEW_HEIGHT,
  PLATFORMS, ENEMIES, POWERUPS, COINS, SIGNS,
  BOSS_CONFIG, ENEMY_STATS, COLORS,
} from './config.js';
import { InputHandler } from './input.js';
import { AudioManager } from './audio.js';
import {
  createPlayerSprite, createPlatformMesh, createEnemySprite,
  createPowerupSprite, createCoinSprite, createSignMesh,
  createBossSprite, createProjectileMesh, createParticleMesh,
  createPortalSprite, createBackground,
} from './sprites.js';

// Checkpoint x-positions (y is resolved at runtime to the platform surface)
const CHECKPOINT_POSITIONS = [60, 135, 215];

// Wall-slide tuning
const WALL_SLIDE_MAX_FALL = -4;

export class Game {
  constructor() {
    // ── Fixed 16:9 aspect ratio ────────────────────────────────
    this.gameAspect = 16 / 9;
    this.container = document.getElementById('game-container');

    // ── Renderer ──────────────────────────────────────────────
    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x87CEEB);
    this.container.prepend(this.renderer.domElement);

    // ── Camera (fixed aspect, never changes) ──────────────────
    const vh = VIEW_WIDTH / this.gameAspect;
    this.camera = new THREE.OrthographicCamera(
      -VIEW_WIDTH / 2, VIEW_WIDTH / 2, vh / 2, -vh / 2, -10, 10
    );
    this.camera.position.set(0, 0, 5);

    // ── Scene ─────────────────────────────────────────────────
    this.scene = new THREE.Scene();

    // ── Systems ───────────────────────────────────────────────
    this.input = new InputHandler();
    this.audio = new AudioManager();
    this.clock = new THREE.Clock();

    // ── UI refs ───────────────────────────────────────────────
    this.overlay = document.getElementById('overlay');
    this.healthEl = document.getElementById('health');
    this.scoreEl = document.getElementById('score');
    this.messageEl = document.getElementById('message');
    this._msgTimer = null;

    // ── Pause overlay ref ────────────────────────────────────
    this.pauseOverlay = document.getElementById('pause-overlay');

    // ── Fade overlay ref ─────────────────────────────────────
    this.fadeOverlay = document.getElementById('fade-overlay');

    // ── Combo HUD ref ────────────────────────────────────────
    this.comboEl = document.getElementById('combo-display');

    // ── Screen shake ─────────────────────────────────────────
    this._shakeIntensity = 0;
    this._shakeDuration = 0;
    this._shakeTimer = 0;

    // ── Floating text pool ───────────────────────────────────
    this._floatingTexts = [];

    // ── Dust trail particles ──────────────────────────────────
    this._dustTimer = 0;

    // ── Victory fireworks state ───────────────────────────────
    this._fireworksActive = false;
    this._fireworksTimer = 0;
    this._fireworksBurstCount = 0;
    this._fireworksCenterX = 0;
    this._fireworksCenterY = 0;

    // ── State ─────────────────────────────────────────────────
    this.state = 'title'; // title | playing | gameOver | victory | paused
    this.player = null;
    this.platforms = [];
    this.enemies = [];
    this.coins = [];
    this.powerupItems = [];
    this.projectiles = [];
    this.particles = [];
    this.signs = [];
    this.boss = null;
    this.portal = null;

    // ── Background ────────────────────────────────────────────
    this.bgLayers = createBackground(this.scene);

    // ── Resize ────────────────────────────────────────────────
    window.addEventListener('resize', () => this.onResize());
    this.onResize(); // initial sizing

    // ── Music state tracking ───────────────────────────────────
    this._currentMusicTheme = null;
    this._bossArenaEntered = false;

    // ── Mute button ─────────────────────────────────────────────
    this._createMuteButton();

    // ── Auto-init audio on first user interaction ───────────────
    const initAudioOnce = () => {
      this.audio.init();
      if (this.state === 'title' && this._currentMusicTheme !== 'title') {
        this.audio.startMusic('title');
        this._currentMusicTheme = 'title';
      }
      document.removeEventListener('click', initAudioOnce);
      document.removeEventListener('keydown', initAudioOnce);
    };
    document.addEventListener('click', initAudioOnce);
    document.addEventListener('keydown', initAudioOnce);

    // ── Go ────────────────────────────────────────────────────
    this.loop();
  }

  // ════════════════════════════════════════════════════════════
  //  MUTE BUTTON (HUD top-right)
  // ════════════════════════════════════════════════════════════
  _createMuteButton() {
    const btn = document.createElement('button');
    btn.id = 'mute-btn';
    btn.textContent = '\u266A';
    btn.title = 'Toggle Music (M)';
    btn.style.cssText = `
      position: absolute; top: 8px; right: 8px; z-index: 100;
      width: 32px; height: 32px; border: 2px solid #fff;
      background: rgba(0,0,0,0.5); color: #fff; font-size: 18px;
      cursor: pointer; border-radius: 4px; line-height: 28px;
      font-family: monospace; padding: 0; text-align: center;
      image-rendering: pixelated;
    `;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.audio.init();
      const muted = this.audio.toggleMute();
      btn.textContent = muted ? '\u2716' : '\u266A';
      btn.style.opacity = muted ? '0.5' : '1';
    });
    this.container.appendChild(btn);
    this._muteBtn = btn;

    // Keyboard shortcut: M to toggle mute
    document.addEventListener('keydown', (e) => {
      if (e.key === 'm' || e.key === 'M') {
        this.audio.init();
        const muted = this.audio.toggleMute();
        btn.textContent = muted ? '\u2716' : '\u266A';
        btn.style.opacity = muted ? '0.5' : '1';
      }
    });
  }

  // ════════════════════════════════════════════════════════════
  //  INIT LEVEL
  // ════════════════════════════════════════════════════════════
  initLevel() {
    // Clear previous run
    const remove = (arr) => arr.forEach(o => {
      const m = o.mesh || o;
      if (m && m.parent) this.scene.remove(m);
    });
    remove(this.platforms);
    remove(this.enemies);
    remove(this.coins);
    remove(this.powerupItems);
    remove(this.projectiles);
    remove(this.particles);
    remove(this.signs);
    if (this.boss?.mesh) this.scene.remove(this.boss.mesh);
    if (this.portal) this.scene.remove(this.portal);
    if (this.player?.mesh) this.scene.remove(this.player.mesh);
    this.projectiles = [];
    this.particles = [];
    this.portal = null;

    // Clear floating texts
    for (const ft of this._floatingTexts) {
      if (ft.mesh && ft.mesh.parent) this.scene.remove(ft.mesh);
    }
    this._floatingTexts = [];

    // Reset VFX state
    this._shakeIntensity = 0;
    this._shakeDuration = 0;
    this._shakeTimer = 0;
    this._dustTimer = 0;
    this._fireworksActive = false;
    this._fireworksTimer = 0;
    this._fireworksBurstCount = 0;

    // Remove boss health bar if present
    const oldBar = document.getElementById('boss-health-bar');
    if (oldBar) oldBar.remove();
    const oldLabel = document.getElementById('boss-health-label');
    if (oldLabel) oldLabel.remove();

    // ── Player ────────────────────────────────────────────────
    const pm = createPlayerSprite();
    this.scene.add(pm);
    this.player = {
      x: 3, y: 2, vx: 0, vy: 0,
      width: PLAYER_WIDTH, height: PLAYER_HEIGHT,
      grounded: false,
      hp: 5, maxHp: 5, score: 0, facing: 1,
      hasGraphQL: false, graphQLTimer: 0,
      hasOAuth: false,
      speedBoost: false, speedTimer: 0,
      invincible: true, invincibleTimer: 2,
      shootCooldown: 0,
      mesh: pm,
      hitFlashTimer: 0,
      // Coyote time & jump buffering
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      // Wall slide
      wallSliding: false,
      wallDir: 0,
      // Combo system
      comboCount: 0,
      comboTimer: 0,
      // Checkpoint system
      checkpoint: { x: 3, y: 2 },
    };

    // ── Platforms ─────────────────────────────────────────────
    this.platforms = PLATFORMS.map(([x, y, w, h, type]) => {
      const mesh = createPlatformMesh(w, h, type);
      mesh.position.set(x, y, 0);
      this.scene.add(mesh);
      return { x, y, width: w, height: h, type, mesh };
    });

    // ── Enemies ───────────────────────────────────────────────
    this.enemies = ENEMIES.map(([x, y, type, patrol]) => {
      const s = ENEMY_STATS[type];
      const mesh = createEnemySprite(type, s.name);
      mesh.position.set(x, y, 0);
      this.scene.add(mesh);
      return {
        x, y, baseX: x, baseY: y, vx: 0, vy: 0,
        width: s.width, height: s.height,
        type, hp: s.hp, speed: s.speed, score: s.score,
        name: s.name, dir: 1, time: Math.random() * 6,
        minX: x - patrol / 2, maxX: x + patrol / 2,
        alive: true, mesh,
        hitFlashTimer: 0,
      };
    });

    // ── Coins ─────────────────────────────────────────────────
    this.coins = COINS.map(([x, y]) => {
      const mesh = createCoinSprite();
      mesh.position.set(x, y, 0.1);
      this.scene.add(mesh);
      return { x, y, width: 0.8, height: 0.8, collected: false, mesh, time: Math.random() * 6 };
    });

    // ── Powerups ──────────────────────────────────────────────
    this.powerupItems = POWERUPS.map(([x, y, type]) => {
      const mesh = createPowerupSprite(type);
      mesh.position.set(x, y, 0.1);
      this.scene.add(mesh);
      return { x, y, width: 1.2, height: 1.2, type, collected: false, mesh, time: Math.random() * 6 };
    });

    // ── Signs ─────────────────────────────────────────────────
    this.signs = SIGNS.map(([x, y, text]) => {
      const mesh = createSignMesh();
      mesh.position.set(x, y, -1);
      this.scene.add(mesh);
      return { x, y, text, mesh };
    });

    // ── Boss ──────────────────────────────────────────────────
    const bm = createBossSprite();
    bm.position.set(BOSS_CONFIG.x, BOSS_CONFIG.y, 0);
    this.scene.add(bm);
    this.boss = {
      x: BOSS_CONFIG.x, y: BOSS_CONFIG.y,
      width: BOSS_CONFIG.width, height: BOSS_CONFIG.height,
      hp: BOSS_CONFIG.hp, maxHp: BOSS_CONFIG.hp,
      speed: BOSS_CONFIG.speed,
      dir: -1, alive: true,
      phase: 'patrol', phaseTimer: 3,
      slamY: BOSS_CONFIG.y,
      invulnTimer: 0, mesh: bm,
      hitFlashTimer: 0,
      debrisTime: 0,
    };

    this.camera.position.set(this.player.x, 4, 5);
    this.updateHUD();
  }

  // ════════════════════════════════════════════════════════════
  //  START / RESTART
  // ════════════════════════════════════════════════════════════
  start() {
    this.audio.init();
    this.initLevel();
    this.state = 'playing';
    this._bossArenaEntered = false;
    this.overlay.style.display = 'none';
    this.messageEl.style.display = 'none';
    document.getElementById('hud').style.display = 'flex';

    // Start level music
    this.audio.startMusic('level');
    this._currentMusicTheme = 'level';

    // Fade in from title/gameover/victory
    this._fadeOut(0.5);
  }

  // ════════════════════════════════════════════════════════════
  //  MAIN LOOP
  // ════════════════════════════════════════════════════════════
  loop() {
    requestAnimationFrame(() => this.loop());
    const dt = Math.min(this.clock.getDelta(), 0.05);

    // Poll gamepad every frame
    this.input.pollGamepad();

    if (this.state === 'title' || this.state === 'gameOver' || this.state === 'victory') {
      // Start title music if not already playing
      if (this.state === 'title' && this._currentMusicTheme !== 'title' && this.audio.ctx) {
        this.audio.startMusic('title');
        this._currentMusicTheme = 'title';
      }
      if (this.input.enter) this.start();
    }

    if (this.state === 'playing') {
      // Check for pause
      if (this.input.pause) {
        this._enterPause();
      } else {
        this.updatePlaying(dt);
      }
    } else if (this.state === 'paused') {
      if (this.input.pause || this.input.enter) {
        this._exitPause();
      }
    }

    // Update fireworks even outside playing state
    if (this._fireworksActive) this._updateFireworks(dt);

    this.renderer.render(this.scene, this.camera);
  }

  // ── Pause system ────────────────────────────────────────────
  _enterPause() {
    this.state = 'paused';
    this.audio.pause();
    if (this.pauseOverlay) this.pauseOverlay.style.display = 'flex';
  }

  _exitPause() {
    this.state = 'playing';
    this.audio.pause();
    if (this.pauseOverlay) this.pauseOverlay.style.display = 'none';
    // Reset the clock delta so we don't get a huge dt spike
    this.clock.getDelta();
  }

  // ── Fade helpers ────────────────────────────────────────────
  _fadeOut(duration) {
    const el = this.fadeOverlay;
    if (!el) return;
    el.style.transition = 'none';
    el.style.opacity = '1';
    el.style.pointerEvents = 'none';
    el.style.display = 'block';
    void el.offsetWidth;
    el.style.transition = `opacity ${duration}s ease-out`;
    el.style.opacity = '0';
    setTimeout(() => { el.style.display = 'none'; }, duration * 1000);
  }

  _fadeIn(duration, delay = 0) {
    const el = this.fadeOverlay;
    if (!el) return;
    el.style.transition = 'none';
    el.style.opacity = '0';
    el.style.pointerEvents = 'none';
    el.style.display = 'block';
    setTimeout(() => {
      void el.offsetWidth;
      el.style.transition = `opacity ${duration}s ease-in`;
      el.style.opacity = '1';
    }, delay * 1000);
  }

  updatePlaying(dt) {
    this.updatePlayer(dt);
    this.updateEnemies(dt);
    this.updateBossLogic(dt);
    this.updateProjectiles(dt);
    this.updatePowerupEffects(dt);
    this.updateCollectibles(dt);
    this.updateParticles(dt);
    this.updateCamera();
    this._applyScreenShake(dt);
    this._updateFloatingTexts(dt);
    this._updateBossHealthBar();
    this._updateBossDebris(dt);
    this.updateSigns();
    this.updateHUD();
  }

  // ════════════════════════════════════════════════════════════
  //  PLAYER
  // ════════════════════════════════════════════════════════════
  updatePlayer(dt) {
    const p = this.player;
    const spd = MOVE_SPEED * (p.speedBoost ? 1.5 : 1);

    const pushingLeft  = this.input.left;
    const pushingRight = this.input.right;

    if (pushingLeft)        { p.vx = -spd; p.facing = -1; }
    else if (pushingRight)  { p.vx =  spd; p.facing =  1; }
    else                    { p.vx =  0; }

    // Coyote time
    if (p.grounded) { p.coyoteTimer = 0.08; }
    else { p.coyoteTimer -= dt; }

    // Jump buffering
    if (this.input.jump) { p.jumpBufferTimer = 0.1; }
    else { p.jumpBufferTimer -= dt; }

    // Jump execution (coyote + buffer)
    const canJump = p.grounded || p.coyoteTimer > 0;
    if (p.jumpBufferTimer > 0 && canJump) {
      p.vy = JUMP_FORCE;
      p.grounded = false;
      p.coyoteTimer = 0;
      p.jumpBufferTimer = 0;
      p.wallSliding = false;
      this.audio.jump();
    }

    // Variable jump height
    if (this.input.jumpReleased && p.vy > 0) {
      p.vy *= 0.5;
    }

    // Shoot
    if (this.input.shoot && p.hasGraphQL && p.shootCooldown <= 0) {
      this.spawnProjectile();
      p.shootCooldown = 0.2;
    }
    if (p.shootCooldown > 0) p.shootCooldown -= dt;

    // Gravity
    p.vy += GRAVITY * dt;
    if (p.vy < MAX_FALL_SPEED) p.vy = MAX_FALL_SPEED;

    // Wall slide detection
    p.wallSliding = false;
    p.wallDir = 0;

    if (!p.grounded && p.vy < 0) {
      const pushDir = pushingLeft ? -1 : pushingRight ? 1 : 0;
      if (pushDir !== 0) {
        for (const pl of this.platforms) {
          if (pl.type === 'cloud') continue;
          const hDist = Math.abs(p.x - pl.x) - (p.width + pl.width) / 2;
          const vOverlap = (p.height + pl.height) / 2 - Math.abs(p.y - pl.y);
          if (hDist < 0.15 && hDist > -0.3 && vOverlap > 0.15) {
            const wallSide = (pl.x > p.x) ? 1 : -1;
            if (pushDir === wallSide) {
              p.wallSliding = true;
              p.wallDir = wallSide;
              break;
            }
          }
        }
      }
    }

    // Apply wall slide speed cap
    if (p.wallSliding && p.vy < WALL_SLIDE_MAX_FALL) {
      p.vy = WALL_SLIDE_MAX_FALL;
      this.audio.wallSlide();
    }

    // Horizontal move + collision
    p.x += p.vx * dt;
    for (const pl of this.platforms) {
      if (pl.type === 'cloud') continue;
      if (this.overlapShrunkY(p, pl, 0.15)) {
        if (p.x > pl.x) p.x = pl.x + (pl.width + p.width) / 2;
        else             p.x = pl.x - (pl.width + p.width) / 2;
        p.vx = 0;
      }
    }

    // Vertical move + collision
    const prevY = p.y;
    p.y += p.vy * dt;
    const wasGrounded = p.grounded;
    p.grounded = false;

    for (const pl of this.platforms) {
      if (!this.overlap(p, pl)) continue;
      if (pl.type === 'cloud') {
        if (p.vy <= 0 && prevY - p.height / 2 >= pl.y + pl.height / 2 - 0.25) {
          p.y = pl.y + (pl.height + p.height) / 2;
          p.vy = 0;
          p.grounded = true;
        }
      } else {
        const dy = p.y - pl.y;
        if (dy > 0 && p.vy <= 0) {
          p.y = pl.y + (pl.height + p.height) / 2;
          p.vy = 0;
          p.grounded = true;
        } else if (dy < 0 && p.vy > 0) {
          p.y = pl.y - (pl.height + p.height) / 2;
          p.vy = 0;
        }
      }
    }

    // Landing: reset combo
    if (p.grounded && !wasGrounded) {
      if (p.comboCount > 0) {
        p.comboTimer = 0;
        p.comboCount = 0;
        this._hideCombo();
      }
    }

    // Checkpoint tracking
    for (const cpx of CHECKPOINT_POSITIONS) {
      if (p.x >= cpx && p.checkpoint.x < cpx) {
        let cpY = 2;
        for (const pl of this.platforms) {
          const leftEdge = pl.x - pl.width / 2;
          const rightEdge = pl.x + pl.width / 2;
          if (cpx >= leftEdge && cpx <= rightEdge && pl.y + pl.height / 2 < cpY + 5) {
            const surfaceY = pl.y + pl.height / 2 + p.height / 2;
            if (surfaceY > cpY - 3) cpY = surfaceY;
          }
        }
        p.checkpoint = { x: cpx, y: cpY };
        this.audio.checkpoint();
        this.showMsg('Checkpoint!', 1.5);
      }
    }

    // Combo timer decay
    if (p.comboCount > 0) {
      p.comboTimer -= dt;
      if (p.comboTimer <= 0) {
        p.comboCount = 0;
        this._hideCombo();
      }
    }

    // Fall off screen
    if (p.y < -5) { this.playerDie(); return; }
    if (p.x < 0) p.x = 0;

    // Dust trail when running on ground
    if (p.grounded && Math.abs(p.vx) > 1) {
      this._dustTimer += dt;
      if (this._dustTimer > 0.08) {
        this._dustTimer = 0;
        this._spawnDustParticle(p.x - p.facing * 0.3, p.y);
      }
    } else {
      this._dustTimer = 0;
    }

    // Update mesh
    p.mesh.position.set(p.x, p.y, 0);
    p.mesh.scale.x = p.facing;

    // Run bob
    if (p.grounded && Math.abs(p.vx) > 1) {
      p.mesh.position.y += Math.sin(Date.now() * 0.015) * 0.06;
    }

    // Hit flash
    if (p.hitFlashTimer > 0) {
      p.hitFlashTimer = this._applyHitFlash(p.mesh, p.hitFlashTimer, dt);
    }

    // Invincibility blink
    p.mesh.visible = p.invincible ? Math.floor(Date.now() / 80) % 2 === 0 : true;
  }

  // ════════════════════════════════════════════════════════════
  //  ENEMIES
  // ════════════════════════════════════════════════════════════
  updateEnemies(dt) {
    const p = this.player;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (Math.abs(e.x - p.x) > 45) continue;

      e.time += dt;
      switch (e.type) {
        case 'bug':
          e.x += e.dir * e.speed * dt;
          if (e.x < e.minX || e.x > e.maxX) e.dir *= -1;
          // Subtle bob animation for bugs
          e.mesh.position.y = e.y + Math.sin(e.time * 6) * 0.04;
          break;
        case 'monolith':
          e.x += e.dir * e.speed * dt;
          if (e.x < e.minX || e.x > e.maxX) e.dir *= -1;
          // Slow menacing bob for monoliths
          e.mesh.position.y = e.y + Math.sin(e.time * 2) * 0.06;
          break;
        case 'drama':
          e.x += e.dir * e.speed * dt;
          e.y = e.baseY + Math.sin(e.time * 2) * 1.5;
          if (e.x < e.minX || e.x > e.maxX) e.dir *= -1;
          break;
      }

      // Update position
      if (e.type === 'drama') {
        e.mesh.position.set(e.x, e.y, 0);
      } else {
        e.mesh.position.x = e.x;
      }
      e.mesh.scale.x = e.dir;

      // Counter-flip label so text stays readable when enemy faces left
      for (const child of e.mesh.children) {
        if (child.position.y > 0) child.scale.x = e.dir;
      }

      // Hit flash
      if (e.hitFlashTimer > 0) {
        e.hitFlashTimer = this._applyHitFlash(e.mesh, e.hitFlashTimer, dt);
      }

      // Collision with player
      if (this.overlap(p, e)) {
        if (p.vy < -1 && p.y > e.y + e.height * 0.2) {
          this.hurtEnemy(e, 1);
          p.vy = JUMP_FORCE * 0.65;
        } else if (!p.invincible) {
          this.playerHit(e);
        }
      }
    }
  }

  // ════════════════════════════════════════════════════════════
  //  BOSS
  // ════════════════════════════════════════════════════════════
  updateBossLogic(dt) {
    const b = this.boss;
    if (!b || !b.alive) return;
    const p = this.player;
    if (p.x < BOSS_CONFIG.arenaLeft - 5) return;

    // Switch to boss music when entering the arena
    if (!this._bossArenaEntered) {
      this._bossArenaEntered = true;
      this.audio.startMusic('boss');
      this._currentMusicTheme = 'boss';
    }

    b.phaseTimer -= dt;
    if (b.invulnTimer > 0) b.invulnTimer -= dt;

    switch (b.phase) {
      case 'patrol':
        b.x += b.dir * b.speed * dt;
        if (b.x < BOSS_CONFIG.arenaLeft + 2 || b.x > BOSS_CONFIG.arenaRight - 2) b.dir *= -1;
        b.y = BOSS_CONFIG.y;
        if (b.phaseTimer <= 0) {
          b.phase = Math.random() < 0.5 ? 'charge' : 'slam';
          b.phaseTimer = 2;
        }
        break;

      case 'charge':
        b.dir = p.x > b.x ? 1 : -1;
        b.x += b.dir * b.speed * 2.5 * dt;
        b.y = BOSS_CONFIG.y;
        if (b.phaseTimer <= 0) { b.phase = 'patrol'; b.phaseTimer = 2.5; }
        break;

      case 'slam':
        if (b.phaseTimer > 1.3) {
          b.y = BOSS_CONFIG.y + (2 - b.phaseTimer) * 6;
        } else if (b.phaseTimer > 0.9) {
          // hang at top
        } else if (b.phaseTimer > 0.3) {
          b.y = Math.max(BOSS_CONFIG.y, b.y - 28 * dt);
        } else {
          b.y = BOSS_CONFIG.y;
          this.audio.bossSlam();
          this.spawnParticles(b.x, b.y, 10, COLORS.bossRed);
          // Big screen shake on boss slam
          this.screenShake(0.35, 0.4);
          if (p.grounded && Math.abs(p.x - b.x) < 5 && !p.invincible) {
            this.playerHit(b);
          }
          b.phase = 'patrol';
          b.phaseTimer = 3;
        }
        break;
    }

    b.mesh.position.set(b.x, b.y, 0);
    b.mesh.scale.x = b.dir > 0 ? -1 : 1;
    b.mesh.visible = b.invulnTimer > 0 ? Math.floor(Date.now() / 60) % 2 === 0 : true;

    // Hit flash for boss
    if (b.hitFlashTimer > 0) {
      b.hitFlashTimer = this._applyHitFlash(b.mesh, b.hitFlashTimer, dt);
    }

    // Boss collision
    if (this.overlap(p, b) && b.invulnTimer <= 0) {
      if (p.vy < -1 && p.y > b.y + b.height * 0.3) {
        this.hurtBoss();
        p.vy = JUMP_FORCE * 0.7;
      } else if (!p.invincible) {
        this.playerHit(b);
      }
    }
  }

  hurtBoss() {
    const b = this.boss;
    b.hp--;
    b.invulnTimer = 0.5;
    b.hitFlashTimer = 0.2;
    this.audio.hit();
    this.spawnParticles(b.x, b.y + b.height / 2, 6, COLORS.bossRed);
    this.player.score += 50;
    this.spawnFloatingText(b.x, b.y + b.height / 2, '+50', 0xFF5252);
    // Medium shake when boss is hit
    this.screenShake(0.15, 0.2);

    if (b.hp <= 0) {
      b.alive = false;
      b.mesh.visible = false;
      this.audio.bossDeath();
      this.spawnParticles(b.x, b.y, 25, COLORS.gold);
      this._spawnDeathExplosion(b.x, b.y, COLORS.bossRed);
      this.player.score += 2000;
      this.spawnFloatingText(b.x, b.y, '+2000', 0xFFD700);
      // Huge screen shake on boss death
      this.screenShake(0.5, 0.8);
      // Remove boss health bar
      const bar = document.getElementById('boss-health-bar');
      if (bar) bar.remove();
      const label = document.getElementById('boss-health-label');
      if (label) label.remove();
      const portal = createPortalSprite();
      portal.position.set(b.x, 2, 0);
      this.scene.add(portal);
      this.portal = portal;
      // Victory fireworks
      this._startFireworks(b.x, b.y);
    }
    b.speed = BOSS_CONFIG.speed * (1 + (1 - b.hp / b.maxHp) * 0.8);
  }

  // ════════════════════════════════════════════════════════════
  //  PROJECTILES
  // ════════════════════════════════════════════════════════════
  updateProjectiles(dt) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      pr.x += pr.vx * dt;
      pr.life -= dt;
      pr.mesh.position.set(pr.x, pr.y, 0.1);

      for (const e of this.enemies) {
        if (e.alive && this.overlap(pr, e)) {
          this.hurtEnemy(e, 1);
          pr.life = 0;
          break;
        }
      }
      if (this.boss?.alive && this.boss.invulnTimer <= 0 && this.overlap(pr, this.boss)) {
        this.hurtBoss();
        pr.life = 0;
      }
      if (pr.life <= 0) {
        this.scene.remove(pr.mesh);
        this.projectiles.splice(i, 1);
      }
    }
  }

  spawnProjectile() {
    const p = this.player;
    const mesh = createProjectileMesh();
    const x = p.x + p.facing * 0.6;
    const y = p.y - 0.4;
    mesh.position.set(x, y, 0.1);
    this.scene.add(mesh);
    this.projectiles.push({ x, y, vx: p.facing * 18, width: 0.5, height: 0.5, life: 1.5, mesh });
    this.audio.shoot();
  }

  // ════════════════════════════════════════════════════════════
  //  POWERUP EFFECTS
  // ════════════════════════════════════════════════════════════
  updatePowerupEffects(dt) {
    const p = this.player;
    if (p.hasGraphQL)  { p.graphQLTimer -= dt;  if (p.graphQLTimer  <= 0) p.hasGraphQL  = false; }
    if (p.speedBoost)  { p.speedTimer   -= dt;  if (p.speedTimer   <= 0) p.speedBoost  = false; }
    if (p.invincible)  { p.invincibleTimer -= dt; if (p.invincibleTimer <= 0) p.invincible = false; }
  }

  // ════════════════════════════════════════════════════════════
  //  COLLECTIBLES
  // ════════════════════════════════════════════════════════════
  updateCollectibles(dt) {
    const p = this.player;

    for (const c of this.coins) {
      if (c.collected) continue;
      c.time += dt;
      c.mesh.position.y = c.y + Math.sin(c.time * 3) * 0.15;
      // Smoother coin spin using cosine for squash/stretch
      c.mesh.scale.x = Math.cos(c.time * 3);
      if (this.overlap(p, c)) {
        c.collected = true;
        c.mesh.visible = false;
        p.score += 50;
        this.audio.coin();
        this.spawnParticles(c.x, c.y, 3, COLORS.gold);
        this.spawnFloatingText(c.x, c.y, '+50', 0xFFD700);
      }
    }

    for (const pw of this.powerupItems) {
      if (pw.collected) continue;
      pw.time += dt;
      pw.mesh.position.y = pw.y + Math.sin(pw.time * 2) * 0.2;
      // Gentle pulsing scale for powerups
      const pulse = 1 + Math.sin(pw.time * 4) * 0.05;
      pw.mesh.scale.set(pulse, pulse, 1);
      if (this.overlap(p, pw)) {
        pw.collected = true;
        pw.mesh.visible = false;
        this.audio.powerup();
        this.spawnParticles(pw.x, pw.y, 5, COLORS.gold);
        this.applyPowerup(pw.type);
      }
    }

    // Portal
    if (this.portal) {
      this.portal.rotation.y += dt * 2;
      // Subtle pulsing for the portal
      const portalPulse = 1 + Math.sin(Date.now() * 0.005) * 0.08;
      this.portal.scale.set(portalPulse, portalPulse, 1);
      const pp = this.portal.position;
      if (Math.abs(p.x - pp.x) < 1.5 && Math.abs(p.y - pp.y) < 2) {
        this.triggerVictory();
      }
    }
  }

  applyPowerup(type) {
    const p = this.player;
    switch (type) {
      case 'graphql':
        p.hasGraphQL = true;
        p.graphQLTimer = 15;
        this.showMsg('GraphQL Bolt!\nPress X to shoot!', 2.5);
        break;
      case 'oauth':
        p.hasOAuth = true;
        this.showMsg('OAuth Shield!\nBlocks one hit!', 2);
        break;
      case 'ai':
        p.speedBoost = true; p.speedTimer = 10;
        p.invincible = true; p.invincibleTimer = 10;
        this.showMsg('AI Agent Power!\nSpeed + Invincibility!', 2.5);
        break;
      case 'heart':
        if (p.hp < p.maxHp) p.hp++;
        this.showMsg('Heart restored!', 1.5);
        break;
    }
  }

  // ════════════════════════════════════════════════════════════
  //  PARTICLES
  // ════════════════════════════════════════════════════════════
  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];

      // Expanding ring effect
      if (pt.isRing) {
        pt.life -= dt;
        const progress = 1 - (pt.life / pt.maxLife);
        const scale = 1 + progress * 6;
        pt.mesh.scale.set(scale, scale, 1);
        pt.mesh.material.opacity = Math.max(0, 1 - progress);
        pt.mesh.position.set(pt.x, pt.y, 0.3);
        if (pt.life <= 0) {
          this.scene.remove(pt.mesh);
          pt.mesh.material.dispose();
          pt.mesh.geometry.dispose();
          this.particles.splice(i, 1);
        }
        continue;
      }

      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy -= 15 * dt;
      pt.life -= dt;
      pt.mesh.position.set(pt.x, pt.y, 0.2);
      pt.mesh.material.opacity = Math.max(0, pt.life / pt.maxLife);
      if (pt.life <= 0) {
        this.scene.remove(pt.mesh);
        this.particles.splice(i, 1);
      }
    }
  }

  spawnParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      const mesh = createParticleMesh(color);
      mesh.position.set(x, y, 0.2);
      this.scene.add(mesh);
      const a = Math.random() * Math.PI * 2;
      const s = 3 + Math.random() * 5;
      const ml = 0.5 + Math.random() * 0.5;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s + 3,
        life: ml, maxLife: ml, mesh,
      });
    }
  }

  // ════════════════════════════════════════════════════════════
  //  CAMERA
  // ════════════════════════════════════════════════════════════
  updateCamera() {
    const p = this.player;
    const tx = p.x + p.facing * 3;
    const ty = Math.min(5.5, Math.max(4, p.y * 0.5 + 2.5));
    this.camera.position.x += (tx - this.camera.position.x) * 0.08;
    this.camera.position.y += (ty - this.camera.position.y) * 0.05;

    // Parallax
    for (const l of this.bgLayers) {
      l.mesh.position.x = l.ix + this.camera.position.x * l.speed;

      // Animate cloud drift
      if (l.type === 'cloud' && l.driftSpeed) {
        l.mesh.position.y += Math.sin(Date.now() * 0.001 * l.driftSpeed + l.driftOffset) * 0.001;
      }
    }
  }

  // ════════════════════════════════════════════════════════════
  //  SIGNS
  // ════════════════════════════════════════════════════════════
  updateSigns() {
    const p = this.player;
    let near = null;
    for (const s of this.signs) {
      if (Math.abs(p.x - s.x) < 2.5 && Math.abs(p.y - s.y) < 3) { near = s; break; }
    }
    if (near) {
      this.messageEl.textContent = near.text;
      this.messageEl.style.display = 'block';
    } else if (!this._msgTimer) {
      this.messageEl.style.display = 'none';
    }
  }

  // ════════════════════════════════════════════════════════════
  //  HUD
  // ════════════════════════════════════════════════════════════
  updateHUD() {
    const p = this.player;
    let h = '';
    for (let i = 0; i < p.maxHp; i++) {
      h += `<span class="heart ${i < p.hp ? 'full' : 'empty'}"></span>`;
    }
    this.healthEl.innerHTML = h;

    let s = `SCORE: ${p.score}`;
    if (p.hasGraphQL) s += ` | GQL ${Math.ceil(p.graphQLTimer)}s`;
    if (p.speedBoost) s += ` | AI ${Math.ceil(p.speedTimer)}s`;
    if (p.hasOAuth) s += ' | SHIELD';
    this.scoreEl.textContent = s;
  }

  // ════════════════════════════════════════════════════════════
  //  COMBO SYSTEM
  // ════════════════════════════════════════════════════════════
  _incrementCombo(baseScore) {
    const p = this.player;
    p.comboCount++;
    p.comboTimer = 3;

    if (p.comboCount >= 2) {
      const multiplier = p.comboCount;
      const bonus = baseScore * (multiplier - 1);
      p.score += bonus;
      this.audio.combo(p.comboCount);
      this._showCombo(multiplier);
    }
  }

  _showCombo(multiplier) {
    if (!this.comboEl) return;
    this.comboEl.textContent = `${multiplier}x COMBO!`;
    this.comboEl.style.display = 'block';
    this.comboEl.style.opacity = '1';
    this.comboEl.style.transform = 'translate(-50%, -50%) scale(1.3)';
    requestAnimationFrame(() => {
      this.comboEl.style.transition = 'transform 0.2s ease-out, opacity 0.8s ease-out 1.5s';
      this.comboEl.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  }

  _hideCombo() {
    if (!this.comboEl) return;
    this.comboEl.style.opacity = '0';
    setTimeout(() => {
      if (this.comboEl && this.comboEl.style.opacity === '0') {
        this.comboEl.style.display = 'none';
      }
    }, 300);
  }

  // ════════════════════════════════════════════════════════════
  //  SCREEN SHAKE
  // ════════════════════════════════════════════════════════════
  screenShake(intensity, duration) {
    if (intensity > this._shakeIntensity * (this._shakeTimer / (this._shakeDuration || 1))) {
      this._shakeIntensity = intensity;
      this._shakeDuration = duration;
      this._shakeTimer = duration;
    }
  }

  _applyScreenShake(dt) {
    if (this._shakeTimer > 0) {
      this._shakeTimer -= dt;
      const t = Math.max(0, this._shakeTimer / this._shakeDuration);
      const mag = this._shakeIntensity * t;
      this.camera.position.x += (Math.random() - 0.5) * mag;
      this.camera.position.y += (Math.random() - 0.5) * mag;
      if (this._shakeTimer <= 0) {
        this._shakeIntensity = 0;
        this._shakeDuration = 0;
      }
    }
  }

  // ════════════════════════════════════════════════════════════
  //  FLOATING SCORE TEXT
  // ════════════════════════════════════════════════════════════
  spawnFloatingText(x, y, text, color = 0xFFD700) {
    const cw = Math.max(64, text.length * 8);
    const ch = 16;
    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');
    const hexColor = '#' + color.toString(16).padStart(6, '0');
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    // Text outline for readability
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText(text, cw / 2, ch / 2 + 4);
    ctx.fillStyle = hexColor;
    ctx.fillText(text, cw / 2, ch / 2 + 4);
    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(cw / 32, ch / 32),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false })
    );
    mesh.position.set(x, y + 0.5, 0.5);
    mesh.renderOrder = 999;
    this.scene.add(mesh);
    this._floatingTexts.push({ mesh, x, y: y + 0.5, vy: 3, life: 1.0, maxLife: 1.0 });
  }

  _updateFloatingTexts(dt) {
    for (let i = this._floatingTexts.length - 1; i >= 0; i--) {
      const ft = this._floatingTexts[i];
      ft.life -= dt;
      ft.y += ft.vy * dt;
      ft.vy *= 0.96;
      ft.mesh.position.set(ft.x, ft.y, 0.5);
      const alpha = Math.max(0, ft.life / ft.maxLife);
      ft.mesh.material.opacity = alpha;
      // Scale up slightly as it fades
      const scale = 1 + (1 - alpha) * 0.3;
      ft.mesh.scale.set(scale, scale, 1);
      if (ft.life <= 0) {
        this.scene.remove(ft.mesh);
        ft.mesh.material.dispose();
        ft.mesh.geometry.dispose();
        this._floatingTexts.splice(i, 1);
      }
    }
  }

  // ════════════════════════════════════════════════════════════
  //  BOSS HEALTH BAR (HTML overlay)
  // ════════════════════════════════════════════════════════════
  _updateBossHealthBar() {
    const b = this.boss;
    if (!b) return;
    let bar = document.getElementById('boss-health-bar');
    if (b.alive && this._bossArenaEntered) {
      if (!bar) {
        bar = document.createElement('div');
        bar.id = 'boss-health-bar';
        bar.style.cssText = `
          position:absolute; bottom:16px; left:50%; transform:translateX(-50%);
          width:60%; max-width:400px; height:14px; background:rgba(0,0,0,0.7);
          border:2px solid #D32F2F; border-radius:3px; z-index:11; overflow:hidden;
        `;
        bar.innerHTML = `
          <div id="boss-hp-fill" style="height:100%;background:#D32F2F;transition:width 0.3s"></div>
        `;
        const label = document.createElement('div');
        label.style.cssText = `
          position:absolute; bottom:32px; left:50%; transform:translateX(-50%);
          font-family:'Press Start 2P',monospace; font-size:8px; color:#D32F2F;
          text-shadow:1px 1px 0 #000; z-index:11; white-space:nowrap;
        `;
        label.id = 'boss-health-label';
        label.textContent = 'THE MONOLITH';
        this.container.appendChild(label);
        this.container.appendChild(bar);
      }
      const fill = document.getElementById('boss-hp-fill');
      if (fill) {
        const pct = Math.max(0, (b.hp / b.maxHp) * 100);
        fill.style.width = `${pct}%`;
        // Color changes as HP drops
        if (pct > 60) fill.style.background = '#D32F2F';
        else if (pct > 30) fill.style.background = '#FF6F00';
        else fill.style.background = '#FF1744';
      }
    } else if (bar) {
      bar.remove();
      const label = document.getElementById('boss-health-label');
      if (label) label.remove();
    }
  }

  // ════════════════════════════════════════════════════════════
  //  HIT FLASH HELPER
  // ════════════════════════════════════════════════════════════
  _applyHitFlash(mesh, timer, dt) {
    if (timer > 0) {
      const flashOn = Math.floor(timer * 20) % 2 === 0;
      mesh.traverse((child) => {
        if (child.isMesh && child.material) {
          if (flashOn) {
            if (!child.userData._origColor) {
              child.userData._origColor = child.material.color.getHex();
            }
            child.material.color.setHex(0xffffff);
          } else {
            if (child.userData._origColor !== undefined) {
              child.material.color.setHex(child.userData._origColor);
            }
          }
        }
      });
      return timer - dt;
    }
    // Restore original colors
    mesh.traverse((child) => {
      if (child.isMesh && child.material && child.userData._origColor !== undefined) {
        child.material.color.setHex(child.userData._origColor);
        delete child.userData._origColor;
      }
    });
    return 0;
  }

  // ════════════════════════════════════════════════════════════
  //  DUST TRAIL PARTICLES
  // ════════════════════════════════════════════════════════════
  _spawnDustParticle(x, y) {
    const mesh = createParticleMesh(0x8B7355);
    mesh.position.set(x, y - 0.8, 0.05);
    mesh.scale.set(0.5, 0.5, 1);
    this.scene.add(mesh);
    const ml = 0.3 + Math.random() * 0.2;
    this.particles.push({
      x: x + (Math.random() - 0.5) * 0.3,
      y: y - 0.8,
      vx: (Math.random() - 0.5) * 1.5,
      vy: 1 + Math.random() * 1.5,
      life: ml,
      maxLife: ml,
      mesh,
    });
  }

  // ════════════════════════════════════════════════════════════
  //  DEATH EXPLOSION RING
  // ════════════════════════════════════════════════════════════
  _spawnDeathExplosion(x, y, color) {
    const ringTex = this._createRingTexture(color);
    const ringMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.5),
      new THREE.MeshBasicMaterial({ map: ringTex, transparent: true, depthTest: false })
    );
    ringMesh.position.set(x, y, 0.3);
    ringMesh.renderOrder = 100;
    this.scene.add(ringMesh);

    this.particles.push({
      x, y,
      vx: 0, vy: 0,
      life: 0.5,
      maxLife: 0.5,
      mesh: ringMesh,
      isRing: true,
    });
  }

  _createRingTexture(color) {
    const c = document.createElement('canvas');
    c.width = 32; c.height = 32;
    const ctx = c.getContext('2d');
    const hexColor = typeof color === 'number'
      ? '#' + color.toString(16).padStart(6, '0')
      : color;
    ctx.strokeStyle = hexColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(16, 16, 12, 0, Math.PI * 2);
    ctx.stroke();
    const grd = ctx.createRadialGradient(16, 16, 6, 16, 16, 14);
    grd.addColorStop(0, 'rgba(255,255,255,0.3)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grd;
    ctx.fill();
    const t = new THREE.CanvasTexture(c);
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    return t;
  }

  // ════════════════════════════════════════════════════════════
  //  BOSS DEBRIS ANIMATION
  // ════════════════════════════════════════════════════════════
  _updateBossDebris(dt) {
    const b = this.boss;
    if (!b || !b.alive) return;
    b.debrisTime += dt;
    b.mesh.traverse((child) => {
      if (child.userData.debrisIndex !== undefined) {
        const idx = child.userData.debrisIndex;
        const baseAngle = child.userData.debrisAngle;
        const radius = child.userData.debrisRadius;
        const angle = baseAngle + b.debrisTime * (0.8 + idx * 0.15);
        const bobY = Math.sin(b.debrisTime * 2 + idx) * 0.3;
        child.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * 1.2 + bobY,
          0.1
        );
        child.rotation.z = b.debrisTime * 2;
        const hpRatio = b.hp / b.maxHp;
        child.material.opacity = 0.3 + (1 - hpRatio) * 0.5;
      }
    });
  }

  // ════════════════════════════════════════════════════════════
  //  VICTORY FIREWORKS
  // ════════════════════════════════════════════════════════════
  _startFireworks(x, y) {
    this._fireworksActive = true;
    this._fireworksTimer = 0;
    this._fireworksCenterX = x;
    this._fireworksCenterY = y;
    this._fireworksBurstCount = 0;
  }

  _updateFireworks(dt) {
    this._fireworksTimer += dt;
    const burstInterval = 0.4;
    const totalBursts = 12;
    const expectedBursts = Math.floor(this._fireworksTimer / burstInterval);
    while (this._fireworksBurstCount < expectedBursts && this._fireworksBurstCount < totalBursts) {
      this._fireworksBurstCount++;
      const fx = this._fireworksCenterX + (Math.random() - 0.5) * 10;
      const fy = this._fireworksCenterY + 2 + Math.random() * 6;
      const fireworkColors = [
        COLORS.gold, COLORS.drupalBlue, COLORS.powerPink,
        COLORS.powerGreen, COLORS.shieldBlue, 0xFF6F00,
        0x9C27B0, 0x00BCD4,
      ];
      const color = fireworkColors[this._fireworksBurstCount % fireworkColors.length];
      this._spawnFireworkBurst(fx, fy, color);
    }
    if (this._fireworksTimer > totalBursts * burstInterval + 1) {
      this._fireworksActive = false;
    }
  }

  _spawnFireworkBurst(x, y, color) {
    const count = 16 + Math.floor(Math.random() * 8);
    for (let i = 0; i < count; i++) {
      const mesh = createParticleMesh(color);
      mesh.position.set(x, y, 0.3);
      this.scene.add(mesh);
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
      const speed = 4 + Math.random() * 6;
      const ml = 0.6 + Math.random() * 0.6;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: ml,
        maxLife: ml,
        mesh,
      });
    }
    this.screenShake(0.08, 0.15);
  }

  // ════════════════════════════════════════════════════════════
  //  DAMAGE
  // ════════════════════════════════════════════════════════════
  playerHit(source) {
    const p = this.player;
    if (p.invincible) return;

    if (p.hasOAuth) {
      p.hasOAuth = false;
      p.invincible = true;
      p.invincibleTimer = 1;
      p.hitFlashTimer = 0.15;
      this.audio.hit();
      this.showMsg('Shield absorbed hit!', 1.2);
      this.screenShake(0.1, 0.15);
      return;
    }

    p.hp--;
    p.invincible = true;
    p.invincibleTimer = 1.5;
    p.hitFlashTimer = 0.2;

    // Directional knockback
    if (source) {
      const knockDir = (p.x >= source.x) ? 1 : -1;
      p.vx = knockDir * MOVE_SPEED * 1.2;
      p.vy = JUMP_FORCE * 0.5;
    } else {
      p.vy = JUMP_FORCE * 0.5;
    }

    this.audio.hit();
    this.spawnParticles(p.x, p.y, 5, COLORS.heartRed);
    // Medium screen shake when player takes hit
    this.screenShake(0.25, 0.3);

    // Reset combo on getting hit
    p.comboCount = 0;
    p.comboTimer = 0;
    this._hideCombo();

    if (p.hp <= 0) this.playerDie();
  }

  playerDie() {
    const p = this.player;

    // Check if we have a checkpoint to respawn at
    if (p.checkpoint.x > 3) {
      p.hp = p.maxHp;
      p.x = p.checkpoint.x;
      p.y = p.checkpoint.y;
      p.vx = 0;
      p.vy = 0;
      p.grounded = false;
      p.invincible = true;
      p.invincibleTimer = 2;
      p.mesh.visible = true;
      p.comboCount = 0;
      p.comboTimer = 0;
      this._hideCombo();
      this.camera.position.set(p.x, 4, 5);
      this.audio.hit();
      this.showMsg('Checkpoint!', 1.5);
      p.score = Math.max(0, p.score - 200);
      return;
    }

    this.state = 'gameOver';
    this.audio.stopMusic();
    this._currentMusicTheme = null;
    this.audio.gameOver();
    this.spawnParticles(p.x, p.y, 15, COLORS.drupalBlue);
    this._spawnDeathExplosion(p.x, p.y, COLORS.drupalBlue);
    p.mesh.visible = false;

    // Remove boss health bar
    const bar = document.getElementById('boss-health-bar');
    if (bar) bar.remove();
    const label = document.getElementById('boss-health-label');
    if (label) label.remove();

    this._fadeIn(0.3);

    this.overlay.innerHTML = `
      <h1>GAME OVER</h1>
      <p>Score: ${p.score}</p>
      <p style="margin-top:14px;color:#87CEEB">The Composable Web awaits...</p>
      <p class="start-hint">PRESS ENTER TO RETRY</p>
    `;
    this.overlay.style.display = 'flex';
  }

  triggerVictory() {
    this.state = 'victory';
    this.audio.stopMusic();
    this.audio.startMusic('victory');
    this._currentMusicTheme = 'victory';

    this._fadeIn(0.3, 0.3);

    this.overlay.innerHTML = `
      <h1>SITE DEPLOYED!</h1>
      <p style="color:#4CAF50;font-size:14px">100% Ready to Ship</p>
      <p style="margin-top:16px">Score: ${this.player.score}</p>
      <br>
      <p style="color:#87CEEB">The AI-Agent-Friendly Headless CMS</p>
      <p style="color:#FFD700;margin-top:4px">decoupled.io</p>
      <br>
      <p>Lightning Fast &bull; Zero DevOps Drama</p>
      <p>No Lock-In &bull; Human Support</p>
      <p style="margin-top:8px">Next.js 15 &bull; GraphQL &bull; OAuth</p>
      <p>23 MCP Tools &bull; AI-First Dev</p>
      <p class="start-hint" style="margin-top:24px">PRESS ENTER TO PLAY AGAIN</p>
    `;
    this.overlay.style.display = 'flex';
  }

  // ════════════════════════════════════════════════════════════
  //  ENEMY HELPERS
  // ════════════════════════════════════════════════════════════
  hurtEnemy(e, dmg) {
    e.hp -= dmg;
    e.hitFlashTimer = 0.15;
    this.audio.enemyDeath();
    this.spawnParticles(e.x, e.y, 5, COLORS.enemyRed);
    if (e.hp <= 0) {
      e.alive = false;
      e.mesh.visible = false;
      this.player.score += e.score;
      this._incrementCombo(e.score);
      this.showMsg(`Defeated: ${e.name}!`, 1.5);
      this.spawnFloatingText(e.x, e.y, `+${e.score}`, 0xFF5252);
      // Death explosion ring
      this._spawnDeathExplosion(e.x, e.y, COLORS.enemyRed);
      // Small screen shake when enemy dies
      this.screenShake(0.1, 0.15);
    }
  }

  // ════════════════════════════════════════════════════════════
  //  COLLISION HELPERS
  // ════════════════════════════════════════════════════════════
  overlap(a, b) {
    return (
      Math.abs(a.x - b.x) < (a.width + b.width) / 2 &&
      Math.abs(a.y - b.y) < (a.height + b.height) / 2
    );
  }

  overlapShrunkY(a, b, margin) {
    return (
      Math.abs(a.x - b.x) < (a.width + b.width) / 2 &&
      Math.abs(a.y - b.y) < (a.height + b.height) / 2 - margin
    );
  }

  // ════════════════════════════════════════════════════════════
  //  UI HELPERS
  // ════════════════════════════════════════════════════════════
  showMsg(text, dur = 2) {
    this.messageEl.textContent = text;
    this.messageEl.style.display = 'block';
    clearTimeout(this._msgTimer);
    this._msgTimer = setTimeout(() => {
      this.messageEl.style.display = 'none';
      this._msgTimer = null;
    }, dur * 1000);
  }

  // ════════════════════════════════════════════════════════════
  //  RESIZE
  // ════════════════════════════════════════════════════════════
  onResize() {
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const winAspect = winW / winH;

    let w, h;
    if (winAspect > this.gameAspect) {
      h = winH;
      w = Math.floor(h * this.gameAspect);
    } else {
      w = winW;
      h = Math.floor(w / this.gameAspect);
    }

    this.container.style.width  = w + 'px';
    this.container.style.height = h + 'px';
    this.container.style.left   = Math.floor((winW - w) / 2) + 'px';
    this.container.style.top    = Math.floor((winH - h) / 2) + 'px';

    this.renderer.setSize(w, h);
  }
}
