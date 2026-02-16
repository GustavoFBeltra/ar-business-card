import * as THREE from 'three';
import { MENU, MENU_ITEMS, CARD } from '../utils/Constants.js';
import { MenuItem } from './MenuItem.js';

/**
 * Arc menu layout positioned to the LEFT of the card.
 * All menu items are children of this group, which is a child of the card pivot.
 * MindAR anchor updates propagate automatically through the scene graph.
 */
export class MenuSystem {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'menu-system';
    this.items = [];
    this.connectionLinesGroup = new THREE.Group();
    this.connectionLinesGroup.name = 'connection-lines';

    this._build();
  }

  _build() {
    const count = MENU_ITEMS.length;
    const angleRange = MENU.arcEndAngle - MENU.arcStartAngle;
    const angleStep = count > 1 ? angleRange / (count - 1) : 0;

    MENU_ITEMS.forEach((config, i) => {
      const item = new MenuItem(config);

      // Position along arc to the left of the card
      const angle = MENU.arcStartAngle + angleStep * i;
      const x = MENU.offsetX + MENU.arcRadius * Math.cos(angle);
      const y = MENU.offsetY + MENU.arcRadius * Math.sin(angle);
      const z = 0.01; // Slightly in front of card

      item.getObject().position.set(x, y, z);

      // Slight rotation to face outward from arc center
      item.getObject().rotation.z = angle - Math.PI / 2;

      this.items.push(item);
      this.group.add(item.getObject());

      // Connection line from card edge to item
      const cardEdgeX = -CARD.width / 2;
      const cardEdgeY = THREE.MathUtils.clamp(y, -CARD.height / 2, CARD.height / 2);
      item.setConnectionPoints(
        new THREE.Vector3(cardEdgeX, cardEdgeY, z),
        new THREE.Vector3(x + MENU.itemWidth / 2 + 0.01, y, z)
      );
      this.connectionLinesGroup.add(item.getConnectionLine());
    });

    this.group.add(this.connectionLinesGroup);
  }

  /**
   * Get all hitbox meshes for raycasting.
   */
  getHitboxes() {
    return this.items.map((item) => item.getHitbox());
  }

  /**
   * Get a menu item by ID.
   */
  getItem(id) {
    return this.items.find((item) => item.config.id === id);
  }

  /**
   * Get all menu items.
   */
  getItems() {
    return this.items;
  }

  /**
   * Set hover state on a specific item (and clear others).
   */
  setHovered(id) {
    this.items.forEach((item) => {
      item.setHover(item.config.id === id);
    });
  }

  /**
   * Clear all hover states.
   */
  clearHover() {
    this.items.forEach((item) => item.setHover(false));
  }

  /**
   * Show/hide connection lines.
   */
  setConnectionLinesVisible(visible, opacity = 0.25) {
    this.connectionLinesGroup.traverse((child) => {
      if (child.isLine) {
        child.material.opacity = visible ? opacity : 0;
      }
    });
  }

  getObject() {
    return this.group;
  }

  dispose() {
    this.items.forEach((item) => item.dispose());
    this.connectionLinesGroup.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  }
}
