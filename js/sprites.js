import * as THREE from 'three';
import { COLORS } from './config.js';

const hex = (c) => '#' + c.toString(16).padStart(6, '0');

function tex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  return t;
}

// Helper: draw a rounded rectangle
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── Player (Drupal Drop head + body + cape + glow) ────────────
export function createPlayerSprite() {
  const t = tex(192, 224, (ctx) => {
    // Scale factor from old 48x56
    const s = 4;

    // Cape / scarf flowing behind (drawn first so body covers front)
    // Layer 1 - darkest
    ctx.fillStyle = '#B71C1C';
    ctx.beginPath();
    ctx.moveTo(48, 128);
    ctx.bezierCurveTo(30, 148, 16, 168, 8, 212);
    ctx.lineTo(20, 214);
    ctx.bezierCurveTo(26, 178, 36, 152, 52, 136);
    ctx.closePath();
    ctx.fill();

    // Layer 2 - mid
    const capeGrd2 = ctx.createLinearGradient(12, 128, 12, 214);
    capeGrd2.addColorStop(0, '#C62828');
    capeGrd2.addColorStop(1, '#8E1414');
    ctx.fillStyle = capeGrd2;
    ctx.beginPath();
    ctx.moveTo(56, 124);
    ctx.bezierCurveTo(24, 152, 12, 176, 8, 216);
    ctx.lineTo(24, 212);
    ctx.bezierCurveTo(28, 176, 40, 152, 64, 132);
    ctx.closePath();
    ctx.fill();

    // Layer 3 - highlight
    const capeGrd3 = ctx.createLinearGradient(24, 124, 24, 180);
    capeGrd3.addColorStop(0, '#E53935');
    capeGrd3.addColorStop(1, '#C62828');
    ctx.fillStyle = capeGrd3;
    ctx.beginPath();
    ctx.moveTo(56, 124);
    ctx.bezierCurveTo(40, 140, 32, 156, 28, 176);
    ctx.lineTo(36, 172);
    ctx.bezierCurveTo(40, 152, 48, 140, 60, 128);
    ctx.closePath();
    ctx.fill();

    // Cape shadow
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.beginPath();
    ctx.moveTo(48, 128);
    ctx.bezierCurveTo(30, 148, 16, 168, 8, 212);
    ctx.lineTo(20, 214);
    ctx.bezierCurveTo(26, 178, 36, 152, 52, 136);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Subtle glow around head
    const glowGrd = ctx.createRadialGradient(96, 72, 24, 96, 72, 72);
    glowGrd.addColorStop(0, 'rgba(6,120,190,0.25)');
    glowGrd.addColorStop(0.6, 'rgba(6,120,190,0.08)');
    glowGrd.addColorStop(1, 'rgba(6,120,190,0)');
    ctx.fillStyle = glowGrd;
    ctx.fillRect(0, 0, 192, 160);

    // Drupal drop head - with radial gradient shading
    const headGrd = ctx.createRadialGradient(80, 60, 8, 96, 80, 56);
    headGrd.addColorStop(0, hex(COLORS.drupalBlueLight));
    headGrd.addColorStop(0.6, hex(COLORS.drupalBlue));
    headGrd.addColorStop(1, hex(COLORS.drupalBlueDark));
    ctx.fillStyle = headGrd;
    ctx.beginPath();
    ctx.moveTo(96, 8);
    ctx.bezierCurveTo(128, 48, 144, 88, 128, 120);
    ctx.bezierCurveTo(120, 136, 72, 136, 64, 120);
    ctx.bezierCurveTo(48, 88, 64, 48, 96, 8);
    ctx.fill();

    // Head outline
    ctx.strokeStyle = hex(COLORS.drupalDark);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(96, 8);
    ctx.bezierCurveTo(128, 48, 144, 88, 128, 120);
    ctx.bezierCurveTo(120, 136, 72, 136, 64, 120);
    ctx.bezierCurveTo(48, 88, 64, 48, 96, 8);
    ctx.stroke();

    // Head highlight (specular)
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.moveTo(96, 20);
    ctx.bezierCurveTo(80, 48, 72, 72, 76, 96);
    ctx.lineTo(88, 88);
    ctx.bezierCurveTo(84, 64, 88, 40, 96, 20);
    ctx.fill();

    // Eyes - left eye
    const eyeGrdL = ctx.createRadialGradient(82, 80, 2, 82, 80, 10);
    eyeGrdL.addColorStop(0, '#ffffff');
    eyeGrdL.addColorStop(1, '#e0e0e0');
    ctx.fillStyle = eyeGrdL;
    ctx.beginPath();
    ctx.ellipse(82, 80, 9, 10, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = hex(COLORS.drupalDark);
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Eyes - right eye
    const eyeGrdR = ctx.createRadialGradient(114, 80, 2, 114, 80, 10);
    eyeGrdR.addColorStop(0, '#ffffff');
    eyeGrdR.addColorStop(1, '#e0e0e0');
    ctx.fillStyle = eyeGrdR;
    ctx.beginPath();
    ctx.ellipse(114, 80, 9, 10, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = hex(COLORS.drupalDark);
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Pupils - left
    const pupilGrdL = ctx.createRadialGradient(84, 82, 1, 84, 82, 5);
    pupilGrdL.addColorStop(0, '#000000');
    pupilGrdL.addColorStop(0.8, hex(COLORS.drupalDark));
    pupilGrdL.addColorStop(1, '#222222');
    ctx.fillStyle = pupilGrdL;
    ctx.beginPath();
    ctx.ellipse(84, 82, 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupils - right
    const pupilGrdR = ctx.createRadialGradient(116, 82, 1, 116, 82, 5);
    pupilGrdR.addColorStop(0, '#000000');
    pupilGrdR.addColorStop(0.8, hex(COLORS.drupalDark));
    pupilGrdR.addColorStop(1, '#222222');
    ctx.fillStyle = pupilGrdR;
    ctx.beginPath();
    ctx.ellipse(116, 82, 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine/gloss - left
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.ellipse(82, 78, 3, 2.5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine - right
    ctx.beginPath();
    ctx.ellipse(114, 78, 3, 2.5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Smile - smooth arc
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(98, 104, 12, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Body (torso) - rounded rect with gradient
    const bodyGrd = ctx.createLinearGradient(72, 132, 72, 164);
    bodyGrd.addColorStop(0, '#555555');
    bodyGrd.addColorStop(0.5, '#444444');
    bodyGrd.addColorStop(1, '#333333');
    ctx.fillStyle = bodyGrd;
    roundRect(ctx, 72, 132, 48, 32, 4);
    ctx.fill();

    // Belt
    const beltGrd = ctx.createLinearGradient(68, 156, 68, 164);
    beltGrd.addColorStop(0, '#A0522D');
    beltGrd.addColorStop(0.5, '#8B4513');
    beltGrd.addColorStop(1, '#6B3410');
    ctx.fillStyle = beltGrd;
    roundRect(ctx, 68, 156, 56, 8, 2);
    ctx.fill();

    // Belt buckle
    const buckleGrd = ctx.createLinearGradient(88, 156, 88, 164);
    buckleGrd.addColorStop(0, '#FFE44D');
    buckleGrd.addColorStop(0.5, '#FFD700');
    buckleGrd.addColorStop(1, '#B8860B');
    ctx.fillStyle = buckleGrd;
    roundRect(ctx, 88, 156, 16, 8, 2);
    ctx.fill();
    // Buckle inner
    ctx.fillStyle = '#B8860B';
    roundRect(ctx, 92, 157, 8, 6, 1);
    ctx.fill();

    // Arms - left
    const armGrdL = ctx.createLinearGradient(56, 136, 72, 136);
    armGrdL.addColorStop(0, '#444444');
    armGrdL.addColorStop(1, '#555555');
    ctx.fillStyle = armGrdL;
    roundRect(ctx, 56, 136, 20, 20, 4);
    ctx.fill();

    // Arms - right
    const armGrdR = ctx.createLinearGradient(116, 136, 136, 136);
    armGrdR.addColorStop(0, '#555555');
    armGrdR.addColorStop(1, '#444444');
    ctx.fillStyle = armGrdR;
    roundRect(ctx, 116, 136, 20, 20, 4);
    ctx.fill();

    // Gloves - left
    const gloveGrdL = ctx.createLinearGradient(56, 148, 56, 158);
    gloveGrdL.addColorStop(0, '#777777');
    gloveGrdL.addColorStop(1, '#666666');
    ctx.fillStyle = gloveGrdL;
    roundRect(ctx, 56, 148, 16, 8, 3);
    ctx.fill();

    // Gloves - right
    const gloveGrdR = ctx.createLinearGradient(120, 148, 120, 158);
    gloveGrdR.addColorStop(0, '#777777');
    gloveGrdR.addColorStop(1, '#666666');
    ctx.fillStyle = gloveGrdR;
    roundRect(ctx, 120, 148, 16, 8, 3);
    ctx.fill();

    // Legs - left
    const legGrdL = ctx.createLinearGradient(76, 164, 92, 164);
    legGrdL.addColorStop(0, '#2a2a2a');
    legGrdL.addColorStop(1, '#3a3a3a');
    ctx.fillStyle = legGrdL;
    roundRect(ctx, 76, 164, 16, 24, 3);
    ctx.fill();

    // Legs - right
    const legGrdR = ctx.createLinearGradient(100, 164, 116, 164);
    legGrdR.addColorStop(0, '#3a3a3a');
    legGrdR.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = legGrdR;
    roundRect(ctx, 100, 164, 16, 24, 3);
    ctx.fill();

    // Boots - left
    const bootGrdL = ctx.createLinearGradient(72, 184, 72, 200);
    bootGrdL.addColorStop(0, '#8B4513');
    bootGrdL.addColorStop(0.4, '#6B3410');
    bootGrdL.addColorStop(1, '#5D2F0E');
    ctx.fillStyle = bootGrdL;
    roundRect(ctx, 72, 184, 20, 16, 4);
    ctx.fill();

    // Boots - right
    const bootGrdR = ctx.createLinearGradient(100, 184, 100, 200);
    bootGrdR.addColorStop(0, '#8B4513');
    bootGrdR.addColorStop(0.4, '#6B3410');
    bootGrdR.addColorStop(1, '#5D2F0E');
    ctx.fillStyle = bootGrdR;
    roundRect(ctx, 100, 184, 20, 16, 4);
    ctx.fill();

    // Boot soles - rounded
    const soleGrd = ctx.createLinearGradient(68, 196, 68, 204);
    soleGrd.addColorStop(0, '#4A2508');
    soleGrd.addColorStop(1, '#3E1F08');
    ctx.fillStyle = soleGrd;
    roundRect(ctx, 68, 196, 24, 8, 3);
    ctx.fill();
    roundRect(ctx, 100, 196, 24, 8, 3);
    ctx.fill();

    // Boot highlights
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    roundRect(ctx, 74, 184, 14, 4, 2);
    ctx.fill();
    roundRect(ctx, 102, 184, 14, 4, 2);
    ctx.fill();

    // Boot straps
    ctx.fillStyle = hex(COLORS.drupalBlue);
    roundRect(ctx, 72, 188, 20, 4, 1);
    ctx.fill();
    roundRect(ctx, 100, 188, 20, 4, 1);
    ctx.fill();
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
  const cw = Math.max(64, Math.round(w * 32));
  const ch = Math.max(32, Math.round(h * 64));
  const t = tex(cw, ch, (ctx) => {
    switch (type) {
      case 'grass': {
        // Vertical gradient dirt
        const dirtGrd = ctx.createLinearGradient(0, 0, 0, ch);
        dirtGrd.addColorStop(0, hex(COLORS.dirtLight));
        dirtGrd.addColorStop(0.35, hex(COLORS.dirt));
        dirtGrd.addColorStop(1, hex(COLORS.dirtDark));
        ctx.fillStyle = dirtGrd;
        roundRect(ctx, 0, 0, cw, ch, 2);
        ctx.fill();

        // Grass top layer with gradient
        const grassGrd = ctx.createLinearGradient(0, 0, 0, ch * 0.35);
        grassGrd.addColorStop(0, hex(COLORS.grassLight));
        grassGrd.addColorStop(0.6, hex(COLORS.grass));
        grassGrd.addColorStop(1, hex(COLORS.grassDark));
        ctx.fillStyle = grassGrd;
        roundRect(ctx, 0, 0, cw, Math.ceil(ch * 0.35), 2);
        ctx.fill();

        // Individual grass blade bezier curves on top
        ctx.strokeStyle = hex(COLORS.grassLight);
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        for (let x = 2; x < cw; x += 4 + Math.random() * 4) {
          const bladeH = 4 + Math.random() * 8;
          const lean = (Math.random() - 0.5) * 6;
          ctx.strokeStyle = Math.random() > 0.5 ? hex(COLORS.grassLight) : hex(COLORS.grass);
          ctx.beginPath();
          ctx.moveTo(x, Math.ceil(ch * 0.15));
          ctx.quadraticCurveTo(x + lean * 0.5, Math.ceil(ch * 0.15) - bladeH * 0.6, x + lean, Math.ceil(ch * 0.15) - bladeH);
          ctx.stroke();
        }

        // Pebble details in dirt
        ctx.fillStyle = 'rgba(100,70,40,0.4)';
        for (let i = 0; i < cw / 10; i++) {
          const px = Math.random() * cw;
          const py = ch * 0.45 + Math.random() * (ch * 0.5);
          const pr = 1.5 + Math.random() * 2;
          ctx.beginPath();
          ctx.ellipse(px, py, pr, pr * 0.7, Math.random(), 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'api': {
        // Metallic gradient background
        const apiGrd = ctx.createLinearGradient(0, 0, 0, ch);
        apiGrd.addColorStop(0, hex(COLORS.apiLight));
        apiGrd.addColorStop(0.5, hex(COLORS.apiBlock));
        apiGrd.addColorStop(1, '#0D1554');
        ctx.fillStyle = apiGrd;
        roundRect(ctx, 0, 0, cw, ch, 3);
        ctx.fill();

        // Top highlight
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        roundRect(ctx, 2, 2, cw - 4, ch * 0.25, 2);
        ctx.fill();

        // Thin circuit traces
        ctx.strokeStyle = 'rgba(121,134,203,0.15)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
          const sx = Math.random() * cw;
          const sy = Math.random() * ch;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + (Math.random() - 0.5) * 30, sy + (Math.random() - 0.5) * 10);
          ctx.stroke();
        }

        // Glowing { } text with shadowBlur
        ctx.shadowColor = '#7986CB';
        ctx.shadowBlur = 12;
        ctx.font = `bold ${Math.max(16, ch - 6)}px monospace`;
        ctx.fillStyle = '#7986CB';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('{ }', cw / 2, ch / 2 + 2);
        ctx.shadowBlur = 0;
        break;
      }
      case 'cloud': {
        // Multiple overlapping gradient-filled ellipses
        const cx = cw / 2, cy = ch / 2;

        // Soft shadow underneath
        const shadowGrd = ctx.createRadialGradient(cx, cy + ch * 0.15, 0, cx, cy + ch * 0.15, cw * 0.4);
        shadowGrd.addColorStop(0, 'rgba(180,190,210,0.3)');
        shadowGrd.addColorStop(1, 'rgba(180,190,210,0)');
        ctx.fillStyle = shadowGrd;
        ctx.fillRect(0, 0, cw, ch);

        // Main body
        const cloudGrd1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, cw * 0.45);
        cloudGrd1.addColorStop(0, '#ffffff');
        cloudGrd1.addColorStop(0.7, hex(COLORS.cloud));
        cloudGrd1.addColorStop(1, 'rgba(255,255,255,0.1)');
        ctx.fillStyle = cloudGrd1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, cw * 0.45, ch * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();

        // Left puff
        const cloudGrd2 = ctx.createRadialGradient(cx * 0.55, cy * 0.8, 0, cx * 0.55, cy * 0.8, cw * 0.28);
        cloudGrd2.addColorStop(0, '#ffffff');
        cloudGrd2.addColorStop(1, 'rgba(255,255,255,0.2)');
        ctx.fillStyle = cloudGrd2;
        ctx.beginPath();
        ctx.ellipse(cx * 0.55, cy * 0.8, cw * 0.28, ch * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Right puff
        const cloudGrd3 = ctx.createRadialGradient(cx * 1.45, cy * 0.8, 0, cx * 1.45, cy * 0.8, cw * 0.28);
        cloudGrd3.addColorStop(0, '#ffffff');
        cloudGrd3.addColorStop(1, 'rgba(255,255,255,0.2)');
        ctx.fillStyle = cloudGrd3;
        ctx.beginPath();
        ctx.ellipse(cx * 1.45, cy * 0.8, cw * 0.28, ch * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bottom shadow
        ctx.fillStyle = hex(COLORS.cloudShadow);
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.ellipse(cx, ch * 0.7, cw * 0.38, ch * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        break;
      }
      case 'stone': {
        // Stone gradient
        const stoneGrd = ctx.createLinearGradient(0, 0, 0, ch);
        stoneGrd.addColorStop(0, hex(COLORS.stoneLight));
        stoneGrd.addColorStop(0.5, hex(COLORS.stone));
        stoneGrd.addColorStop(1, hex(COLORS.stoneDark));
        ctx.fillStyle = stoneGrd;
        roundRect(ctx, 0, 0, cw, ch, 2);
        ctx.fill();

        // Mortar lines (horizontal)
        ctx.strokeStyle = 'rgba(50,50,50,0.25)';
        ctx.lineWidth = 2;
        const rows = Math.max(2, Math.floor(ch / 16));
        for (let r = 1; r < rows; r++) {
          const y = (r / rows) * ch;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(cw, y);
          ctx.stroke();
        }

        // Vertical mortar (offset per row for brick pattern)
        for (let r = 0; r < rows; r++) {
          const y1 = (r / rows) * ch;
          const y2 = ((r + 1) / rows) * ch;
          const offset = (r % 2) * (cw / 6);
          for (let x = offset; x < cw; x += cw / 3) {
            ctx.beginPath();
            ctx.moveTo(x, y1);
            ctx.lineTo(x, y2);
            ctx.stroke();
          }
        }

        // Procedural crack lines
        ctx.strokeStyle = 'rgba(30,30,30,0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          let cx2 = Math.random() * cw;
          let cy2 = Math.random() * ch;
          ctx.beginPath();
          ctx.moveTo(cx2, cy2);
          for (let s = 0; s < 4; s++) {
            cx2 += (Math.random() - 0.5) * 16;
            cy2 += Math.random() * 10;
            ctx.lineTo(cx2, cy2);
          }
          ctx.stroke();
        }

        // Moss tint on top
        const mossGrd = ctx.createLinearGradient(0, 0, 0, ch * 0.25);
        mossGrd.addColorStop(0, 'rgba(76,175,80,0.2)');
        mossGrd.addColorStop(1, 'rgba(76,175,80,0)');
        ctx.fillStyle = mossGrd;
        ctx.fillRect(0, 0, cw, ch * 0.25);
        break;
      }
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
      t = tex(96, 80, (ctx) => {
        // Abdomen - gradient filled segment
        const abdGrd = ctx.createRadialGradient(48, 52, 4, 48, 52, 22);
        abdGrd.addColorStop(0, '#E53935');
        abdGrd.addColorStop(0.6, '#C62828');
        abdGrd.addColorStop(1, '#8B0000');
        ctx.fillStyle = abdGrd;
        ctx.beginPath();
        ctx.ellipse(48, 52, 32, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        // Abdomen segments
        ctx.strokeStyle = 'rgba(139,0,0,0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(24, 44); ctx.lineTo(72, 44); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(20, 52); ctx.lineTo(76, 52); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(24, 60); ctx.lineTo(72, 60); ctx.stroke();

        // Thorax - gradient
        const thorGrd = ctx.createRadialGradient(48, 32, 4, 48, 32, 18);
        thorGrd.addColorStop(0, '#FF5252');
        thorGrd.addColorStop(0.5, hex(COLORS.enemyRed));
        thorGrd.addColorStop(1, '#B71C1C');
        ctx.fillStyle = thorGrd;
        ctx.beginPath();
        ctx.ellipse(48, 32, 20, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head - gradient
        const headGrd = ctx.createRadialGradient(48, 16, 2, 48, 16, 14);
        headGrd.addColorStop(0, '#E53935');
        headGrd.addColorStop(0.7, '#C62828');
        headGrd.addColorStop(1, '#8B0000');
        ctx.fillStyle = headGrd;
        ctx.beginPath();
        ctx.ellipse(48, 16, 16, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glowing arc eyes
        ctx.shadowColor = '#FF1744';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#FF1744';
        ctx.beginPath();
        ctx.arc(40, 14, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(56, 14, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Eye bright center
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(41, 13, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(57, 13, 2, 0, Math.PI * 2);
        ctx.fill();

        // Antennae with smooth curves
        ctx.strokeStyle = '#B71C1C';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(40, 8);
        ctx.quadraticCurveTo(30, 0, 22, 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(56, 8);
        ctx.quadraticCurveTo(66, 0, 74, 4);
        ctx.stroke();

        // Glowing antennae tips
        ctx.shadowColor = '#FF1744';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#FF1744';
        ctx.beginPath();
        ctx.arc(22, 4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(74, 4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Jointed legs (6 legs, 3 per side)
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (let i = 0; i < 3; i++) {
          const ly = 32 + i * 12;
          // Left legs
          ctx.beginPath();
          ctx.moveTo(28, ly);
          ctx.quadraticCurveTo(16, ly + 4, 4, ly + 2);
          ctx.stroke();
          // Right legs
          ctx.beginPath();
          ctx.moveTo(68, ly);
          ctx.quadraticCurveTo(80, ly + 4, 92, ly + 2);
          ctx.stroke();
        }

        // Mandibles
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.ellipse(38, 26, 4, 2, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(58, 26, 4, 2, 0.4, 0, Math.PI * 2);
        ctx.fill();
      });
      break;

    case 'monolith':
      t = tex(128, 160, (ctx) => {
        // Metallic gradient body
        const bodyGrd = ctx.createLinearGradient(16, 8, 112, 152);
        bodyGrd.addColorStop(0, '#757575');
        bodyGrd.addColorStop(0.3, '#616161');
        bodyGrd.addColorStop(0.7, '#4E4E4E');
        bodyGrd.addColorStop(1, '#383838');
        ctx.fillStyle = bodyGrd;
        roundRect(ctx, 16, 8, 96, 144, 4);
        ctx.fill();

        // Edge bevels
        const topBevel = ctx.createLinearGradient(16, 8, 16, 24);
        topBevel.addColorStop(0, '#8A8A8A');
        topBevel.addColorStop(1, 'rgba(138,138,138,0)');
        ctx.fillStyle = topBevel;
        ctx.fillRect(16, 8, 96, 16);

        const botBevel = ctx.createLinearGradient(16, 136, 16, 152);
        botBevel.addColorStop(0, 'rgba(35,35,35,0)');
        botBevel.addColorStop(1, '#232323');
        ctx.fillStyle = botBevel;
        ctx.fillRect(16, 136, 96, 16);

        const leftBevel = ctx.createLinearGradient(16, 0, 32, 0);
        leftBevel.addColorStop(0, 'rgba(90,90,90,0.4)');
        leftBevel.addColorStop(1, 'rgba(90,90,90,0)');
        ctx.fillStyle = leftBevel;
        ctx.fillRect(16, 8, 16, 144);

        const rightBevel = ctx.createLinearGradient(96, 0, 112, 0);
        rightBevel.addColorStop(0, 'rgba(40,40,40,0)');
        rightBevel.addColorStop(1, 'rgba(40,40,40,0.5)');
        ctx.fillStyle = rightBevel;
        ctx.fillRect(96, 8, 16, 144);

        // Multi-layer glowing cracks
        const cracks = [
          [[32,40],[40,56],[32,72],[44,88],[36,104]],
          [[96,48],[88,64],[100,80],[88,96]],
          [[64,112],[56,128],[64,140]],
          [[72,104],[80,120],[72,132]],
        ];
        // Outer glow layer
        ctx.strokeStyle = 'rgba(211,47,47,0.2)';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        for (const crack of cracks) {
          ctx.beginPath();
          ctx.moveTo(crack[0][0], crack[0][1]);
          for (let i = 1; i < crack.length; i++) ctx.lineTo(crack[i][0], crack[i][1]);
          ctx.stroke();
        }
        // Mid glow
        ctx.strokeStyle = 'rgba(211,47,47,0.4)';
        ctx.lineWidth = 3;
        for (const crack of cracks) {
          ctx.beginPath();
          ctx.moveTo(crack[0][0], crack[0][1]);
          for (let i = 1; i < crack.length; i++) ctx.lineTo(crack[i][0], crack[i][1]);
          ctx.stroke();
        }
        // Core bright
        ctx.shadowColor = '#FF5252';
        ctx.shadowBlur = 6;
        ctx.strokeStyle = '#FF5252';
        ctx.lineWidth = 1.5;
        for (const crack of cracks) {
          ctx.beginPath();
          ctx.moveTo(crack[0][0], crack[0][1]);
          for (let i = 1; i < crack.length; i++) ctx.lineTo(crack[i][0], crack[i][1]);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // Gradient chain links - left
        for (let cy = 24; cy < 128; cy += 16) {
          const chainGrd = ctx.createLinearGradient(20, cy - 6, 28, cy + 6);
          chainGrd.addColorStop(0, '#BDBDBD');
          chainGrd.addColorStop(0.5, '#9E9E9E');
          chainGrd.addColorStop(1, '#757575');
          ctx.strokeStyle = chainGrd;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(24, cy, 8, 6, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        // Chains - right
        for (let cy = 32; cy < 136; cy += 16) {
          const chainGrd = ctx.createLinearGradient(100, cy - 6, 108, cy + 6);
          chainGrd.addColorStop(0, '#BDBDBD');
          chainGrd.addColorStop(0.5, '#9E9E9E');
          chainGrd.addColorStop(1, '#757575');
          ctx.strokeStyle = chainGrd;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(104, cy, 8, 6, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Gold gradient lock
        const lockGrd = ctx.createLinearGradient(52, 96, 52, 116);
        lockGrd.addColorStop(0, '#FFE44D');
        lockGrd.addColorStop(0.5, '#FFD700');
        lockGrd.addColorStop(1, '#B8860B');
        ctx.fillStyle = lockGrd;
        roundRect(ctx, 52, 100, 24, 20, 3);
        ctx.fill();
        // Lock shackle
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(64, 100, 10, Math.PI, 0);
        ctx.stroke();
        // Keyhole
        ctx.fillStyle = '#424242';
        ctx.beginPath();
        ctx.arc(64, 107, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(62, 107, 4, 8);

        // Radial glow eyes
        ctx.shadowColor = '#FF1744';
        ctx.shadowBlur = 16;
        // Left eye
        const eyeGrd1 = ctx.createRadialGradient(40, 36, 2, 40, 36, 12);
        eyeGrd1.addColorStop(0, '#ffffff');
        eyeGrd1.addColorStop(0.3, '#FF5252');
        eyeGrd1.addColorStop(0.7, hex(COLORS.bossRed));
        eyeGrd1.addColorStop(1, 'rgba(211,47,47,0.3)');
        ctx.fillStyle = eyeGrd1;
        ctx.beginPath();
        ctx.arc(40, 36, 12, 0, Math.PI * 2);
        ctx.fill();
        // Right eye
        const eyeGrd2 = ctx.createRadialGradient(88, 36, 2, 88, 36, 12);
        eyeGrd2.addColorStop(0, '#ffffff');
        eyeGrd2.addColorStop(0.3, '#FF5252');
        eyeGrd2.addColorStop(0.7, hex(COLORS.bossRed));
        eyeGrd2.addColorStop(1, 'rgba(211,47,47,0.3)');
        ctx.fillStyle = eyeGrd2;
        ctx.beginPath();
        ctx.arc(88, 36, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Pupils
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(42, 36, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(90, 36, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // CMS text
        ctx.font = 'bold 20px monospace';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.fillText('CMS', 64, 82);

        // Mouth
        ctx.fillStyle = hex(COLORS.bossRed);
        roundRect(ctx, 40, 120, 48, 8, 2);
        ctx.fill();
      });
      break;

    case 'drama':
      t = tex(128, 96, (ctx) => {
        // Multi-gradient cloud puffs
        // Main cloud body
        const bodyGrd = ctx.createRadialGradient(64, 40, 8, 64, 40, 48);
        bodyGrd.addColorStop(0, '#505050');
        bodyGrd.addColorStop(0.5, '#3E3E3E');
        bodyGrd.addColorStop(1, '#2A2A2A');
        ctx.fillStyle = bodyGrd;
        ctx.beginPath();
        ctx.ellipse(64, 40, 56, 32, 0, 0, Math.PI * 2);
        ctx.fill();

        // Left puff
        const puffGrd1 = ctx.createRadialGradient(36, 28, 4, 36, 28, 28);
        puffGrd1.addColorStop(0, '#484848');
        puffGrd1.addColorStop(1, '#2E2E2E');
        ctx.fillStyle = puffGrd1;
        ctx.beginPath();
        ctx.ellipse(36, 28, 32, 24, 0, 0, Math.PI * 2);
        ctx.fill();

        // Right puff
        const puffGrd2 = ctx.createRadialGradient(92, 28, 4, 92, 28, 28);
        puffGrd2.addColorStop(0, '#484848');
        puffGrd2.addColorStop(1, '#2E2E2E');
        ctx.fillStyle = puffGrd2;
        ctx.beginPath();
        ctx.ellipse(92, 28, 32, 24, 0, 0, Math.PI * 2);
        ctx.fill();

        // Top puff
        const puffGrd3 = ctx.createRadialGradient(64, 16, 2, 64, 16, 22);
        puffGrd3.addColorStop(0, '#444444');
        puffGrd3.addColorStop(1, '#252525');
        ctx.fillStyle = puffGrd3;
        ctx.beginPath();
        ctx.ellipse(64, 16, 24, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Angry arc eyes with glow
        ctx.shadowColor = '#FF1744';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#FF1744';
        ctx.beginPath();
        ctx.arc(44, 36, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(84, 36, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Eye highlights
        ctx.fillStyle = '#FF5252';
        ctx.beginPath();
        ctx.arc(44, 36, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(84, 36, 5, 0, Math.PI * 2);
        ctx.fill();
        // Eye bright centers
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(43, 34, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(83, 34, 2, 0, Math.PI * 2);
        ctx.fill();

        // Main lightning bolt with glow
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 10;
        const boltGrd = ctx.createLinearGradient(48, 56, 64, 84);
        boltGrd.addColorStop(0, '#FFEB3B');
        boltGrd.addColorStop(0.5, '#FFD700');
        boltGrd.addColorStop(1, '#FF8F00');
        ctx.fillStyle = boltGrd;
        ctx.beginPath();
        ctx.moveTo(56, 56);
        ctx.lineTo(48, 68);
        ctx.lineTo(56, 68);
        ctx.lineTo(48, 84);
        ctx.lineTo(64, 64);
        ctx.lineTo(56, 64);
        ctx.lineTo(64, 56);
        ctx.closePath();
        ctx.fill();

        // Second bolt (left)
        ctx.fillStyle = '#FFC107';
        ctx.beginPath();
        ctx.moveTo(28, 56);
        ctx.lineTo(24, 64);
        ctx.lineTo(28, 64);
        ctx.lineTo(20, 76);
        ctx.lineTo(32, 60);
        ctx.lineTo(28, 60);
        ctx.lineTo(32, 56);
        ctx.closePath();
        ctx.fill();

        // Third bolt (right)
        ctx.beginPath();
        ctx.moveTo(96, 60);
        ctx.lineTo(92, 68);
        ctx.lineTo(96, 68);
        ctx.lineTo(88, 80);
        ctx.lineTo(100, 64);
        ctx.lineTo(96, 64);
        ctx.lineTo(100, 60);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Elongated rain drops
        ctx.fillStyle = '#64B5F6';
        for (let i = 0; i < 7; i++) {
          const rx = 24 + i * 14;
          const ry = 78 + (i % 2) * 6;
          ctx.beginPath();
          ctx.ellipse(rx, ry, 1.5, 5, 0.1, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#42A5F5';
        for (let i = 0; i < 6; i++) {
          const rx = 30 + i * 14;
          const ry = 86 + (i % 2) * 4;
          ctx.beginPath();
          ctx.ellipse(rx, ry, 1.5, 4, -0.1, 0, Math.PI * 2);
          ctx.fill();
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
    const lw = Math.max(192, label.length * 24);
    const lh = 48;
    const lt = tex(lw, lh, (ctx) => {
      // Rounded rect background with gradient
      const bgGrd = ctx.createLinearGradient(0, 0, 0, lh);
      bgGrd.addColorStop(0, 'rgba(0,0,0,0.8)');
      bgGrd.addColorStop(1, 'rgba(20,20,20,0.7)');
      ctx.fillStyle = bgGrd;
      roundRect(ctx, 2, 2, lw - 4, lh - 4, 8);
      ctx.fill();
      // Border
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      roundRect(ctx, 2, 2, lw - 4, lh - 4, 8);
      ctx.stroke();
      // Text with shadow
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, lw / 2, lh / 2);
      ctx.shadowBlur = 0;
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
  const t = tex(96, 96, (ctx) => {
    switch (type) {
      case 'graphql': {
        // Spark particles as small arcs
        ctx.fillStyle = 'rgba(233,30,99,0.3)';
        for (let i = 0; i < 10; i++) {
          const px = 8 + Math.random() * 80;
          const py = 8 + Math.random() * 80;
          ctx.beginPath();
          ctx.arc(px, py, 2 + Math.random() * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Electric glow behind bolt
        const boltGlow = ctx.createRadialGradient(48, 48, 4, 48, 48, 40);
        boltGlow.addColorStop(0, 'rgba(233,30,99,0.5)');
        boltGlow.addColorStop(0.5, 'rgba(233,30,99,0.15)');
        boltGlow.addColorStop(1, 'rgba(233,30,99,0)');
        ctx.fillStyle = boltGlow;
        ctx.fillRect(0, 0, 96, 96);

        // Gradient lightning bolt
        const boltGrd = ctx.createLinearGradient(28, 4, 68, 92);
        boltGrd.addColorStop(0, '#FF80AB');
        boltGrd.addColorStop(0.4, hex(COLORS.powerPink));
        boltGrd.addColorStop(1, '#AD1457');
        ctx.fillStyle = boltGrd;
        ctx.beginPath();
        ctx.moveTo(56, 4);
        ctx.lineTo(28, 44);
        ctx.lineTo(48, 44);
        ctx.lineTo(32, 92);
        ctx.lineTo(68, 52);
        ctx.lineTo(48, 52);
        ctx.lineTo(56, 4);
        ctx.fill();

        // Bolt electric glow outline
        ctx.shadowColor = hex(COLORS.powerPink);
        ctx.shadowBlur = 12;
        ctx.strokeStyle = 'rgba(255,128,171,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(56, 4);
        ctx.lineTo(28, 44);
        ctx.lineTo(48, 44);
        ctx.lineTo(32, 92);
        ctx.lineTo(68, 52);
        ctx.lineTo(48, 52);
        ctx.lineTo(56, 4);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Bolt highlight
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.moveTo(52, 12);
        ctx.lineTo(40, 36);
        ctx.lineTo(48, 36);
        ctx.lineTo(52, 12);
        ctx.fill();

        // Spark arcs around bolt
        ctx.strokeStyle = '#FF80AB';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const r = 30 + Math.random() * 10;
          const sx = 48 + Math.cos(angle) * r;
          const sy = 48 + Math.sin(angle) * r;
          ctx.beginPath();
          ctx.arc(sx, sy, 2 + Math.random() * 2, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      }
      case 'oauth': {
        // Shield glow
        const shieldGlow = ctx.createRadialGradient(48, 48, 8, 48, 48, 44);
        shieldGlow.addColorStop(0, 'rgba(33,150,243,0.4)');
        shieldGlow.addColorStop(1, 'rgba(33,150,243,0)');
        ctx.fillStyle = shieldGlow;
        ctx.fillRect(0, 0, 96, 96);

        // 3D gradient shield
        const shieldGrd = ctx.createLinearGradient(12, 8, 84, 84);
        shieldGrd.addColorStop(0, '#64B5F6');
        shieldGrd.addColorStop(0.3, hex(COLORS.shieldBlue));
        shieldGrd.addColorStop(0.7, '#1976D2');
        shieldGrd.addColorStop(1, '#0D47A1');
        ctx.fillStyle = shieldGrd;
        ctx.beginPath();
        ctx.moveTo(48, 8);
        ctx.lineTo(84, 24);
        ctx.lineTo(80, 60);
        ctx.lineTo(48, 84);
        ctx.lineTo(16, 60);
        ctx.lineTo(12, 24);
        ctx.closePath();
        ctx.fill();

        // Rim highlight
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(48, 8);
        ctx.lineTo(84, 24);
        ctx.lineTo(80, 60);
        ctx.lineTo(48, 84);
        ctx.lineTo(16, 60);
        ctx.lineTo(12, 24);
        ctx.closePath();
        ctx.stroke();

        // Shield inner border
        ctx.strokeStyle = '#90CAF9';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(48, 16);
        ctx.lineTo(76, 28);
        ctx.lineTo(72, 56);
        ctx.lineTo(48, 76);
        ctx.lineTo(24, 56);
        ctx.lineTo(20, 28);
        ctx.closePath();
        ctx.stroke();

        // Smooth arc lock
        ctx.fillStyle = '#ffffff';
        roundRect(ctx, 40, 48, 16, 16, 3);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(48, 48, 8, Math.PI, 0);
        ctx.stroke();
        // Keyhole
        ctx.fillStyle = hex(COLORS.shieldBlue);
        ctx.beginPath();
        ctx.arc(48, 54, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(46, 54, 4, 6);

        // Shield gleam
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.moveTo(48, 16);
        ctx.lineTo(26, 28);
        ctx.lineTo(26, 44);
        ctx.lineTo(48, 32);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'ai': {
        // Circuit lines background
        ctx.strokeStyle = 'rgba(255,215,0,0.2)';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        // Horizontal
        ctx.beginPath(); ctx.moveTo(0, 32); ctx.lineTo(20, 32); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(76, 32); ctx.lineTo(96, 32); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 64); ctx.lineTo(20, 64); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(76, 64); ctx.lineTo(96, 64); ctx.stroke();
        // Vertical
        ctx.beginPath(); ctx.moveTo(32, 0); ctx.lineTo(32, 18); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(64, 0); ctx.lineTo(64, 18); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(32, 78); ctx.lineTo(32, 96); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(64, 78); ctx.lineTo(64, 96); ctx.stroke();

        // Circuit node dots
        ctx.fillStyle = 'rgba(255,215,0,0.35)';
        const nodePts = [[20,30],[76,30],[20,62],[76,62],[30,18],[62,18],[30,78],[62,78]];
        for (const [nx, ny] of nodePts) {
          ctx.beginPath();
          ctx.arc(nx, ny, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Pulsing glow behind star
        const starGlow = ctx.createRadialGradient(48, 48, 4, 48, 48, 40);
        starGlow.addColorStop(0, 'rgba(255,215,0,0.5)');
        starGlow.addColorStop(0.5, 'rgba(255,215,0,0.15)');
        starGlow.addColorStop(1, 'rgba(255,215,0,0)');
        ctx.fillStyle = starGlow;
        ctx.fillRect(0, 0, 96, 96);

        // Smooth bezier star with radial gradient
        const sGrd = ctx.createRadialGradient(48, 48, 4, 48, 48, 36);
        sGrd.addColorStop(0, '#FFF9C4');
        sGrd.addColorStop(0.4, hex(COLORS.gold));
        sGrd.addColorStop(1, '#F9A825');
        ctx.fillStyle = sGrd;
        ctx.beginPath();
        // 5-pointed star using bezier curves for smooth points
        const cx2 = 48, cy2 = 48, outerR = 32, innerR = 14;
        for (let i = 0; i < 5; i++) {
          const outerAngle = (i * 72 - 90) * Math.PI / 180;
          const innerAngle = ((i * 72 + 36) - 90) * Math.PI / 180;
          const ox = cx2 + Math.cos(outerAngle) * outerR;
          const oy = cy2 + Math.sin(outerAngle) * outerR;
          const ix = cx2 + Math.cos(innerAngle) * innerR;
          const iy = cy2 + Math.sin(innerAngle) * innerR;
          if (i === 0) ctx.moveTo(ox, oy);
          else ctx.lineTo(ox, oy);
          ctx.quadraticCurveTo(cx2 + Math.cos(outerAngle + 0.3) * innerR * 0.7,
                               cy2 + Math.sin(outerAngle + 0.3) * innerR * 0.7,
                               ix, iy);
        }
        ctx.closePath();
        ctx.fill();

        // Star highlight
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        ctx.moveTo(48, 16);
        ctx.lineTo(54, 36);
        ctx.lineTo(38, 36);
        ctx.closePath();
        ctx.fill();

        // AI text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('AI', 48, 52);
        break;
      }
      case 'heart': {
        // Heart glow
        const heartGlow = ctx.createRadialGradient(48, 48, 8, 48, 48, 44);
        heartGlow.addColorStop(0, 'rgba(244,67,54,0.4)');
        heartGlow.addColorStop(1, 'rgba(244,67,54,0)');
        ctx.fillStyle = heartGlow;
        ctx.fillRect(0, 0, 96, 96);

        // Outer heart pulse ring
        ctx.fillStyle = 'rgba(244,67,54,0.2)';
        ctx.beginPath();
        ctx.moveTo(48, 84);
        ctx.bezierCurveTo(4, 56, 4, 16, 24, 16);
        ctx.bezierCurveTo(32, 16, 48, 28, 48, 28);
        ctx.bezierCurveTo(48, 28, 64, 16, 72, 16);
        ctx.bezierCurveTo(92, 16, 92, 56, 48, 84);
        ctx.fill();

        // Main heart with multi-layer gradient
        const heartGrd = ctx.createRadialGradient(40, 36, 4, 48, 48, 40);
        heartGrd.addColorStop(0, '#FF8A80');
        heartGrd.addColorStop(0.3, hex(COLORS.heartRed));
        heartGrd.addColorStop(0.7, '#D32F2F');
        heartGrd.addColorStop(1, '#B71C1C');
        ctx.fillStyle = heartGrd;
        ctx.beginPath();
        ctx.moveTo(48, 76);
        ctx.bezierCurveTo(12, 52, 12, 20, 28, 20);
        ctx.bezierCurveTo(36, 20, 48, 32, 48, 32);
        ctx.bezierCurveTo(48, 32, 60, 20, 68, 20);
        ctx.bezierCurveTo(84, 20, 84, 52, 48, 76);
        ctx.fill();

        // Smooth specular highlight
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        ctx.ellipse(34, 32, 8, 12, -0.4, 0, Math.PI * 2);
        ctx.fill();

        // EKG pulse lines
        ctx.strokeStyle = 'rgba(244,67,54,0.5)';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // Left pulse
        ctx.beginPath();
        ctx.moveTo(2, 48);
        ctx.lineTo(10, 48);
        ctx.lineTo(14, 40);
        ctx.lineTo(18, 48);
        ctx.lineTo(22, 48);
        ctx.stroke();
        // Right pulse
        ctx.beginPath();
        ctx.moveTo(74, 48);
        ctx.lineTo(78, 48);
        ctx.lineTo(82, 40);
        ctx.lineTo(86, 48);
        ctx.lineTo(94, 48);
        ctx.stroke();
        break;
      }
    }
  });

  // Glow mesh behind powerup (smoother 64x64)
  const glowTex = tex(64, 64, (ctx) => {
    const grd = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
    const glowColors = {
      graphql: 'rgba(233,30,99,',
      oauth: 'rgba(33,150,243,',
      ai: 'rgba(255,215,0,',
      heart: 'rgba(244,67,54,',
    };
    const gc = glowColors[type] || 'rgba(255,255,255,';
    grd.addColorStop(0, gc + '0.4)');
    grd.addColorStop(0.4, gc + '0.15)');
    grd.addColorStop(0.7, gc + '0.05)');
    grd.addColorStop(1, gc + '0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 64, 64);
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
  const t = tex(64, 64, (ctx) => {
    // Metallic gradient rim
    const rimGrd = ctx.createRadialGradient(32, 32, 20, 32, 32, 28);
    rimGrd.addColorStop(0, '#DAA520');
    rimGrd.addColorStop(0.5, '#B8860B');
    rimGrd.addColorStop(1, '#8B6914');
    ctx.fillStyle = rimGrd;
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI * 2);
    ctx.fill();

    // Radial gradient face
    const faceGrd = ctx.createRadialGradient(28, 28, 2, 32, 32, 24);
    faceGrd.addColorStop(0, '#FFE44D');
    faceGrd.addColorStop(0.4, hex(COLORS.gold));
    faceGrd.addColorStop(1, '#DAA520');
    ctx.fillStyle = faceGrd;
    ctx.beginPath();
    ctx.arc(32, 32, 24, 0, Math.PI * 2);
    ctx.fill();

    // Inner ring bevel
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(32, 32, 16, 0, Math.PI * 2);
    ctx.stroke();

    // Smooth bevel highlights - top arc
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(32, 32, 23, -Math.PI * 0.8, -Math.PI * 0.2);
    ctx.stroke();

    // Embossed {} symbol
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = '#FFF8E1';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('{}', 32, 33);
    ctx.shadowBlur = 0;

    // Shine highlight (top-left)
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.ellipse(24, 22, 6, 10, -0.6, 0, Math.PI * 2);
    ctx.fill();

    // 4-pointed star sparkle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(16, 14);
    ctx.lineTo(17, 12);
    ctx.lineTo(18, 14);
    ctx.lineTo(17, 16);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(15, 13);
    ctx.lineTo(17, 14);
    ctx.lineTo(19, 13);
    ctx.lineTo(17, 12);
    ctx.closePath();
    ctx.fill();
  });
  return new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.8),
    new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.1 })
  );
}

// ── Sign ─────────────────────────────────────────────────────
export function createSignMesh() {
  const t = tex(64, 96, (ctx) => {
    // Post - gradient cylindrical shading
    const postGrd = ctx.createLinearGradient(24, 0, 40, 0);
    postGrd.addColorStop(0, '#6B3410');
    postGrd.addColorStop(0.3, '#A0522D');
    postGrd.addColorStop(0.5, '#8B4513');
    postGrd.addColorStop(0.7, '#A0522D');
    postGrd.addColorStop(1, '#6B3410');
    ctx.fillStyle = postGrd;
    roundRect(ctx, 26, 48, 12, 48, 2);
    ctx.fill();

    // Wood plank board
    const boardGrd = ctx.createLinearGradient(0, 0, 0, 52);
    boardGrd.addColorStop(0, '#F5DEB3');
    boardGrd.addColorStop(0.3, '#DEB887');
    boardGrd.addColorStop(0.7, '#D2A86E');
    boardGrd.addColorStop(1, '#C4975A');
    ctx.fillStyle = boardGrd;
    roundRect(ctx, 4, 0, 56, 52, 4);
    ctx.fill();

    // Board outline
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    roundRect(ctx, 4, 0, 56, 52, 4);
    ctx.stroke();

    // Wood grain texture (vertical lines)
    ctx.strokeStyle = 'rgba(139,69,19,0.15)';
    ctx.lineWidth = 1;
    for (let x = 8; x < 58; x += 5 + Math.random() * 4) {
      ctx.beginPath();
      ctx.moveTo(x, 2);
      ctx.bezierCurveTo(x + 1, 15, x - 1, 30, x + 1, 50);
      ctx.stroke();
    }

    // Nail circles at corners
    const nails = [[10, 6], [54, 6], [10, 46], [54, 46]];
    for (const [nx, ny] of nails) {
      const nailGrd = ctx.createRadialGradient(nx, ny, 0, nx, ny, 3);
      nailGrd.addColorStop(0, '#C0C0C0');
      nailGrd.addColorStop(0.5, '#808080');
      nailGrd.addColorStop(1, '#555555');
      ctx.fillStyle = nailGrd;
      ctx.beginPath();
      ctx.arc(nx, ny, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Gradient i-icon circle
    const iGrd = ctx.createRadialGradient(32, 28, 2, 32, 28, 12);
    iGrd.addColorStop(0, hex(COLORS.drupalBlueLight));
    iGrd.addColorStop(1, hex(COLORS.drupalBlueDark));
    ctx.fillStyle = iGrd;
    ctx.beginPath();
    ctx.arc(32, 28, 12, 0, Math.PI * 2);
    ctx.fill();

    // i text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('i', 32, 29);
  });
  return new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 1.8),
    new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.1 })
  );
}

// ── Boss ("The Monolith") ────────────────────────────────────
export function createBossSprite() {
  const g = new THREE.Group();
  const t = tex(256, 320, (ctx) => {
    // Background energy glow
    const bgGlow = ctx.createRadialGradient(128, 160, 32, 128, 160, 128);
    bgGlow.addColorStop(0, 'rgba(211,47,47,0.15)');
    bgGlow.addColorStop(1, 'rgba(211,47,47,0)');
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, 256, 320);

    // Multi-stop metallic gradient body
    const bodyGrd = ctx.createLinearGradient(32, 24, 224, 296);
    bodyGrd.addColorStop(0, '#546E7A');
    bodyGrd.addColorStop(0.15, '#455A64');
    bodyGrd.addColorStop(0.4, hex(COLORS.bossGray));
    bodyGrd.addColorStop(0.6, '#2E3B42');
    bodyGrd.addColorStop(0.85, '#263238');
    bodyGrd.addColorStop(1, '#1B252B');
    ctx.fillStyle = bodyGrd;
    roundRect(ctx, 32, 24, 192, 272, 8);
    ctx.fill();

    // Gradient bevel edges - top
    const topBevel = ctx.createLinearGradient(32, 24, 32, 64);
    topBevel.addColorStop(0, '#607D8B');
    topBevel.addColorStop(1, 'rgba(96,125,139,0)');
    ctx.fillStyle = topBevel;
    ctx.fillRect(32, 24, 192, 40);

    // Bottom bevel
    const botBevel = ctx.createLinearGradient(32, 256, 32, 296);
    botBevel.addColorStop(0, 'rgba(19,30,36,0)');
    botBevel.addColorStop(1, '#131E24');
    ctx.fillStyle = botBevel;
    ctx.fillRect(32, 256, 192, 40);

    // Side bevels
    const leftBevel = ctx.createLinearGradient(32, 0, 52, 0);
    leftBevel.addColorStop(0, 'rgba(96,125,139,0.3)');
    leftBevel.addColorStop(1, 'rgba(96,125,139,0)');
    ctx.fillStyle = leftBevel;
    ctx.fillRect(32, 24, 20, 272);

    const rightBevel = ctx.createLinearGradient(204, 0, 224, 0);
    rightBevel.addColorStop(0, 'rgba(19,30,36,0)');
    rightBevel.addColorStop(1, 'rgba(19,30,36,0.4)');
    ctx.fillStyle = rightBevel;
    ctx.fillRect(204, 24, 20, 272);

    // Thick outline
    ctx.strokeStyle = '#131E24';
    ctx.lineWidth = 4;
    roundRect(ctx, 32, 24, 192, 272, 8);
    ctx.stroke();

    // Large radial-glow eyes with concentric rings
    // Left eye
    ctx.shadowColor = '#FF1744';
    ctx.shadowBlur = 24;
    const eyeGrd1 = ctx.createRadialGradient(88, 88, 4, 88, 88, 24);
    eyeGrd1.addColorStop(0, '#ffffff');
    eyeGrd1.addColorStop(0.2, '#FFCDD2');
    eyeGrd1.addColorStop(0.4, '#FF5252');
    eyeGrd1.addColorStop(0.7, '#D32F2F');
    eyeGrd1.addColorStop(1, '#B71C1C');
    ctx.fillStyle = eyeGrd1;
    ctx.beginPath();
    ctx.arc(88, 88, 24, 0, Math.PI * 2);
    ctx.fill();
    // Concentric ring
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(88, 88, 16, 0, Math.PI * 2);
    ctx.stroke();
    // Pupil
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(92, 88, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    // Eye glint
    ctx.fillStyle = '#FFCDD2';
    ctx.beginPath();
    ctx.ellipse(96, 84, 4, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Right eye
    const eyeGrd2 = ctx.createRadialGradient(168, 88, 4, 168, 88, 24);
    eyeGrd2.addColorStop(0, '#ffffff');
    eyeGrd2.addColorStop(0.2, '#FFCDD2');
    eyeGrd2.addColorStop(0.4, '#FF5252');
    eyeGrd2.addColorStop(0.7, '#D32F2F');
    eyeGrd2.addColorStop(1, '#B71C1C');
    ctx.fillStyle = eyeGrd2;
    ctx.beginPath();
    ctx.arc(168, 88, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(168, 88, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(172, 88, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFCDD2';
    ctx.beginPath();
    ctx.ellipse(176, 84, 4, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Engraved MONOLITH text
    ctx.fillStyle = '#78909C';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText('MONO', 128, 144);
    ctx.fillText('LITH', 128, 172);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Mouth (angry snarl) with gradient
    const mouthGrd = ctx.createLinearGradient(64, 208, 64, 232);
    mouthGrd.addColorStop(0, '#B71C1C');
    mouthGrd.addColorStop(1, '#D32F2F');
    ctx.fillStyle = mouthGrd;
    roundRect(ctx, 72, 208, 112, 24, 4);
    ctx.fill();
    // Lip corners
    ctx.fillStyle = '#D32F2F';
    ctx.beginPath();
    ctx.ellipse(64, 204, 12, 8, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(192, 204, 12, 8, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Individually gradient-filled teeth
    for (let tx = 80; tx < 176; tx += 16) {
      const toothGrd = ctx.createLinearGradient(tx, 208, tx, 220);
      toothGrd.addColorStop(0, '#ffffff');
      toothGrd.addColorStop(0.5, '#E0E0E0');
      toothGrd.addColorStop(1, '#BDBDBD');
      ctx.fillStyle = toothGrd;
      ctx.beginPath();
      ctx.moveTo(tx, 208);
      ctx.lineTo(tx + 6, 208);
      ctx.lineTo(tx + 3, 220);
      ctx.closePath();
      ctx.fill();
    }

    // Many more glowing cracks (8-10)
    const bossCracks = [
      [[56,160],[72,184],[56,208],[72,240]],
      [[48,128],[64,152],[52,168]],
      [[200,152],[184,176],[200,200],[188,232]],
      [[208,120],[192,144],[204,160]],
      [[120,248],[112,264],[120,280]],
      [[144,240],[136,264],[148,280]],
      [[64,240],[72,256],[60,272],[68,288]],
      [[192,240],[184,260],[196,276]],
      [[100,192],[92,212],[104,224]],
      [[160,192],[168,208],[156,228]],
    ];

    // Outer glow
    ctx.strokeStyle = 'rgba(255,82,82,0.15)';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    for (const crack of bossCracks) {
      ctx.beginPath();
      ctx.moveTo(crack[0][0], crack[0][1]);
      for (let i = 1; i < crack.length; i++) ctx.lineTo(crack[i][0], crack[i][1]);
      ctx.stroke();
    }
    // Mid glow
    ctx.strokeStyle = 'rgba(255,82,82,0.35)';
    ctx.lineWidth = 4;
    for (const crack of bossCracks) {
      ctx.beginPath();
      ctx.moveTo(crack[0][0], crack[0][1]);
      for (let i = 1; i < crack.length; i++) ctx.lineTo(crack[i][0], crack[i][1]);
      ctx.stroke();
    }
    // Core bright with shadowBlur
    ctx.shadowColor = '#FF5252';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#FF5252';
    ctx.lineWidth = 2;
    for (const crack of bossCracks) {
      ctx.beginPath();
      ctx.moveTo(crack[0][0], crack[0][1]);
      for (let i = 1; i < crack.length; i++) ctx.lineTo(crack[i][0], crack[i][1]);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Gradient health bar
    ctx.fillStyle = '#1B2631';
    roundRect(ctx, 48, 32, 160, 20, 4);
    ctx.fill();
    ctx.strokeStyle = '#455A64';
    ctx.lineWidth = 2;
    roundRect(ctx, 48, 32, 160, 20, 4);
    ctx.stroke();
    // HP fill gradient
    const hpGrd = ctx.createLinearGradient(52, 36, 52, 48);
    hpGrd.addColorStop(0, '#FF5252');
    hpGrd.addColorStop(0.5, '#D32F2F');
    hpGrd.addColorStop(1, '#B71C1C');
    ctx.fillStyle = hpGrd;
    roundRect(ctx, 52, 36, 152, 12, 2);
    ctx.fill();
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
  const t = tex(32, 32, (ctx) => {
    // Motion trail circles behind
    ctx.fillStyle = 'rgba(233,30,99,0.15)';
    ctx.beginPath();
    ctx.arc(8, 16, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(233,30,99,0.25)';
    ctx.beginPath();
    ctx.arc(12, 16, 5, 0, Math.PI * 2);
    ctx.fill();

    // Soft radial gradient orb (white center -> pink -> transparent)
    const orbGrd = ctx.createRadialGradient(18, 16, 1, 18, 16, 12);
    orbGrd.addColorStop(0, '#ffffff');
    orbGrd.addColorStop(0.25, '#FF80AB');
    orbGrd.addColorStop(0.5, hex(COLORS.powerPink));
    orbGrd.addColorStop(0.8, 'rgba(233,30,99,0.3)');
    orbGrd.addColorStop(1, 'rgba(233,30,99,0)');
    ctx.fillStyle = orbGrd;
    ctx.fillRect(0, 0, 32, 32);
  });
  return new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.5),
    new THREE.MeshBasicMaterial({ map: t, transparent: true })
  );
}

// ── Particle ─────────────────────────────────────────────────
export function createParticleMesh(color) {
  const t = tex(16, 16, (ctx) => {
    // Soft glow texture with radial gradient (solid center fading to transparent)
    const hexColor = '#' + color.toString(16).padStart(6, '0');
    const grd = ctx.createRadialGradient(8, 8, 1, 8, 8, 8);
    grd.addColorStop(0, hexColor);
    grd.addColorStop(0.4, hexColor);
    grd.addColorStop(0.7, hexColor + '88');
    grd.addColorStop(1, hexColor + '00');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 16, 16);
  });
  return new THREE.Mesh(
    new THREE.PlaneGeometry(0.25, 0.25),
    new THREE.MeshBasicMaterial({ map: t, transparent: true })
  );
}

// ── Deploy Portal ────────────────────────────────────────────
export function createPortalSprite() {
  const g = new THREE.Group();
  const t = tex(192, 256, (ctx) => {
    const cx = 96, cy = 128;

    // Outer swirl ring - blue
    const outerGrd = ctx.createRadialGradient(cx, cy, 8, cx, cy, 96);
    outerGrd.addColorStop(0, 'rgba(255,255,255,0)');
    outerGrd.addColorStop(0.3, 'rgba(255,255,255,0)');
    outerGrd.addColorStop(0.6, 'rgba(33,150,243,0.3)');
    outerGrd.addColorStop(0.8, 'rgba(33,150,243,0.15)');
    outerGrd.addColorStop(1, 'rgba(33,150,243,0)');
    ctx.fillStyle = outerGrd;
    ctx.fillRect(0, 0, 192, 256);

    // Mid swirl ring - purple
    const midGrd = ctx.createRadialGradient(cx, cy, 4, cx, cy, 72);
    midGrd.addColorStop(0, 'rgba(255,255,255,0)');
    midGrd.addColorStop(0.3, 'rgba(255,255,255,0)');
    midGrd.addColorStop(0.5, 'rgba(156,39,176,0.3)');
    midGrd.addColorStop(0.7, 'rgba(156,39,176,0.15)');
    midGrd.addColorStop(1, 'rgba(156,39,176,0)');
    ctx.fillStyle = midGrd;
    ctx.fillRect(0, 0, 192, 256);

    // More spiral arms (8-10) with gradient strokes
    for (let s = 0; s < 10; s++) {
      const sa = (s / 10) * Math.PI * 2;
      const armGrd = ctx.createLinearGradient(
        cx + Math.cos(sa) * 12, cy + Math.sin(sa) * 12,
        cx + Math.cos(sa + 1) * 64, cy + Math.sin(sa + 1) * 64
      );
      armGrd.addColorStop(0, 'rgba(255,215,0,0.5)');
      armGrd.addColorStop(0.5, 'rgba(255,215,0,0.3)');
      armGrd.addColorStop(1, 'rgba(255,215,0,0)');
      ctx.strokeStyle = armGrd;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let r = 12; r < 64; r += 2) {
        const a = sa + r * 0.3;
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r * 1.3;
        if (r === 12) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Richer radial core glow
    const grd = ctx.createRadialGradient(cx, cy, 2, cx, cy, 48);
    grd.addColorStop(0, '#FFFFFF');
    grd.addColorStop(0.1, '#FFFDE7');
    grd.addColorStop(0.25, '#FFD700');
    grd.addColorStop(0.4, '#FF8F00');
    grd.addColorStop(0.55, 'rgba(255,143,0,0.5)');
    grd.addColorStop(0.7, 'rgba(255,143,0,0.2)');
    grd.addColorStop(1, 'rgba(255,143,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 192, 256);

    // Star-shaped sparkles
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const r = 16 + (i % 4) * 10;
      const sx = cx + Math.cos(angle) * r;
      const sy = cy + Math.sin(angle) * r;
      // 4-pointed star
      const sz = 3 + (i % 3);
      ctx.beginPath();
      ctx.moveTo(sx, sy - sz);
      ctx.lineTo(sx + sz * 0.3, sy);
      ctx.lineTo(sx, sy + sz);
      ctx.lineTo(sx - sz * 0.3, sy);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(sx - sz, sy);
      ctx.lineTo(sx, sy + sz * 0.3);
      ctx.lineTo(sx + sz, sy);
      ctx.lineTo(sx, sy - sz * 0.3);
      ctx.closePath();
      ctx.fill();
    }

    // Larger DEPLOY text with glow
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DEPLOY', cx, cy);
    // Double draw for extra glow
    ctx.fillText('DEPLOY', cx, cy);
    ctx.shadowBlur = 0;
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

  // Sky gradient - more stops for richer atmosphere + warm horizon glow
  const skyC = document.createElement('canvas');
  skyC.width = 2; skyC.height = 128;
  const sCtx = skyC.getContext('2d');
  const grd = sCtx.createLinearGradient(0, 0, 0, 128);
  grd.addColorStop(0, '#050D18');
  grd.addColorStop(0.15, '#0D1B2A');
  grd.addColorStop(0.3, '#1B2838');
  grd.addColorStop(0.45, '#2A4060');
  grd.addColorStop(0.6, '#4A90D9');
  grd.addColorStop(0.75, '#7BBDE8');
  grd.addColorStop(0.85, '#87CEEB');
  grd.addColorStop(0.93, hex(COLORS.skyHorizon));
  grd.addColorStop(1, '#F0C87A');
  sCtx.fillStyle = grd;
  sCtx.fillRect(0, 0, 2, 128);
  const skyTex = new THREE.CanvasTexture(skyC);
  const sky = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 50),
    new THREE.MeshBasicMaterial({ map: skyTex })
  );
  sky.position.set(140, 12, -5);
  scene.add(sky);
  layers.push({ mesh: sky, ix: 140, speed: 0.95 });

  // ── Twinkling stars (1024x256, arcs with glow halos) ────────
  const starsC = document.createElement('canvas');
  starsC.width = 1024;
  starsC.height = 256;
  const starCtx = starsC.getContext('2d');
  for (let i = 0; i < 180; i++) {
    const sx = Math.random() * 1024;
    const sy = Math.random() * 256;
    const brightness = 0.3 + Math.random() * 0.7;
    const size = 0.5 + Math.random() * 1.5;

    // Glow halo for bright stars
    if (brightness > 0.7) {
      const haloGrd = starCtx.createRadialGradient(sx, sy, 0, sx, sy, size * 4);
      haloGrd.addColorStop(0, `rgba(255,255,255,${brightness * 0.3})`);
      haloGrd.addColorStop(1, 'rgba(255,255,255,0)');
      starCtx.fillStyle = haloGrd;
      starCtx.fillRect(sx - size * 4, sy - size * 4, size * 8, size * 8);
    }

    // Star as small arc
    starCtx.fillStyle = `rgba(255,255,255,${brightness})`;
    starCtx.beginPath();
    starCtx.arc(sx, sy, size, 0, Math.PI * 2);
    starCtx.fill();

    // Some colored stars
    if (Math.random() < 0.12) {
      const colors = ['rgba(135,206,235,0.5)', 'rgba(255,215,0,0.4)', 'rgba(255,182,193,0.4)'];
      starCtx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      starCtx.beginPath();
      starCtx.arc(sx, sy, size * 1.5, 0, Math.PI * 2);
      starCtx.fill();
    }
  }
  const starsTex = new THREE.CanvasTexture(starsC);
  starsTex.magFilter = THREE.LinearFilter;
  starsTex.minFilter = THREE.LinearFilter;
  const stars = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 20),
    new THREE.MeshBasicMaterial({ map: starsTex, transparent: true })
  );
  stars.position.set(140, 24, -4.9);
  scene.add(stars);
  layers.push({ mesh: stars, ix: 140, speed: 0.92, type: 'stars' });

  // ── Circuit-board (larger canvas, more traces, gradient nodes) ──
  const circuitC = document.createElement('canvas');
  circuitC.width = 512;
  circuitC.height = 256;
  const cCtx = circuitC.getContext('2d');
  // Grid lines
  cCtx.strokeStyle = 'rgba(6,120,190,0.06)';
  cCtx.lineWidth = 1;
  for (let x = 0; x < 512; x += 16) {
    cCtx.beginPath();
    cCtx.moveTo(x, 0);
    cCtx.lineTo(x, 256);
    cCtx.stroke();
  }
  for (let y = 0; y < 256; y += 16) {
    cCtx.beginPath();
    cCtx.moveTo(0, y);
    cCtx.lineTo(512, y);
    cCtx.stroke();
  }
  // More circuit traces
  cCtx.strokeStyle = 'rgba(6,120,190,0.1)';
  cCtx.lineWidth = 1.5;
  cCtx.lineCap = 'round';
  for (let i = 0; i < 35; i++) {
    const sx = Math.floor(Math.random() * 32) * 16;
    const sy = Math.floor(Math.random() * 16) * 16;
    cCtx.beginPath();
    cCtx.moveTo(sx, sy);
    let cx2 = sx, cy2 = sy;
    for (let seg = 0; seg < 3 + Math.floor(Math.random() * 4); seg++) {
      if (Math.random() < 0.5) cx2 += (Math.random() < 0.5 ? 16 : -16);
      else cy2 += (Math.random() < 0.5 ? 16 : -16);
      cx2 = Math.max(0, Math.min(511, cx2));
      cy2 = Math.max(0, Math.min(255, cy2));
      cCtx.lineTo(cx2, cy2);
    }
    cCtx.stroke();
    // Gradient-filled nodes
    const nodeGrd = cCtx.createRadialGradient(cx2, cy2, 0, cx2, cy2, 3);
    nodeGrd.addColorStop(0, 'rgba(6,120,190,0.25)');
    nodeGrd.addColorStop(1, 'rgba(6,120,190,0.05)');
    cCtx.fillStyle = nodeGrd;
    cCtx.beginPath();
    cCtx.arc(cx2, cy2, 3, 0, Math.PI * 2);
    cCtx.fill();
  }
  const circuitTex = new THREE.CanvasTexture(circuitC);
  circuitTex.magFilter = THREE.LinearFilter;
  circuitTex.minFilter = THREE.LinearFilter;
  const circuit = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 30),
    new THREE.MeshBasicMaterial({ map: circuitTex, transparent: true })
  );
  circuit.position.set(140, 6, -4.85);
  scene.add(circuit);
  layers.push({ mesh: circuit, ix: 140, speed: 0.88 });

  // ── City skyline (1024x192 canvas, gradient buildings, glowing windows) ──
  const cityC = document.createElement('canvas');
  cityC.width = 1024;
  cityC.height = 192;
  const cityCtx = cityC.getContext('2d');
  const buildings = [];
  let bx = 0;
  while (bx < 1024) {
    const bw = 16 + Math.floor(Math.random() * 40);
    const bh = 30 + Math.floor(Math.random() * 110);
    buildings.push({ x: bx, w: bw, h: bh });
    bx += bw + Math.floor(Math.random() * 8);
  }
  for (const b of buildings) {
    // Gradient-shaded building
    const bGrd = cityCtx.createLinearGradient(b.x, 192 - b.h, b.x + b.w, 192);
    bGrd.addColorStop(0, 'rgba(15,25,40,0.55)');
    bGrd.addColorStop(0.5, 'rgba(20,35,55,0.5)');
    bGrd.addColorStop(1, 'rgba(10,18,30,0.6)');
    cityCtx.fillStyle = bGrd;
    cityCtx.fillRect(b.x, 192 - b.h, b.w, b.h);

    // Building outline
    cityCtx.strokeStyle = 'rgba(30,50,70,0.3)';
    cityCtx.lineWidth = 1;
    cityCtx.strokeRect(b.x, 192 - b.h, b.w, b.h);

    // Rooftop detail
    cityCtx.fillStyle = 'rgba(40,60,85,0.4)';
    cityCtx.fillRect(b.x, 192 - b.h, b.w, 3);

    // Glowing windows with shadowBlur
    if (b.w > 14 && b.h > 30) {
      for (let wy = 192 - b.h + 8; wy < 186; wy += 10) {
        for (let wx = b.x + 4; wx < b.x + b.w - 5; wx += 8) {
          if (Math.random() < 0.6) {
            const isWarm = Math.random() < 0.7;
            cityCtx.shadowColor = isWarm ? 'rgba(255,215,100,0.6)' : 'rgba(100,180,255,0.6)';
            cityCtx.shadowBlur = 4;
            cityCtx.fillStyle = isWarm ? 'rgba(255,215,100,0.5)' : 'rgba(100,180,255,0.4)';
            cityCtx.fillRect(wx, wy, 3, 3);
          }
        }
      }
      cityCtx.shadowBlur = 0;
    }

    // Occasional antenna with blinking light
    if (b.h > 70 && Math.random() < 0.3) {
      cityCtx.strokeStyle = 'rgba(15,25,40,0.5)';
      cityCtx.lineWidth = 1;
      cityCtx.beginPath();
      cityCtx.moveTo(b.x + b.w / 2, 192 - b.h);
      cityCtx.lineTo(b.x + b.w / 2, 192 - b.h - 14);
      cityCtx.stroke();
      cityCtx.shadowColor = 'rgba(255,0,0,0.8)';
      cityCtx.shadowBlur = 6;
      cityCtx.fillStyle = 'rgba(255,0,0,0.6)';
      cityCtx.beginPath();
      cityCtx.arc(b.x + b.w / 2, 192 - b.h - 15, 2, 0, Math.PI * 2);
      cityCtx.fill();
      cityCtx.shadowBlur = 0;
    }
  }
  // Fog overlay at bottom
  const fogGrd = cityCtx.createLinearGradient(0, 160, 0, 192);
  fogGrd.addColorStop(0, 'rgba(200,214,229,0)');
  fogGrd.addColorStop(1, 'rgba(200,214,229,0.15)');
  cityCtx.fillStyle = fogGrd;
  cityCtx.fillRect(0, 160, 1024, 32);

  const cityTex = new THREE.CanvasTexture(cityC);
  cityTex.magFilter = THREE.LinearFilter;
  cityTex.minFilter = THREE.LinearFilter;
  const city = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 14),
    new THREE.MeshBasicMaterial({ map: cityTex, transparent: true })
  );
  city.position.set(140, 4, -4.5);
  scene.add(city);
  layers.push({ mesh: city, ix: 140, speed: 0.75 });

  // Mountains - multi-layer with gradient fills, snow caps, tree textures
  const mtC = document.createElement('canvas');
  mtC.width = 512; mtC.height = 128;
  const mCtx = mtC.getContext('2d');

  // Distant pale blue range behind
  mCtx.fillStyle = 'rgba(100,140,180,0.3)';
  for (let i = 0; i < 25; i++) {
    const cx2 = i * 22;
    const h = 20 + Math.sin(i * 1.3) * 12 + Math.random() * 10;
    mCtx.beginPath();
    mCtx.moveTo(cx2 - 20, 128);
    mCtx.lineTo(cx2, 128 - h);
    mCtx.lineTo(cx2 + 20, 128);
    mCtx.fill();
  }

  // Main mountain range with gradient fills
  for (let i = 0; i < 22; i++) {
    const cx2 = i * 25;
    const h = 35 + Math.sin(i * 1.7) * 25 + Math.random() * 20;
    const mtGrd = mCtx.createLinearGradient(cx2, 128 - h, cx2, 128);
    mtGrd.addColorStop(0, '#6B9B6B');
    mtGrd.addColorStop(0.3, '#5C8A5C');
    mtGrd.addColorStop(1, '#4A7A4A');
    mCtx.fillStyle = mtGrd;
    mCtx.beginPath();
    mCtx.moveTo(cx2 - 18, 128);
    mCtx.lineTo(cx2, 128 - h);
    mCtx.lineTo(cx2 + 18, 128);
    mCtx.fill();

    // Snow caps on tall mountains
    if (h > 50) {
      mCtx.fillStyle = 'rgba(255,255,255,0.6)';
      mCtx.beginPath();
      mCtx.moveTo(cx2 - 5, 128 - h + 8);
      mCtx.lineTo(cx2, 128 - h);
      mCtx.lineTo(cx2 + 5, 128 - h + 8);
      mCtx.quadraticCurveTo(cx2, 128 - h + 6, cx2 - 5, 128 - h + 8);
      mCtx.fill();
    }

    // Tree textures (small triangles at base)
    mCtx.fillStyle = '#3D6B3D';
    for (let tx = cx2 - 14; tx < cx2 + 14; tx += 4) {
      const ty = 128 - (h * 0.3) + Math.random() * (h * 0.2);
      if (ty < 126) {
        mCtx.beginPath();
        mCtx.moveTo(tx, ty + 4);
        mCtx.lineTo(tx + 2, ty);
        mCtx.lineTo(tx + 4, ty + 4);
        mCtx.fill();
      }
    }
  }

  // Foreground hills
  for (let i = 0; i < 22; i++) {
    const cx2 = i * 25 + 12;
    const h = 20 + Math.sin(i * 2.3) * 15 + Math.random() * 15;
    const fgGrd = mCtx.createLinearGradient(cx2, 128 - h, cx2, 128);
    fgGrd.addColorStop(0, '#5A8A5A');
    fgGrd.addColorStop(1, '#4A7A4A');
    mCtx.fillStyle = fgGrd;
    mCtx.beginPath();
    mCtx.moveTo(cx2 - 14, 128);
    mCtx.lineTo(cx2, 128 - h);
    mCtx.lineTo(cx2 + 14, 128);
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

  // ── Animated cloud puffs (128x48 canvas, more puffs, gradient fills) ──
  for (let i = 0; i < 25; i++) {
    const cw = 2.5 + Math.random() * 4;
    const ch = 0.8 + Math.random() * 0.8;
    const cloudTex = tex(128, 48, (ctx) => {
      // More puffs with gradient fills
      const puffs = [
        { x: 64, y: 28, rx: 56, ry: 18 },
        { x: 36, y: 20, rx: 32, ry: 16 },
        { x: 92, y: 20, rx: 32, ry: 16 },
        { x: 52, y: 14, rx: 20, ry: 12 },
        { x: 76, y: 14, rx: 20, ry: 12 },
      ];
      for (const p of puffs) {
        const pGrd = ctx.createRadialGradient(p.x, p.y - 2, 0, p.x, p.y, Math.max(p.rx, p.ry));
        pGrd.addColorStop(0, 'rgba(255,255,255,0.95)');
        pGrd.addColorStop(0.6, 'rgba(255,255,255,0.8)');
        pGrd.addColorStop(1, 'rgba(255,255,255,0.1)');
        ctx.fillStyle = pGrd;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // Subtle blue shadow underneath
      ctx.fillStyle = 'rgba(150,170,210,0.2)';
      ctx.beginPath();
      ctx.ellipse(64, 38, 48, 10, 0, 0, Math.PI * 2);
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
