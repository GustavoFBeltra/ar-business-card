import * as THREE from 'three';

/**
 * AR-tuned lighting rig.
 * Soft ambient + directional key light + subtle rim light.
 * Designed to look good composited over a camera feed.
 */
export class LightingRig {
  constructor(scene) {
    this.lights = [];

    // Ambient - provides base illumination
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    this.lights.push(ambient);

    // Key light - slightly warm, above-right
    const key = new THREE.DirectionalLight(0xfff5e6, 0.8);
    key.position.set(0.5, 1.0, 0.8);
    scene.add(key);
    this.lights.push(key);

    // Fill light - cool, left side
    const fill = new THREE.DirectionalLight(0xd4e5ff, 0.3);
    fill.position.set(-0.5, 0.3, 0.5);
    scene.add(fill);
    this.lights.push(fill);

    // Rim light - for edge definition
    const rim = new THREE.DirectionalLight(0x00d2ff, 0.15);
    rim.position.set(0, -0.5, -1);
    scene.add(rim);
    this.lights.push(rim);
  }

  dispose() {
    this.lights.forEach((light) => light.removeFromParent());
    this.lights = [];
  }
}
