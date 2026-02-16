import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { AR, COLORS } from '../utils/Constants.js';

/**
 * Loads the GLB logo model and adds a holographic shader effect.
 * Falls back to a procedural placeholder if the GLB is missing.
 */
export class LogoModel {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'logo';
    this.mesh = null;
    this.loaded = false;
  }

  /**
   * Attempt to load GLB, fallback to procedural logo.
   */
  async load() {
    try {
      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync(AR.modelFile);
      const model = gltf.scene;

      // Normalize scale and center
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 0.15 / maxDim;

      // Center before scaling so offset is in original coordinates
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      model.scale.setScalar(scale);

      // Apply holographic material to all meshes
      model.traverse((child) => {
        if (child.isMesh) {
          child.material = this._createHolographicMaterial();
          this.mesh = child;
        }
      });

      this.group.add(model);
      this.loaded = true;
    } catch {
      // Fallback: procedural diamond/octahedron logo
      this._createFallbackLogo();
      this.loaded = true;
    }

    // Position above card center
    this.group.position.set(0, 0.06, 0.05);
    return this.group;
  }

  _createFallbackLogo() {
    const geo = new THREE.OctahedronGeometry(0.06, 1);
    const mat = this._createHolographicMaterial();
    this.mesh = new THREE.Mesh(geo, mat);
    this.group.add(this.mesh);
  }

  _createHolographicMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        baseColor: { value: new THREE.Color(COLORS.primary) },
        fresnelColor: { value: new THREE.Color(COLORS.secondary) },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying vec2 vUv;
        varying vec3 vWorldPos;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          vViewDir = normalize(cameraPosition - worldPos.xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 baseColor;
        uniform vec3 fresnelColor;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying vec2 vUv;
        varying vec3 vWorldPos;

        void main() {
          // Fresnel iridescence
          float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);

          // Scanline effect
          float scanline = sin(vWorldPos.y * 80.0 + time * 3.0) * 0.5 + 0.5;
          scanline = smoothstep(0.3, 0.7, scanline) * 0.15;

          // Combine
          vec3 color = mix(baseColor, fresnelColor, fresnel * 0.7);
          color += scanline;
          color += fresnel * fresnelColor * 0.3;

          float alpha = 0.85 + fresnel * 0.15;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }

  /**
   * Update shader uniforms each frame.
   */
  update(time) {
    this.group.traverse((child) => {
      if (child.isMesh && child.material.uniforms?.time) {
        child.material.uniforms.time.value = time;
      }
    });
  }

  getObject() {
    return this.group;
  }

  dispose() {
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  }
}
