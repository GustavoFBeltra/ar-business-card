import * as THREE from 'three';
import { CARD, COLORS } from '../utils/Constants.js';
import { createCardFaceTexture } from '../utils/TextureFactory.js';

/**
 * Procedural 3D business card: front plane, back plane, edge box.
 * Returns a group that can be flipped, animated, and textured dynamically.
 */
export class CardModel {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'card';

    this._buildFront();
    this._buildBack();
    this._buildEdge();
    this._buildGlowEdge();
  }

  _buildFront() {
    const geo = new THREE.PlaneGeometry(CARD.width, CARD.height);
    const mat = new THREE.MeshStandardMaterial({
      map: createCardFaceTexture('front'),
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
    });
    this.front = new THREE.Mesh(geo, mat);
    this.front.position.z = CARD.depth / 2 + 0.001;
    this.front.name = 'card-front';
    this.group.add(this.front);
  }

  _buildBack() {
    const geo = new THREE.PlaneGeometry(CARD.width, CARD.height);
    const mat = new THREE.MeshStandardMaterial({
      map: createCardFaceTexture('back'),
      roughness: 0.4,
      metalness: 0.05,
      transparent: true,
    });
    this.back = new THREE.Mesh(geo, mat);
    this.back.rotation.y = Math.PI; // Face backward
    this.back.position.z = -(CARD.depth / 2 + 0.001);
    this.back.name = 'card-back';
    this.group.add(this.back);
  }

  _buildEdge() {
    const geo = new THREE.BoxGeometry(CARD.width, CARD.height, CARD.depth);
    const mat = new THREE.MeshStandardMaterial({
      color: COLORS.cardEdge,
      roughness: 0.5,
      metalness: 0.2,
    });
    this.edge = new THREE.Mesh(geo, mat);
    this.edge.name = 'card-edge';
    this.group.add(this.edge);
  }

  _buildGlowEdge() {
    // Neon glow border using a slightly larger wireframe
    const shape = new THREE.Shape();
    const w = CARD.width / 2;
    const h = CARD.height / 2;
    const r = CARD.cornerRadius;

    shape.moveTo(-w + r, -h);
    shape.lineTo(w - r, -h);
    shape.quadraticCurveTo(w, -h, w, -h + r);
    shape.lineTo(w, h - r);
    shape.quadraticCurveTo(w, h, w - r, h);
    shape.lineTo(-w + r, h);
    shape.quadraticCurveTo(-w, h, -w, h - r);
    shape.lineTo(-w, -h + r);
    shape.quadraticCurveTo(-w, -h, -w + r, -h);

    const points = shape.getPoints(48);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(
      points.map((p) => new THREE.Vector3(p.x, p.y, CARD.depth / 2 + 0.002))
    );

    this.glowLine = new THREE.Line(
      lineGeo,
      new THREE.LineBasicMaterial({
        color: COLORS.glow,
        transparent: true,
        opacity: 0,
        linewidth: 1,
      })
    );
    this.glowLine.name = 'card-glow';
    this.group.add(this.glowLine);

    // Also create a shader-based scan line
    this.scanProgress = { value: 0 };
  }

  /**
   * Animate the holographic edge glow.
   * @param {number} opacity 0..1
   */
  setGlowOpacity(opacity) {
    if (this.glowLine) {
      this.glowLine.material.opacity = opacity;
    }
  }

  /**
   * Get the Three.js group to add to scene graph.
   */
  getObject() {
    return this.group;
  }

  dispose() {
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    });
  }
}
