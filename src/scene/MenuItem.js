import * as THREE from 'three';
import { MENU, COLORS } from '../utils/Constants.js';
import { createTextTexture, createIconTexture } from '../utils/TextureFactory.js';

/**
 * Individual 3D menu item: pill background + icon sprite + text label + invisible hitbox.
 */
export class MenuItem {
  constructor(config) {
    this.config = config;
    this.group = new THREE.Group();
    this.group.name = `menu-item-${config.id}`;
    this.group.userData = { menuItem: true, id: config.id, action: config.action };

    this.isHovered = false;
    this.displayedText = '';
    this.typingComplete = false;

    this._buildPill();
    this._buildIcon();
    this._buildLabel();
    this._buildHitbox();
    this._buildConnectionLine();

    // Start hidden for entrance animation
    this.group.scale.setScalar(0);
    this.group.visible = false;
  }

  _buildPill() {
    // Pill-shaped background using a rounded box
    const shape = new THREE.Shape();
    const w = MENU.itemWidth / 2;
    const h = MENU.itemHeight / 2;
    const r = h; // Full round ends

    shape.moveTo(-w + r, -h);
    shape.lineTo(w - r, -h);
    shape.absarc(w - r, 0, h, -Math.PI / 2, Math.PI / 2, false);
    shape.lineTo(-w + r, h);
    shape.absarc(-w + r, 0, h, Math.PI / 2, Math.PI * 1.5, false);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: MENU.itemDepth,
      bevelEnabled: false,
    });

    this.pillMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.menuBg,
      roughness: 0.6,
      metalness: 0.1,
      transparent: true,
      opacity: 0.92,
    });

    this.pill = new THREE.Mesh(geo, this.pillMaterial);
    this.pill.position.z = -MENU.itemDepth / 2;
    this.group.add(this.pill);

    // Glow border (close the loop)
    const borderPoints = shape.getPoints(32);
    borderPoints.push(borderPoints[0]);
    const borderGeo = new THREE.BufferGeometry().setFromPoints(
      borderPoints.map((p) => new THREE.Vector3(p.x, p.y, 0.001))
    );
    this.borderLine = new THREE.Line(
      borderGeo,
      new THREE.LineBasicMaterial({
        color: COLORS.menuBorder,
        transparent: true,
        opacity: 0.4,
      })
    );
    this.group.add(this.borderLine);
  }

  _buildIcon() {
    const tex = createIconTexture(this.config.icon, { size: 64, fontSize: 32 });
    const geo = new THREE.PlaneGeometry(0.04, 0.04);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
    });
    this.icon = new THREE.Mesh(geo, mat);
    this.icon.position.set(-MENU.itemWidth / 2 + 0.04, 0, 0.002);
    this.group.add(this.icon);
  }

  _buildLabel() {
    this.labelCanvas = document.createElement('canvas');
    this.labelCanvas.width = 192;
    this.labelCanvas.height = 48;
    this.labelCtx = this.labelCanvas.getContext('2d');

    this.labelTexture = new THREE.CanvasTexture(this.labelCanvas);
    this.labelTexture.minFilter = THREE.LinearFilter;

    const geo = new THREE.PlaneGeometry(0.16, 0.04);
    const mat = new THREE.MeshBasicMaterial({
      map: this.labelTexture,
      transparent: true,
      depthWrite: false,
    });
    this.label = new THREE.Mesh(geo, mat);
    this.label.position.set(0.02, 0, 0.002);
    this.group.add(this.label);

    // Set full text immediately (typing animation controlled by MenuAnimations)
    this._renderLabelText(this.config.label);
  }

  _renderLabelText(text) {
    const ctx = this.labelCtx;
    ctx.clearRect(0, 0, 192, 48);
    ctx.font = "500 22px -apple-system, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 4, 24);
    this.labelTexture.needsUpdate = true;
    this.displayedText = text;
  }

  /**
   * Update label for typing animation - show only first N chars.
   */
  setTypingProgress(charCount) {
    const text = this.config.label.substring(0, charCount);
    if (text !== this.displayedText) {
      this._renderLabelText(text + (charCount < this.config.label.length ? '▌' : ''));
    }
    this.typingComplete = charCount >= this.config.label.length;
  }

  _buildHitbox() {
    // Invisible hitbox slightly larger than pill for easier tapping
    const geo = new THREE.PlaneGeometry(MENU.itemWidth + 0.02, MENU.itemHeight + 0.02);
    const mat = new THREE.MeshBasicMaterial({
      visible: false,
    });
    this.hitbox = new THREE.Mesh(geo, mat);
    this.hitbox.position.z = 0.003;
    this.hitbox.userData = { menuItem: true, id: this.config.id, action: this.config.action };
    this.group.add(this.hitbox);
  }

  _buildConnectionLine() {
    // Animated circuit-trace line from card edge to this menu item
    const points = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
    ];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    this.connectionLine = new THREE.Line(
      geo,
      new THREE.LineBasicMaterial({
        color: COLORS.glow,
        transparent: true,
        opacity: 0,
      })
    );
    this.connectionLine.frustumCulled = false;
    // Will be positioned by MenuSystem after layout
  }

  /**
   * Set hover visual state.
   */
  setHover(hovering) {
    if (this.isHovered === hovering) return;
    this.isHovered = hovering;

    this.pillMaterial.color.setHex(hovering ? COLORS.menuBgHover : COLORS.menuBg);
    this.borderLine.material.opacity = hovering ? 0.8 : 0.4;
  }

  /**
   * Update the connection line endpoints.
   */
  setConnectionPoints(start, end) {
    const positions = this.connectionLine.geometry.attributes.position.array;
    positions[0] = start.x;
    positions[1] = start.y;
    positions[2] = start.z;
    positions[3] = end.x;
    positions[4] = end.y;
    positions[5] = end.z;
    this.connectionLine.geometry.attributes.position.needsUpdate = true;
  }

  getObject() {
    return this.group;
  }

  getConnectionLine() {
    return this.connectionLine;
  }

  getHitbox() {
    return this.hitbox;
  }

  dispose() {
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    });
    if (this.connectionLine) {
      this.connectionLine.geometry.dispose();
      this.connectionLine.material.dispose();
    }
  }
}
