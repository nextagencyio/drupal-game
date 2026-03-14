export class InputHandler {
  constructor() {
    this.keys = {};
    this._justPressed = {};
    this._justReleased = {};

    // ── Keyboard ────────────────────────────────────────────────
    window.addEventListener('keydown', (e) => {
      if (!this.keys[e.code]) this._justPressed[e.code] = true;
      this.keys[e.code] = true;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      this._justReleased[e.code] = true;
    });

    // ── Touch controls ──────────────────────────────────────────
    this._touchActive = {};
    this._isTouchDevice = ('ontouchstart' in window) ||
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

    if (this._isTouchDevice) {
      this._initTouchControls();
    }

    // ── Gamepad ─────────────────────────────────────────────────
    this._gamepadConnected = false;
    this._prevGamepadButtons = {};
    window.addEventListener('gamepadconnected', () => { this._gamepadConnected = true; });
    window.addEventListener('gamepaddisconnected', () => { this._gamepadConnected = false; });
  }

  // ── Touch setup ─────────────────────────────────────────────────
  _initTouchControls() {
    const controls = document.getElementById('touch-controls');
    if (!controls) return;
    controls.style.display = 'flex';

    const bindings = {
      'btn-left':  'ArrowLeft',
      'btn-right': 'ArrowRight',
      'btn-jump':  'Space',
      'btn-shoot': 'KeyX',
    };

    // Also allow tapping the overlay to start (acts as Enter)
    const overlay = document.getElementById('overlay');
    if (overlay) {
      overlay.addEventListener('touchstart', (e) => {
        // Only handle if overlay is visible
        if (overlay.style.display !== 'none') {
          e.preventDefault();
          this._justPressed['Enter'] = true;
          this.keys['Enter'] = true;
          // Release after short delay
          setTimeout(() => { this.keys['Enter'] = false; }, 100);
        }
      }, { passive: false });
    }

    for (const [btnId, keyCode] of Object.entries(bindings)) {
      const btn = document.getElementById(btnId);
      if (!btn) continue;

      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!this.keys[keyCode]) this._justPressed[keyCode] = true;
        this.keys[keyCode] = true;
        this._touchActive[btnId] = true;
        btn.classList.add('active');
      }, { passive: false });

      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.keys[keyCode] = false;
        this._justReleased[keyCode] = true;
        this._touchActive[btnId] = false;
        btn.classList.remove('active');
      }, { passive: false });

      btn.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.keys[keyCode] = false;
        this._justReleased[keyCode] = true;
        this._touchActive[btnId] = false;
        btn.classList.remove('active');
      }, { passive: false });

      // Prevent contextmenu on long press
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    // Prevent page scroll/zoom when touching game area
    const container = document.getElementById('game-container');
    if (container) {
      container.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    }
  }

  // ── Gamepad polling ─────────────────────────────────────────────
  pollGamepad() {
    if (!this._gamepadConnected) return;
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0];
    if (!gp) return;

    // D-pad or left stick
    const deadzone = 0.3;
    const axisX = gp.axes[0] || 0;
    const axisY = gp.axes[1] || 0;

    // Left
    const gpLeft = axisX < -deadzone || (gp.buttons[14] && gp.buttons[14].pressed);
    this.keys['GamepadLeft'] = gpLeft;

    // Right
    const gpRight = axisX > deadzone || (gp.buttons[15] && gp.buttons[15].pressed);
    this.keys['GamepadRight'] = gpRight;

    // Buttons - standard gamepad layout
    // A (index 0) = Jump, B (index 1) = Shoot, X (index 2) = Shoot
    // Start (index 9) = Enter/Pause
    const buttonMap = {
      0: 'GamepadA',     // A - Jump
      1: 'GamepadB',     // B - Shoot
      2: 'GamepadX',     // X - Shoot
      9: 'GamepadStart', // Start - Enter/Pause
      12: 'GamepadUp',   // D-pad up - Jump
    };

    for (const [idx, name] of Object.entries(buttonMap)) {
      const btn = gp.buttons[idx];
      if (!btn) continue;
      const wasDown = this._prevGamepadButtons[name];
      if (btn.pressed && !wasDown) {
        this._justPressed[name] = true;
      }
      if (!btn.pressed && wasDown) {
        this._justReleased[name] = true;
      }
      this.keys[name] = btn.pressed;
      this._prevGamepadButtons[name] = btn.pressed;
    }
  }

  // ── Query helpers ───────────────────────────────────────────────
  isDown(code) { return !!this.keys[code]; }

  wasPressed(code) {
    if (this._justPressed[code]) {
      this._justPressed[code] = false;
      return true;
    }
    return false;
  }

  wasReleased(code) {
    if (this._justReleased[code]) {
      this._justReleased[code] = false;
      return true;
    }
    return false;
  }

  // ── Semantic accessors ──────────────────────────────────────────
  get left() {
    return this.isDown('ArrowLeft') || this.isDown('KeyA') || this.isDown('GamepadLeft');
  }

  get right() {
    return this.isDown('ArrowRight') || this.isDown('KeyD') || this.isDown('GamepadRight');
  }

  get jump() {
    return this.wasPressed('Space') || this.wasPressed('ArrowUp') ||
           this.wasPressed('KeyW') || this.wasPressed('GamepadA') ||
           this.wasPressed('GamepadUp');
  }

  get jumpReleased() {
    return this.wasReleased('Space') || this.wasReleased('ArrowUp') ||
           this.wasReleased('KeyW') || this.wasReleased('GamepadA') ||
           this.wasReleased('GamepadUp');
  }

  get shoot() {
    return this.wasPressed('KeyX') || this.wasPressed('ShiftLeft') ||
           this.wasPressed('ShiftRight') || this.wasPressed('GamepadB') ||
           this.wasPressed('GamepadX');
  }

  get enter() {
    return this.wasPressed('Enter') || this.wasPressed('NumpadEnter') ||
           this.wasPressed('GamepadStart');
  }

  get pause() {
    return this.wasPressed('Escape') || this.wasPressed('GamepadStart');
  }
}
