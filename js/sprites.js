import * as THREE from 'three';
import { COLORS } from './config.js';

const hex = (c) => '#' + c.toString(16).padStart(6, '0');

function tex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  return t;
}

// ── Player (Drupal Drop head + body + cape + glow) ────────────
export function createPlayerSprite() {
  const t = tex(48, 56, (ctx) => {
    // Cape / scarf flowing behind (drawn first so body covers front)
    ctx.fillStyle = '#C62828';
    ctx.beginPath();
    ctx.moveTo(14, 30);
    ctx.quadraticCurveTo(6, 38, 4, 50);
    ctx.lineTo(8, 52);
    ctx.quadraticCurveTo(10, 42, 16, 33);
    ctx.closePath();
    ctx.fill();
    // Cape second flap
    ctx.fillStyle = '#B71C1C';
    ctx.beginPath();
    ctx.moveTo(12, 32);
    ctx.quadraticCurveTo(3, 42, 2, 54);
    ctx.lineTo(6, 53);
    ctx.quadraticCurveTo(7, 43, 14, 34);
    ctx.closePath();
    ctx.fill();
    // Cape highlight
    ctx.fillStyle = '#E53935';
    ctx.beginPath();
    ctx.moveTo(14, 31);
    ctx.quadraticCurveTo(9, 36, 7, 44);
    ctx.lineTo(9, 43);
    ctx.quadraticCurveTo(11, 36, 15, 32);
    ctx.closePath();
    ctx.fill();

    // Subtle glow around head
    const glowGrd = ctx.createRadialGradient(24, 18, 6, 24, 18, 18);
    glowGrd.addColorStop(0, 'rgba(6,120,190,0.25)');
    glowGrd.addColorStop(0.6, 'rgba(6,120,190,0.08)');
    glowGrd.addColorStop(1, 'rgba(6,120,190,0)');
    ctx.fillStyle = glowGrd;
    ctx.fillRect(0, 0, 48, 40);

    // Drupal drop head
    ctx.fillStyle = hex(COLORS.drupalBlue);
    ctx.beginPath();
    ctx.moveTo(24, 2);
    ctx.bezierCurveTo(32, 12, 36, 22, 32, 30);
    ctx.bezierCurveTo(30, 34, 18, 34, 16, 30);
    ctx.bezierCurveTo(12, 22, 16, 12, 24, 2);
    ctx.fill();
    // Head outline
    ctx.strokeStyle = hex(COLORS.drupalDark);
    ctx.lineWidth = 1;
    ctx.stroke();
    // Head highlight
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.moveTo(24, 5);
    ctx.bezierCurveTo(20, 12, 18, 18, 19, 24);
    ctx.lineTo(22, 22);
    ctx.bezierCurveTo(21, 16, 22, 10, 24, 5);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(19, 18, 4, 5);
    ctx.fillRect(27, 18, 4, 5);
    ctx.fillStyle = hex(COLORS.drupalDark);
    ctx.fillRect(21, 20, 2, 3);
    ctx.fillRect(29, 20, 2, 3);
    // Eye shine
    ctx.fillStyle = '#fff';
    ctx.fillRect(21, 20, 1, 1);
    ctx.fillRect(29, 20, 1, 1);

    // Smile
    ctx.fillStyle = '#fff';
    ctx.fillRect(21, 27, 2, 1);
    ctx.fillRect(23, 28, 4, 1);
    ctx.fillRect(27, 27, 2, 1);

    // Body (torso)
    ctx.fillStyle = '#444';
    ctx.fillRect(18, 33, 12, 8);
    // Belt
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(17, 39, 14, 2);
    // Belt buckle
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(22, 39, 4, 2);
    ctx.fillStyle = '#B8860B';
    ctx.fillRect(23, 39, 2, 2);
    // Arms
    ctx.fillStyle = '#555';
    ctx.fillRect(14, 34, 5, 5);
    ctx.fillRect(29, 34, 5, 5);
    // Arm detail (gloves)
    ctx.fillStyle = '#666';
    ctx.fillRect(14, 37, 4, 2);
    ctx.fillRect(30, 37, 4, 2);

    // Legs
    ctx.fillStyle = '#333';
    ctx.fillRect(19, 41, 4, 6);
    ctx.fillRect(25, 41, 4, 6);

    // Boots
    ctx.fillStyle = '#5D2F0E';
    ctx.fillRect(18, 46, 5, 4);
    ctx.fillRect(25, 46, 5, 4);
    // Boot soles
    ctx.fillStyle = '#3E1F08';
    ctx.fillRect(17, 49, 6, 2);
    ctx.fillRect(25, 49, 6, 2);
    // Boot highlights
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(19, 46, 3, 1);
    ctx.fillRect(26, 46, 3, 1);
    // Boot straps
    ctx.fillStyle = hex(COLORS.drupalBlue);
    ctx.fillRect(18, 47, 5, 1);
    ctx.fillRect(25, 47, 5, 1);
  });
  const g = new THREE.Group();
  g.add(new THREE.Mesh(
    new THREE.PlaneGeometry(2.0, 3.0),
    new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.1 })
  ));
  return g;
}

// ── Platforms ─────────────────────────────────────────────────
export function createPlatformMesh(w, h, type) {
  const cw = Math.max(16, Math.round(w * 8));
  const ch = Math.max(8, Math.round(h * 16));
  const t = tex(cw, ch, (ctx) => {
    switch (type) {
      case 'grass':
        ctx.fillStyle = hex(COLORS.dirt);
        ctx.fillRect(0, 0, cw, ch);
        ctx.fillStyle = hex(COLORS.grass);
        ctx.fillRect(0, 0, cw, Math.ceil(ch * 0.35));
        ctx.fillStyle = hex(COLORS.grassDark);
        for (let x = 0; x < cw; x += 4) ctx.fillRect(x, Math.ceil(ch * 0.3), 2, 2);
        break;
      case 'api':
        ctx.fillStyle = hex(COLORS.apiBlock);
        ctx.fillRect(0, 0, cw, ch);
        ctx.fillStyle = hex(COLORS.apiLight);
        ctx.fillRect(1, 1, cw - 2, 2);
        ctx.font = `${Math.max(6, ch - 2)}px monospace`;
        ctx.fillStyle = '#7986CB';
        ctx.textAlign = 'center';
        ctx.fillText('{ }', cw / 2, ch - 2);
        break;
      case 'cloud':
        ctx.fillStyle = hex(COLORS.cloud);
        ctx.beginPath();
        ctx.ellipse(cw / 2, ch / 2, cw / 2, ch / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = hex(COLORS.cloudShadow);
        ctx.beginPath();
        ctx.ellipse(cw / 2, ch * 0.68, cw * 0.4, ch * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'stone':
        ctx.fillStyle = hex(COLORS.stone);
        ctx.fillRect(0, 0, cw, ch);
        ctx.fillStyle = hex(COLORS.stoneDark);
        for (let x = 0; x < cw; x += 8) ctx.fillRect(x, 0, 1, ch);
        ctx.fillRect(0, Math.floor(ch / 2), cw, 1);
        break;
    }
  });
  return new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: t, transparent: type === 'cloud' })
  );
}

// ── Enemies ──────────────────────────────────────────────────
export function createEnemySprite(type, label) {
  const g = new THREE.Group();
  let t;
  switch (type) {
    case 'bug':
      t = tex(24, 20, (ctx) => {
        // Multi-segmented body - abdomen
        ctx.fillStyle = '#B71C1C';
        ctx.beginPath();
        ctx.ellipse(12, 13, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Body segments (lines across abdomen)
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(8, 11); ctx.lineTo(16, 11); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(7, 13); ctx.lineTo(17, 13); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(8, 15); ctx.lineTo(16, 15); ctx.stroke();

        // Thorax (middle)
        ctx.fillStyle = hex(COLORS.enemyRed);
        ctx.beginPath();
        ctx.ellipse(12, 8, 5, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#C62828';
        ctx.beginPath();
        ctx.ellipse(12, 4, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glowing red eyes
        ctx.fillStyle = '#FF1744';
        ctx.fillRect(9, 3, 2, 2);
        ctx.fillRect(13, 3, 2, 2);
        // Eye glow
        ctx.fillStyle = '#FF5252';
        ctx.fillRect(10, 3, 1, 1);
        ctx.fillRect(14, 3, 1, 1);
        // Eye bright center
        ctx.fillStyle = '#fff';
        ctx.fillRect(10, 3, 1, 1);
        ctx.fillRect(14, 3, 1, 1);

        // Antennae (twitchy look via zigzag)
        ctx.strokeStyle = '#B71C1C';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(10, 2);
        ctx.lineTo(8, 0);
        ctx.lineTo(6, 1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(14, 2);
        ctx.lineTo(16, 0);
        ctx.lineTo(18, 1);
        ctx.stroke();
        // Antennae tips (dots)
        ctx.fillStyle = '#FF1744';
        ctx.fillRect(5, 0, 2, 2);
        ctx.fillRect(17, 0, 2, 2);

        // Legs (6 legs, 3 per side)
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          const ly = 8 + i * 3;
          // Left legs
          ctx.beginPath();
          ctx.moveTo(7, ly);
          ctx.lineTo(3, ly + 2);
          ctx.lineTo(1, ly + 1);
          ctx.stroke();
          // Right legs
          ctx.beginPath();
          ctx.moveTo(17, ly);
          ctx.lineTo(21, ly + 2);
          ctx.lineTo(23, ly + 1);
          ctx.stroke();
        }

        // Mandibles
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(8, 6, 2, 1);
        ctx.fillRect(14, 6, 2, 1);
      });
      break;

    case 'monolith':
      t = tex(32, 40, (ctx) => {
        // Main body
        ctx.fillStyle = '#616161';
        ctx.fillRect(4, 2, 24, 36);
        // Dark edges
        ctx.fillStyle = '#424242';
        ctx.fillRect(4, 2, 24, 3);
        ctx.fillRect(4, 35, 24, 3);
        ctx.fillRect(4, 2, 3, 36);
        ctx.fillRect(25, 2, 3, 36);

        // Pulsing red cracks
        ctx.strokeStyle = '#D32F2F';
        ctx.lineWidth = 1;
        // Left crack
        ctx.beginPath();
        ctx.moveTo(8, 10);
        ctx.lineTo(10, 14);
        ctx.lineTo(8, 18);
        ctx.lineTo(11, 22);
        ctx.lineTo(9, 26);
        ctx.stroke();
        // Right crack
        ctx.beginPath();
        ctx.moveTo(24, 12);
        ctx.lineTo(22, 16);
        ctx.lineTo(25, 20);
        ctx.lineTo(22, 24);
        ctx.stroke();
        // Center crack
        ctx.beginPath();
        ctx.moveTo(16, 28);
        ctx.lineTo(14, 32);
        ctx.lineTo(16, 35);
        ctx.stroke();
        // Crack glow (wider faint lines)
        ctx.strokeStyle = 'rgba(211,47,47,0.3)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(8, 10);
        ctx.lineTo(10, 14);
        ctx.lineTo(8, 18);
        ctx.stroke();

        // Chain on left
        ctx.strokeStyle = '#9E9E9E';
        ctx.lineWidth = 1;
        for (let cy = 6; cy < 32; cy += 4) {
          ctx.beginPath();
          ctx.ellipse(6, cy, 2, 1.5, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        // Chain on right
        for (let cy = 8; cy < 34; cy += 4) {
          ctx.beginPath();
          ctx.ellipse(26, cy, 2, 1.5, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Lock symbol (center)
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(13, 24, 6, 5);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(16, 24, 3, Math.PI, 0);
        ctx.stroke();
        // Keyhole
        ctx.fillStyle = '#424242';
        ctx.beginPath();
        ctx.arc(16, 26, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(15, 26, 2, 2);

        // Eyes
        ctx.fillStyle = hex(COLORS.bossRed);
        ctx.fillRect(9, 8, 5, 5);
        ctx.fillRect(18, 8, 5, 5);
        ctx.fillStyle = '#fff';
        ctx.fillRect(11, 9, 2, 3);
        ctx.fillRect(20, 9, 2, 3);
        // Eye red glow border
        ctx.strokeStyle = '#FF5252';
        ctx.lineWidth = 1;
        ctx.strokeRect(9, 8, 5, 5);
        ctx.strokeRect(18, 8, 5, 5);

        // CMS text
        ctx.font = '7px monospace';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.fillText('CMS', 16, 20);

        // Mouth
        ctx.fillStyle = hex(COLORS.bossRed);
        ctx.fillRect(10, 30, 12, 2);
      });
      break;

    case 'drama':
      t = tex(32, 24, (ctx) => {
        // Darker main cloud body
        ctx.fillStyle = '#3E3E3E';
        ctx.beginPath();
        ctx.ellipse(16, 10, 14, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Cloud puffs - darker
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.ellipse(10, 7, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(22, 7, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Top puff
        ctx.fillStyle = '#2E2E2E';
        ctx.beginPath();
        ctx.ellipse(16, 4, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Angry red eyes
        ctx.fillStyle = '#FF1744';
        ctx.fillRect(9, 8, 4, 3);
        ctx.fillRect(19, 8, 4, 3);
        // Eye glow
        ctx.fillStyle = '#FF5252';
        ctx.fillRect(10, 9, 2, 1);
        ctx.fillRect(20, 9, 2, 1);

        // Multiple lightning bolts
        // Main bolt
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(14, 14);
        ctx.lineTo(12, 17);
        ctx.lineTo(14, 17);
        ctx.lineTo(12, 21);
        ctx.lineTo(16, 16);
        ctx.lineTo(14, 16);
        ctx.lineTo(16, 14);
        ctx.closePath();
        ctx.fill();
        // Second bolt (smaller, left)
        ctx.fillStyle = '#FFC107';
        ctx.beginPath();
        ctx.moveTo(7, 14);
        ctx.lineTo(6, 16);
        ctx.lineTo(7, 16);
        ctx.lineTo(5, 19);
        ctx.lineTo(8, 15);
        ctx.lineTo(7, 15);
        ctx.lineTo(8, 14);
        ctx.closePath();
        ctx.fill();
        // Third bolt (smaller, right)
        ctx.fillStyle = '#FFC107';
        ctx.beginPath();
        ctx.moveTo(24, 15);
        ctx.lineTo(23, 17);
        ctx.lineTo(24, 17);
        ctx.lineTo(22, 20);
        ctx.lineTo(25, 16);
        ctx.lineTo(24, 16);
        ctx.lineTo(25, 15);
        ctx.closePath();
        ctx.fill();

        // Rain drops beneath
        ctx.fillStyle = '#64B5F6';
        for (let i = 0; i < 5; i++) {
          const rx = 8 + i * 4;
          const ry = 20 + (i % 2) * 2;
          ctx.fillRect(rx, ry, 1, 2);
        }
        // More rain
        ctx.fillStyle = '#42A5F5';
        for (let i = 0; i < 4; i++) {
          const rx = 10 + i * 4;
          const ry = 22 + (i % 2);
          ctx.fillRect(rx, ry, 1, 2);
        }
      });
      break;
  }
  const sizes = { bug: [1.2, 0.9], monolith: [2.2, 3], drama: [1.8, 1.5] };
  const [sw, sh] = sizes[type];
  g.add(new THREE.Mesh(
    new THREE.PlaneGeometry(sw, sh),
    new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.1 })
  ));

  // Floating label above enemy
  if (label) {
    const lw = Math.max(64, label.length * 8);
    const lh = 14;
    const lt = tex(lw, lh, (ctx) => {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, lw, lh);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, lw / 2, lh / 2);
    });
    const labelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(sw + 0.8, 0.35),
      new THREE.MeshBasicMaterial({ map: lt, transparent: true })
    );
    labelMesh.position.y = sh / 2 + 0.3;
    g.add(labelMesh);
  }

  return g;
}

// ── Powerups ─────────────────────────────────────────────────
export function createPowerupSprite(type) {
  const g = new THREE.Group();
  const t = tex(24, 24, (ctx) => {
    switch (type) {
      case 'graphql': {
        // Particle trail background dots
        ctx.fillStyle = 'rgba(233,30,99,0.3)';
        for (let i = 0; i < 6; i++) {
          const px = 4 + Math.random() * 16;
          const py = 2 + Math.random() * 20;
          ctx.fillRect(px, py, 2, 2);
        }
        // Glow behind bolt
        const boltGlow = ctx.createRadialGradient(12, 12, 2, 12, 12, 10);
        boltGlow.addColorStop(0, 'rgba(233,30,99,0.5)');
        boltGlow.addColorStop(1, 'rgba(233,30,99,0)');
        ctx.fillStyle = boltGlow;
        ctx.fillRect(0, 0, 24, 24);
        // Lightning bolt
        ctx.fillStyle = hex(COLORS.powerPink);
        ctx.beginPath();
        ctx.moveTo(14, 1);
        ctx.lineTo(7, 11);
        ctx.lineTo(12, 11);
        ctx.lineTo(8, 23);
        ctx.lineTo(17, 13);
        ctx.lineTo(12, 13);
        ctx.lineTo(14, 1);
        ctx.fill();
        // Bolt highlight
        ctx.fillStyle = '#fff';
        ctx.fillRect(12, 5, 2, 3);
        // Trailing particles
        ctx.fillStyle = '#FF80AB';
        ctx.fillRect(5, 18, 2, 2);
        ctx.fillRect(3, 14, 1, 1);
        ctx.fillRect(18, 20, 2, 2);
        ctx.fillRect(20, 16, 1, 1);
        break;
      }
      case 'oauth': {
        // Shield glow
        const shieldGlow = ctx.createRadialGradient(12, 12, 3, 12, 12, 11);
        shieldGlow.addColorStop(0, 'rgba(33,150,243,0.4)');
        shieldGlow.addColorStop(1, 'rgba(33,150,243,0)');
        ctx.fillStyle = shieldGlow;
        ctx.fillRect(0, 0, 24, 24);
        // Shield shape
        ctx.fillStyle = hex(COLORS.shieldBlue);
        ctx.beginPath();
        ctx.moveTo(12, 2);
        ctx.lineTo(21, 6);
        ctx.lineTo(20, 15);
        ctx.lineTo(12, 21);
        ctx.lineTo(4, 15);
        ctx.lineTo(3, 6);
        ctx.closePath();
        ctx.fill();
        // Shield inner border
        ctx.strokeStyle = '#64B5F6';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(12, 4);
        ctx.lineTo(19, 7);
        ctx.lineTo(18, 14);
        ctx.lineTo(12, 19);
        ctx.lineTo(6, 14);
        ctx.lineTo(5, 7);
        ctx.closePath();
        ctx.stroke();
        // Lock icon
        ctx.fillStyle = '#fff';
        ctx.fillRect(10, 12, 4, 4);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(12, 12, 2, Math.PI, 0);
        ctx.stroke();
        // Keyhole
        ctx.fillStyle = hex(COLORS.shieldBlue);
        ctx.fillRect(11, 13, 2, 2);
        // Shield gleam
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.moveTo(12, 4);
        ctx.lineTo(7, 7);
        ctx.lineTo(7, 11);
        ctx.lineTo(12, 8);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'ai': {
        // Circuit lines background
        ctx.strokeStyle = 'rgba(255,215,0,0.25)';
        ctx.lineWidth = 1;
        // Horizontal circuit lines
        ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(6, 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(18, 8); ctx.lineTo(24, 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 16); ctx.lineTo(6, 16); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(18, 16); ctx.lineTo(24, 16); ctx.stroke();
        // Vertical circuit lines
        ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(8, 5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(16, 5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(8, 19); ctx.lineTo(8, 24); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(16, 19); ctx.lineTo(16, 24); ctx.stroke();
        // Circuit nodes
        ctx.fillStyle = 'rgba(255,215,0,0.4)';
        ctx.fillRect(5, 7, 2, 2);
        ctx.fillRect(17, 7, 2, 2);
        ctx.fillRect(5, 15, 2, 2);
        ctx.fillRect(17, 15, 2, 2);
        ctx.fillRect(7, 4, 2, 2);
        ctx.fillRect(15, 4, 2, 2);
        ctx.fillRect(7, 18, 2, 2);
        ctx.fillRect(15, 18, 2, 2);

        // Pulsing glow behind star
        const starGlow = ctx.createRadialGradient(12, 12, 2, 12, 12, 10);
        starGlow.addColorStop(0, 'rgba(255,215,0,0.5)');
        starGlow.addColorStop(0.5, 'rgba(255,215,0,0.15)');
        starGlow.addColorStop(1, 'rgba(255,215,0,0)');
        ctx.fillStyle = starGlow;
        ctx.fillRect(0, 0, 24, 24);

        // Star shape
        ctx.fillStyle = hex(COLORS.gold);
        ctx.beginPath();
        ctx.moveTo(12, 2);
        ctx.lineTo(14, 9);
        ctx.lineTo(22, 9);
        ctx.lineTo(16, 14);
        ctx.lineTo(18, 22);
        ctx.lineTo(12, 17);
        ctx.lineTo(6, 22);
        ctx.lineTo(8, 14);
        ctx.lineTo(2, 9);
        ctx.lineTo(10, 9);
        ctx.closePath();
        ctx.fill();
        // Star highlight
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.moveTo(12, 4);
        ctx.lineTo(13, 9);
        ctx.lineTo(10, 9);
        ctx.closePath();
        ctx.fill();
        // AI text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 6px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('AI', 12, 14);
        break;
      }
      case 'heart': {
        // Heart glow (beating pulse effect via multiple layers)
        const heartGlow = ctx.createRadialGradient(12, 12, 3, 12, 12, 11);
        heartGlow.addColorStop(0, 'rgba(244,67,54,0.4)');
        heartGlow.addColorStop(1, 'rgba(244,67,54,0)');
        ctx.fillStyle = heartGlow;
        ctx.fillRect(0, 0, 24, 24);

        // Outer heart (pulse ring)
        ctx.fillStyle = 'rgba(244,67,54,0.25)';
        ctx.beginPath();
        ctx.moveTo(12, 21);
        ctx.bezierCurveTo(1, 14, 1, 4, 6, 4);
        ctx.bezierCurveTo(8, 4, 12, 7, 12, 7);
        ctx.bezierCurveTo(12, 7, 16, 4, 18, 4);
        ctx.bezierCurveTo(23, 4, 23, 14, 12, 21);
        ctx.fill();

        // Main heart
        ctx.fillStyle = hex(COLORS.heartRed);
        ctx.beginPath();
        ctx.moveTo(12, 19);
        ctx.bezierCurveTo(3, 13, 3, 5, 7, 5);
        ctx.bezierCurveTo(9, 5, 12, 8, 12, 8);
        ctx.bezierCurveTo(12, 8, 15, 5, 17, 5);
        ctx.bezierCurveTo(21, 5, 21, 13, 12, 19);
        ctx.fill();

        // Heart highlight (sheen)
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.ellipse(8, 8, 2, 3, -0.5, 0, Math.PI * 2);
        ctx.fill();

        // Pulse lines
        ctx.strokeStyle = 'rgba(244,67,54,0.5)';
        ctx.lineWidth = 1;
        // Left pulse
        ctx.beginPath();
        ctx.moveTo(1, 12);
        ctx.lineTo(3, 12);
        ctx.lineTo(4, 10);
        ctx.lineTo(5, 12);
        ctx.stroke();
        // Right pulse
        ctx.beginPath();
        ctx.moveTo(19, 12);
        ctx.lineTo(20, 12);
        ctx.lineTo(21, 10);
        ctx.lineTo(22, 12);
        ctx.lineTo(23, 12);
        ctx.stroke();
        break;
      }
    }
  });
  // Glow mesh behind powerup
  const glowTex = tex(16, 16, (ctx) => {
    const grd = ctx.createRadialGradient(8, 8, 1, 8, 8, 8);
    const glowColors = {
      graphql: 'rgba(233,30,99,',
      oauth: 'rgba(33,150,243,',
      ai: 'rgba(255,215,0,',
      heart: 'rgba(244,67,54,',
    };
    const gc = glowColors[type] || 'rgba(255,255,255,';
    grd.addColorStop(0, gc + '0.4)');
    grd.addColorStop(0.5, gc + '0.1)');
    grd.addColorStop(1, gc + '0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 16, 16);
  });
  const glowMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.0, 2.0),
    new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false })
  );
  glowMesh.position.z = -0.05;
  g.add(glowMesh);

  g.add(new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 1.2),
    new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.1 })
  ));
  return g;
}

// ── Coin (API Token) ─────────────────────────────────────────
export function createCoinSprite() {
  const t = tex(16, 16, (ctx) => {
    // Outer rim
    ctx.fillStyle = '#B8860B';
    ctx.beginPath();
    ctx.arc(8, 8, 7, 0, Math.PI * 2);
    ctx.fill();
    // Main gold face
    ctx.fillStyle = hex(COLORS.gold);
    ctx.beginPath();
    ctx.arc(8, 8, 6, 0, Math.PI * 2);
    ctx.fill();
    // Inner ring
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(8, 8, 4, 0, Math.PI * 2);
    ctx.stroke();
    // Shine highlight (top-left)
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.ellipse(6, 6, 2, 3, -0.6, 0, Math.PI * 2);
    ctx.fill();
    // Small sparkle
    ctx.fillStyle = '#fff';
    ctx.fillRect(4, 4, 1, 1);
    // Symbol
    ctx.fillStyle = '#FFF8E1';
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('{}', 8, 11);
  });
  return new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.8),
    new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.1 })
  );
}

// ── Sign ─────────────────────────────────────────────────────
export function createSignMesh() {
  const t = tex(16, 24, (ctx) => {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(7, 12, 3, 12);
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(1, 0, 14, 13);
    ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 1; ctx.strokeRect(1, 0, 14, 13);
    ctx.fillStyle = hex(COLORS.drupalBlue);
    ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center'; ctx.fillText('i', 8, 10);
  });
  return new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 1.8),
    new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.1 })
  );
}

// ── Boss ("The Monolith") ────────────────────────────────────
export function createBossSprite() {
  const g = new THREE.Group();
  const t = tex(64, 80, (ctx) => {
    // Background energy glow
    const bgGlow = ctx.createRadialGradient(32, 40, 8, 32, 40, 32);
    bgGlow.addColorStop(0, 'rgba(211,47,47,0.15)');
    bgGlow.addColorStop(1, 'rgba(211,47,47,0)');
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, 64, 80);

    // Main body
    ctx.fillStyle = hex(COLORS.bossGray);
    ctx.fillRect(8, 6, 48, 68);
    // Top bevel
    ctx.fillStyle = '#455A64';
    ctx.fillRect(8, 6, 48, 10);
    // Bottom bevel
    ctx.fillStyle = '#263238';
    ctx.fillRect(8, 64, 48, 10);
    // Side bevels
    ctx.fillStyle = '#2E3B42';
    ctx.fillRect(8, 6, 4, 68);
    ctx.fillRect(52, 6, 4, 68);
    // Thick outline
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 6, 48, 68);

    // Glowing eyes - large red sockets
    ctx.fillStyle = '#B71C1C';
    ctx.fillRect(16, 18, 10, 8);
    ctx.fillRect(38, 18, 10, 8);
    // Eye red glow
    const eyeGlow1 = ctx.createRadialGradient(21, 22, 2, 21, 22, 8);
    eyeGlow1.addColorStop(0, 'rgba(255,23,68,0.5)');
    eyeGlow1.addColorStop(1, 'rgba(255,23,68,0)');
    ctx.fillStyle = eyeGlow1;
    ctx.fillRect(12, 14, 18, 16);
    const eyeGlow2 = ctx.createRadialGradient(43, 22, 2, 43, 22, 8);
    eyeGlow2.addColorStop(0, 'rgba(255,23,68,0.5)');
    eyeGlow2.addColorStop(1, 'rgba(255,23,68,0)');
    ctx.fillStyle = eyeGlow2;
    ctx.fillRect(34, 14, 18, 16);
    // Eye inner (bright)
    ctx.fillStyle = '#D32F2F';
    ctx.fillRect(16, 18, 10, 8);
    ctx.fillRect(38, 18, 10, 8);
    // Pupils
    ctx.fillStyle = '#fff';
    ctx.fillRect(20, 20, 4, 5);
    ctx.fillRect(42, 20, 4, 5);
    // Eye glint
    ctx.fillStyle = '#FFCDD2';
    ctx.fillRect(22, 20, 2, 2);
    ctx.fillRect(44, 20, 2, 2);

    // Label
    ctx.fillStyle = '#B0BEC5';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MONO', 32, 36);
    ctx.fillText('LITH', 32, 46);

    // Mouth (angry snarl)
    ctx.fillStyle = '#D32F2F';
    ctx.fillRect(18, 52, 28, 6);
    ctx.fillRect(16, 50, 4, 3);
    ctx.fillRect(44, 50, 4, 3);
    // Teeth
    ctx.fillStyle = '#fff';
    for (let tx = 20; tx < 44; tx += 4) {
      ctx.fillRect(tx, 52, 2, 3);
    }

    // Pulsing energy cracks
    ctx.strokeStyle = '#FF5252';
    ctx.lineWidth = 1;
    // Left cracks
    ctx.beginPath();
    ctx.moveTo(14, 40);
    ctx.lineTo(18, 46);
    ctx.lineTo(14, 52);
    ctx.lineTo(18, 60);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(12, 32);
    ctx.lineTo(16, 38);
    ctx.lineTo(13, 42);
    ctx.stroke();
    // Right cracks
    ctx.beginPath();
    ctx.moveTo(50, 38);
    ctx.lineTo(46, 44);
    ctx.lineTo(50, 50);
    ctx.lineTo(47, 58);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(52, 30);
    ctx.lineTo(48, 36);
    ctx.lineTo(51, 40);
    ctx.stroke();
    // Center bottom crack
    ctx.beginPath();
    ctx.moveTo(30, 62);
    ctx.lineTo(32, 68);
    ctx.lineTo(28, 72);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(36, 60);
    ctx.lineTo(34, 66);
    ctx.lineTo(38, 70);
    ctx.stroke();

    // Crack glow
    ctx.strokeStyle = 'rgba(255,82,82,0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(14, 40);
    ctx.lineTo(18, 46);
    ctx.lineTo(14, 52);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(50, 38);
    ctx.lineTo(46, 44);
    ctx.lineTo(50, 50);
    ctx.stroke();

    // Health bar background texture (dark bar behind HP)
    ctx.fillStyle = '#1B2631';
    ctx.fillRect(12, 8, 40, 5);
    ctx.strokeStyle = '#455A64';
    ctx.lineWidth = 1;
    ctx.strokeRect(12, 8, 40, 5);
    // HP fill (placeholder - will be updated dynamically by game)
    ctx.fillStyle = '#D32F2F';
    ctx.fillRect(13, 9, 38, 3);
  });
  g.add(new THREE.Mesh(
    new THREE.PlaneGeometry(4.5, 6),
    new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.1 })
  ));

  // Floating debris particles (static meshes, animated in game.js)
  for (let i = 0; i < 6; i++) {
    const debrisSize = 0.15 + Math.random() * 0.15;
    const debrisMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(debrisSize, debrisSize),
      new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? COLORS.bossGray : COLORS.bossRed,
        transparent: true,
        opacity: 0.6,
      })
    );
    const angle = (i / 6) * Math.PI * 2;
    debrisMesh.position.set(
      Math.cos(angle) * 2.8,
      Math.sin(angle) * 3.5,
      0.1
    );
    debrisMesh.userData.debrisIndex = i;
    debrisMesh.userData.debrisAngle = angle;
    debrisMesh.userData.debrisRadius = 2.5 + Math.random() * 0.8;
    g.add(debrisMesh);
  }

  return g;
}

// ── Projectile ───────────────────────────────────────────────
export function createProjectileMesh() {
  const t = tex(8, 8, (ctx) => {
    ctx.fillStyle = hex(COLORS.powerPink);
    ctx.beginPath(); ctx.arc(4, 4, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(3, 3, 2, 2);
  });
  return new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.5),
    new THREE.MeshBasicMaterial({ map: t, transparent: true })
  );
}

// ── Particle ─────────────────────────────────────────────────
export function createParticleMesh(color) {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(0.25, 0.25),
    new THREE.MeshBasicMaterial({ color, transparent: true })
  );
}

// ── Deploy Portal ────────────────────────────────────────────
export function createPortalSprite() {
  const g = new THREE.Group();
  const t = tex(48, 64, (ctx) => {
    // Outer swirl ring - blue
    const outerGrd = ctx.createRadialGradient(24, 32, 2, 24, 32, 24);
    outerGrd.addColorStop(0, 'rgba(255,255,255,0)');
    outerGrd.addColorStop(0.3, 'rgba(255,255,255,0)');
    outerGrd.addColorStop(0.6, 'rgba(33,150,243,0.3)');
    outerGrd.addColorStop(0.8, 'rgba(33,150,243,0.15)');
    outerGrd.addColorStop(1, 'rgba(33,150,243,0)');
    ctx.fillStyle = outerGrd;
    ctx.fillRect(0, 0, 48, 64);

    // Mid swirl ring - purple
    const midGrd = ctx.createRadialGradient(24, 32, 1, 24, 32, 18);
    midGrd.addColorStop(0, 'rgba(255,255,255,0)');
    midGrd.addColorStop(0.3, 'rgba(255,255,255,0)');
    midGrd.addColorStop(0.5, 'rgba(156,39,176,0.3)');
    midGrd.addColorStop(0.7, 'rgba(156,39,176,0.15)');
    midGrd.addColorStop(1, 'rgba(156,39,176,0)');
    ctx.fillStyle = midGrd;
    ctx.fillRect(0, 0, 48, 64);

    // Swirl streaks
    ctx.strokeStyle = 'rgba(255,215,0,0.4)';
    ctx.lineWidth = 2;
    for (let s = 0; s < 6; s++) {
      const sa = (s / 6) * Math.PI * 2;
      ctx.beginPath();
      for (let r = 3; r < 16; r += 0.5) {
        const a = sa + r * 0.3;
        const px = 24 + Math.cos(a) * r;
        const py = 32 + Math.sin(a) * r * 1.3;
        if (r === 3) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Inner core glow
    const grd = ctx.createRadialGradient(24, 32, 1, 24, 32, 12);
    grd.addColorStop(0, '#FFF');
    grd.addColorStop(0.2, '#FFFDE7');
    grd.addColorStop(0.4, '#FFD700');
    grd.addColorStop(0.6, '#FF8F00');
    grd.addColorStop(0.8, 'rgba(255,143,0,0.3)');
    grd.addColorStop(1, 'rgba(255,143,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 48, 64);

    // Sparkle particles in portal
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const r = 4 + (i % 3) * 3;
      const sx = 24 + Math.cos(angle) * r;
      const sy = 32 + Math.sin(angle) * r;
      ctx.fillRect(sx, sy, 2, 2);
    }

    // DEPLOY text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DEPLOY', 24, 34);
  });
  g.add(new THREE.Mesh(
    new THREE.PlaneGeometry(3, 4.5),
    new THREE.MeshBasicMaterial({ map: t, transparent: true })
  ));
  return g;
}

// ── Background (parallax layers) ─────────────────────────────
export function createBackground(scene) {
  const layers = [];

  // Sky gradient - full screen, follows camera
  const skyC = document.createElement('canvas');
  skyC.width = 2; skyC.height = 64;
  const sCtx = skyC.getContext('2d');
  const grd = sCtx.createLinearGradient(0, 0, 0, 64);
  grd.addColorStop(0, '#0D1B2A');
  grd.addColorStop(0.3, '#1B2838');
  grd.addColorStop(0.6, '#4A90D9');
  grd.addColorStop(1, '#87CEEB');
  sCtx.fillStyle = grd;
  sCtx.fillRect(0, 0, 2, 64);
  const skyTex = new THREE.CanvasTexture(skyC);
  const sky = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 50),
    new THREE.MeshBasicMaterial({ map: skyTex })
  );
  sky.position.set(140, 12, -5);
  scene.add(sky);
  layers.push({ mesh: sky, ix: 140, speed: 0.95 });

  // ── Twinkling stars in upper sky ──────────────────────────
  const starsC = document.createElement('canvas');
  starsC.width = 512;
  starsC.height = 128;
  const starCtx = starsC.getContext('2d');
  for (let i = 0; i < 120; i++) {
    const sx = Math.random() * 512;
    const sy = Math.random() * 128;
    const brightness = 0.3 + Math.random() * 0.7;
    const size = Math.random() < 0.15 ? 2 : 1;
    starCtx.fillStyle = `rgba(255,255,255,${brightness})`;
    starCtx.fillRect(sx, sy, size, size);
    // Some colored stars
    if (Math.random() < 0.1) {
      const colors = ['rgba(135,206,235,0.6)', 'rgba(255,215,0,0.5)', 'rgba(255,182,193,0.5)'];
      starCtx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      starCtx.fillRect(sx - 1, sy, 1, 1);
    }
  }
  const starsTex = new THREE.CanvasTexture(starsC);
  starsTex.magFilter = THREE.NearestFilter;
  starsTex.minFilter = THREE.NearestFilter;
  const stars = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 20),
    new THREE.MeshBasicMaterial({ map: starsTex, transparent: true })
  );
  stars.position.set(140, 24, -4.9);
  scene.add(stars);
  layers.push({ mesh: stars, ix: 140, speed: 0.92, type: 'stars' });

  // ── Circuit-board / grid pattern (distant bg, tech theme) ──
  const circuitC = document.createElement('canvas');
  circuitC.width = 256;
  circuitC.height = 128;
  const cCtx = circuitC.getContext('2d');
  cCtx.strokeStyle = 'rgba(6,120,190,0.08)';
  cCtx.lineWidth = 1;
  // Grid lines
  for (let x = 0; x < 256; x += 16) {
    cCtx.beginPath();
    cCtx.moveTo(x, 0);
    cCtx.lineTo(x, 128);
    cCtx.stroke();
  }
  for (let y = 0; y < 128; y += 16) {
    cCtx.beginPath();
    cCtx.moveTo(0, y);
    cCtx.lineTo(256, y);
    cCtx.stroke();
  }
  // Circuit traces
  cCtx.strokeStyle = 'rgba(6,120,190,0.12)';
  cCtx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    const sx = Math.floor(Math.random() * 16) * 16;
    const sy = Math.floor(Math.random() * 8) * 16;
    cCtx.beginPath();
    cCtx.moveTo(sx, sy);
    let cx = sx, cy = sy;
    for (let seg = 0; seg < 3 + Math.floor(Math.random() * 3); seg++) {
      if (Math.random() < 0.5) cx += (Math.random() < 0.5 ? 16 : -16);
      else cy += (Math.random() < 0.5 ? 16 : -16);
      cx = Math.max(0, Math.min(255, cx));
      cy = Math.max(0, Math.min(127, cy));
      cCtx.lineTo(cx, cy);
    }
    cCtx.stroke();
    // Node dots
    cCtx.fillStyle = 'rgba(6,120,190,0.15)';
    cCtx.fillRect(cx - 1, cy - 1, 3, 3);
  }
  const circuitTex = new THREE.CanvasTexture(circuitC);
  circuitTex.magFilter = THREE.NearestFilter;
  circuitTex.minFilter = THREE.NearestFilter;
  const circuit = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 30),
    new THREE.MeshBasicMaterial({ map: circuitTex, transparent: true })
  );
  circuit.position.set(140, 6, -4.85);
  scene.add(circuit);
  layers.push({ mesh: circuit, ix: 140, speed: 0.88 });

  // ── City skyline silhouette ──────────────────────────────
  const cityC = document.createElement('canvas');
  cityC.width = 512;
  cityC.height = 96;
  const cityCtx = cityC.getContext('2d');
  // Buildings silhouette
  cityCtx.fillStyle = 'rgba(15,25,40,0.6)';
  const buildings = [];
  let bx = 0;
  while (bx < 512) {
    const bw = 8 + Math.floor(Math.random() * 20);
    const bh = 15 + Math.floor(Math.random() * 55);
    buildings.push({ x: bx, w: bw, h: bh });
    bx += bw + Math.floor(Math.random() * 6);
  }
  for (const b of buildings) {
    cityCtx.fillStyle = 'rgba(15,25,40,0.5)';
    cityCtx.fillRect(b.x, 96 - b.h, b.w, b.h);
    // Building outline
    cityCtx.strokeStyle = 'rgba(30,50,70,0.4)';
    cityCtx.lineWidth = 1;
    cityCtx.strokeRect(b.x, 96 - b.h, b.w, b.h);
    // Windows (lit up)
    if (b.w > 8 && b.h > 20) {
      for (let wy = 96 - b.h + 4; wy < 92; wy += 6) {
        for (let wx = b.x + 2; wx < b.x + b.w - 3; wx += 5) {
          if (Math.random() < 0.6) {
            const windowColor = Math.random() < 0.7
              ? 'rgba(255,215,100,0.4)'
              : 'rgba(100,180,255,0.3)';
            cityCtx.fillStyle = windowColor;
            cityCtx.fillRect(wx, wy, 2, 2);
          }
        }
      }
    }
    // Occasional antenna
    if (b.h > 40 && Math.random() < 0.3) {
      cityCtx.strokeStyle = 'rgba(15,25,40,0.5)';
      cityCtx.lineWidth = 1;
      cityCtx.beginPath();
      cityCtx.moveTo(b.x + b.w / 2, 96 - b.h);
      cityCtx.lineTo(b.x + b.w / 2, 96 - b.h - 8);
      cityCtx.stroke();
      // Blinking light on top
      cityCtx.fillStyle = 'rgba(255,0,0,0.5)';
      cityCtx.fillRect(b.x + b.w / 2 - 1, 96 - b.h - 9, 2, 2);
    }
  }
  const cityTex = new THREE.CanvasTexture(cityC);
  cityTex.magFilter = THREE.NearestFilter;
  cityTex.minFilter = THREE.NearestFilter;
  const city = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 14),
    new THREE.MeshBasicMaterial({ map: cityTex, transparent: true })
  );
  city.position.set(140, 4, -4.5);
  scene.add(city);
  layers.push({ mesh: city, ix: 140, speed: 0.75 });

  // Mountains
  const mtC = document.createElement('canvas');
  mtC.width = 512; mtC.height = 128;
  const mCtx = mtC.getContext('2d');
  mCtx.fillStyle = '#5C8A5C';
  for (let i = 0; i < 22; i++) {
    const cx = i * 25;
    const h = 35 + Math.sin(i * 1.7) * 25 + Math.random() * 20;
    mCtx.beginPath();
    mCtx.moveTo(cx - 18, 128);
    mCtx.lineTo(cx, 128 - h);
    mCtx.lineTo(cx + 18, 128);
    mCtx.fill();
  }
  mCtx.fillStyle = '#4A7A4A';
  for (let i = 0; i < 22; i++) {
    const cx = i * 25 + 12;
    const h = 20 + Math.sin(i * 2.3) * 15 + Math.random() * 15;
    mCtx.beginPath();
    mCtx.moveTo(cx - 14, 128);
    mCtx.lineTo(cx, 128 - h);
    mCtx.lineTo(cx + 14, 128);
    mCtx.fill();
  }
  const mtTex = new THREE.CanvasTexture(mtC);
  const mountains = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 22),
    new THREE.MeshBasicMaterial({ map: mtTex, transparent: true })
  );
  mountains.position.set(140, 3, -4);
  scene.add(mountains);
  layers.push({ mesh: mountains, ix: 140, speed: 0.8 });

  // ── Animated cloud puffs (larger, more defined) ────────────
  for (let i = 0; i < 25; i++) {
    const cw = 2.5 + Math.random() * 4;
    const ch = 0.8 + Math.random() * 0.8;
    // Create a more detailed cloud texture
    const cloudTex = tex(32, 12, (ctx) => {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.ellipse(16, 7, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath();
      ctx.ellipse(10, 5, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(22, 5, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Shadow underside
      ctx.fillStyle = 'rgba(200,200,220,0.3)';
      ctx.beginPath();
      ctx.ellipse(16, 9, 10, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    const cloud = new THREE.Mesh(
      new THREE.PlaneGeometry(cw, ch),
      new THREE.MeshBasicMaterial({
        map: cloudTex,
        transparent: true,
        opacity: 0.3 + Math.random() * 0.25,
      })
    );
    const ix = -20 + i * 16;
    cloud.position.set(ix, 10 + Math.random() * 6, -3);
    scene.add(cloud);
    layers.push({
      mesh: cloud,
      ix,
      speed: 0.65 + Math.random() * 0.15,
      type: 'cloud',
      driftSpeed: 0.1 + Math.random() * 0.2,
      driftOffset: Math.random() * Math.PI * 2,
    });
  }

  return layers;
}
