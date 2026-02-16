import * as THREE from 'three';
import { PARTICLES, COLORS } from '../utils/Constants.js';

/**
 * Ambient glow particles that orbit the card.
 * Particles can burst toward a target position (e.g., selected menu item).
 */
export class ParticleSystem {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'particles';

    this.count = PARTICLES.count;
    this.particles = [];
    this.burstTargets = null;

    this._build();
  }

  _build() {
    const positions = new Float32Array(this.count * 3);
    const alphas = new Float32Array(this.count);
    const sizes = new Float32Array(this.count);

    for (let i = 0; i < this.count; i++) {
      // Distribute on a shell around the card
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      const r = PARTICLES.radius * (0.6 + Math.random() * 0.4);

      positions[i * 3] = r * Math.cos(theta) * Math.cos(phi);
      positions[i * 3 + 1] = r * Math.sin(phi) * 0.5; // Flatten Y
      positions[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi) * 0.3;

      alphas[i] = Math.random() * PARTICLES.opacity;
      sizes[i] = PARTICLES.size * (0.5 + Math.random());

      this.particles.push({
        theta,
        phi,
        radius: r,
        speed: PARTICLES.speed * (0.5 + Math.random()),
        baseAlpha: alphas[i],
      });
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(COLORS.particle) },
        time: { value: 0 },
      },
      vertexShader: `
        attribute float alpha;
        attribute float size;
        varying float vAlpha;
        void main() {
          vAlpha = alpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vAlpha;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float glow = 1.0 - smoothstep(0.0, 0.5, dist);
          gl_FragColor = vec4(color, vAlpha * glow);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geometry, material);
    this.group.add(this.points);
  }

  /**
   * Update particle positions each frame.
   * @param {number} time - elapsed time in seconds
   */
  update(time) {
    if (!this.points) return;

    const positions = this.points.geometry.attributes.position.array;
    const alphas = this.points.geometry.attributes.alpha.array;

    for (let i = 0; i < this.count; i++) {
      const p = this.particles[i];
      p.theta += p.speed * 0.01;

      const r = p.radius;
      positions[i * 3] = r * Math.cos(p.theta) * Math.cos(p.phi);
      positions[i * 3 + 1] = r * Math.sin(p.phi) * 0.5;
      positions[i * 3 + 2] = r * Math.sin(p.theta) * Math.cos(p.phi) * 0.3;

      // Twinkle
      alphas[i] = p.baseAlpha * (0.5 + 0.5 * Math.sin(time * 2 + i * 1.7));
    }

    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.geometry.attributes.alpha.needsUpdate = true;
    this.points.material.uniforms.time.value = time;
  }

  /**
   * Trigger a particle burst toward a world position.
   */
  burstToward(targetPos) {
    // Animate a subset of particles toward the target
    const positions = this.points.geometry.attributes.position.array;
    const burstCount = Math.min(10, this.count);
    for (let i = 0; i < burstCount; i++) {
      const idx = Math.floor(Math.random() * this.count);
      // Temporarily redirect particle
      this.particles[idx].radius *= 0.3;
      setTimeout(() => {
        this.particles[idx].radius = PARTICLES.radius * (0.6 + Math.random() * 0.4);
      }, 800);
    }
  }

  getObject() {
    return this.group;
  }

  dispose() {
    if (this.points) {
      this.points.geometry.dispose();
      this.points.material.dispose();
    }
  }
}
