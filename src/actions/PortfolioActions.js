import * as THREE from 'three';
import { PORTFOLIO, COLORS } from '../utils/Constants.js';

/**
 * 3D portfolio carousel - fan of project thumbnails.
 * Displayed when "Portfolio" menu item is tapped.
 */
export class PortfolioActions {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'portfolio-carousel';
    this.group.visible = false;
    this.isOpen = false;
    this.cards = [];
  }

  /**
   * Build portfolio cards.
   */
  build() {
    PORTFOLIO.forEach((project, i) => {
      const card = this._createProjectCard(project, i);
      this.cards.push(card);
      this.group.add(card);
    });
    return this.group;
  }

  _createProjectCard(project, index) {
    const group = new THREE.Group();

    // Card background
    const geo = new THREE.PlaneGeometry(0.2, 0.13);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 166;
    const ctx = canvas.getContext('2d');

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 256, 166);
    gradient.addColorStop(0, '#16161e');
    gradient.addColorStop(1, '#1a1a28');
    ctx.fillStyle = gradient;
    ctx.roundRect(0, 0, 256, 166, 12);
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(0, 210, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.roundRect(1, 1, 254, 164, 12);
    ctx.stroke();

    // Project title
    ctx.font = "600 18px -apple-system, 'Segoe UI', sans-serif";
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(project.title, 128, project.subtitle ? 75 : 85);

    // Subtitle
    if (project.subtitle) {
      ctx.font = "400 12px -apple-system, sans-serif";
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillText(project.subtitle, 128, 98);
    }

    // "View" label
    ctx.font = "400 12px -apple-system, sans-serif";
    ctx.fillStyle = '#00d2ff';
    ctx.fillText('Tap to view →', 128, 125);

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;

    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData = {
      portfolioCard: true,
      url: project.url,
      index,
    };
    group.add(mesh);

    // Fan layout: spread in an arc (narrower spacing for more items)
    const spacing = PORTFOLIO.length > 4 ? 0.18 : 0.25;
    const angle = (index - (PORTFOLIO.length - 1) / 2) * spacing;
    group.position.set(
      Math.sin(angle) * 0.3,
      0.25,
      0.05 + Math.cos(angle) * 0.05
    );
    group.rotation.y = -angle * 0.5;

    return group;
  }

  /**
   * Toggle portfolio visibility.
   */
  toggle() {
    this.isOpen = !this.isOpen;
    this.group.visible = this.isOpen;
    return this.isOpen;
  }

  /**
   * Open a portfolio project by index.
   */
  openProject(index) {
    const project = PORTFOLIO[index];
    if (project?.url) {
      window.open(project.url, '_blank', 'noopener');
    }
  }

  /**
   * Get all card meshes for raycasting.
   */
  getHitTargets() {
    return this.cards.flatMap((group) =>
      group.children.filter((c) => c.userData.portfolioCard)
    );
  }

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
