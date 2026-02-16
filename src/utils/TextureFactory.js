import * as THREE from 'three';
import { COLORS, CSS_COLORS, CONTACT } from './Constants.js';

const textureCache = new Map();

/**
 * Creates a canvas-based text texture for menu labels.
 */
export function createTextTexture(text, options = {}) {
  const key = `text_${text}_${JSON.stringify(options)}`;
  if (textureCache.has(key)) return textureCache.get(key);

  const {
    fontSize = 28,
    fontFamily = "-apple-system, 'Segoe UI', Roboto, sans-serif",
    color = '#ffffff',
    bgColor = 'transparent',
    width = 256,
    height = 64,
    align = 'left',
    paddingX = 16,
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Background
  if (bgColor !== 'transparent') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
  }

  // Text
  ctx.font = `500 ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = align;

  const x = align === 'center' ? width / 2 : paddingX;
  ctx.fillText(text, x, height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  textureCache.set(key, texture);
  return texture;
}

/**
 * Creates an icon texture (emoji or symbol on canvas).
 */
export function createIconTexture(icon, options = {}) {
  const key = `icon_${icon}_${JSON.stringify(options)}`;
  if (textureCache.has(key)) return textureCache.get(key);

  const {
    size = 64,
    fontSize = 36,
    color = CSS_COLORS.primary,
    bgColor = 'transparent',
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (bgColor !== 'transparent') {
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.font = `${fontSize}px -apple-system, 'Segoe UI', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(icon, size / 2, size / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  textureCache.set(key, texture);
  return texture;
}

/**
 * Creates a procedural gradient texture for the card face.
 */
export function createCardFaceTexture(side = 'front', options = {}) {
  const key = `card_${side}_${JSON.stringify(options)}`;
  if (textureCache.has(key)) return textureCache.get(key);

  const width = 512;
  const height = 292; // ~1.75:1 aspect
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (side === 'front') {
    // Dark gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#111116');
    gradient.addColorStop(1, '#0d0d14');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(0, 210, 255, 0.03)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < width; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Corner accents
    ctx.strokeStyle = 'rgba(0, 210, 255, 0.15)';
    ctx.lineWidth = 1;
    const cornerLen = 30;
    ctx.beginPath();
    ctx.moveTo(8, 8 + cornerLen);
    ctx.lineTo(8, 8);
    ctx.lineTo(8 + cornerLen, 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width - 8 - cornerLen, height - 8);
    ctx.lineTo(width - 8, height - 8);
    ctx.lineTo(width - 8, height - 8 - cornerLen);
    ctx.stroke();

    // Name
    ctx.font = "600 28px -apple-system, 'Segoe UI', sans-serif";
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(CONTACT.name, 24, height - 70);

    // Title + Company
    ctx.font = "400 14px -apple-system, 'Segoe UI', sans-serif";
    ctx.fillStyle = 'rgba(0, 210, 255, 0.7)';
    ctx.fillText(`${CONTACT.title}  ·  ${CONTACT.company}`, 24, height - 42);

    // Thin accent line
    ctx.strokeStyle = 'rgba(0, 210, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(24, height - 30);
    ctx.lineTo(200, height - 30);
    ctx.stroke();

  } else {
    // Back face
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0d0d12');
    gradient.addColorStop(1, '#08080d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Company name
    ctx.font = "600 20px -apple-system, 'Segoe UI', sans-serif";
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.textAlign = 'center';
    ctx.fillText(CONTACT.company.toUpperCase(), width / 2, height / 2 - 30);

    // Work contact
    ctx.font = "400 12px -apple-system, sans-serif";
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillText(CONTACT.emailWork, width / 2, height / 2 + 5);
    ctx.fillText(CONTACT.website.replace('https://', ''), width / 2, height / 2 + 25);

    // QR hint
    ctx.font = "500 11px -apple-system, sans-serif";
    ctx.fillStyle = 'rgba(0, 210, 255, 0.4)';
    ctx.fillText('SCAN QR FOR AR EXPERIENCE', width / 2, height - 20);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  textureCache.set(key, texture);
  return texture;
}

/**
 * Creates a pill-shaped background texture for menu items.
 */
export function createPillTexture(options = {}) {
  const {
    width = 256,
    height = 64,
    bgColor = 'rgba(22, 22, 30, 0.9)',
    borderColor = 'rgba(0, 210, 255, 0.3)',
    borderWidth = 1.5,
    radius = 32,
  } = options;

  const key = `pill_${bgColor}_${borderColor}`;
  if (textureCache.has(key)) return textureCache.get(key);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Pill shape
  ctx.beginPath();
  ctx.roundRect(borderWidth, borderWidth, width - borderWidth * 2, height - borderWidth * 2, radius);
  ctx.fillStyle = bgColor;
  ctx.fill();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;

  textureCache.set(key, texture);
  return texture;
}

/**
 * Dispose all cached textures.
 */
export function disposeTextures() {
  textureCache.forEach((tex) => tex.dispose());
  textureCache.clear();
}
