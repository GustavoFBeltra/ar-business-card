import * as THREE from 'three';

/**
 * 3D tap detection on menu items using Three.js raycasting.
 */
export class Raycaster {
  constructor(camera) {
    this.raycaster = new THREE.Raycaster();
    this.camera = camera;
    this.mouse = new THREE.Vector2();
  }

  /**
   * Cast a ray from NDC coordinates and return intersected menu items.
   * @param {number} ndcX - Normalized device X (-1 to 1)
   * @param {number} ndcY - Normalized device Y (-1 to 1)
   * @param {THREE.Object3D[]} hitboxes - Array of hitbox meshes
   * @returns {object|null} - { id, action, point } or null
   */
  cast(ndcX, ndcY, hitboxes) {
    this.mouse.set(ndcX, ndcY);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(hitboxes, false);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const userData = hit.object.userData;
      if (userData.menuItem) {
        return {
          id: userData.id,
          action: userData.action,
          point: hit.point,
        };
      }
      if (userData.portfolioCard) {
        return {
          portfolioCard: true,
          url: userData.url,
          index: userData.index,
          point: hit.point,
        };
      }
    }

    return null;
  }

  /**
   * Update the camera reference (useful if camera changes).
   */
  setCamera(camera) {
    this.camera = camera;
  }
}
