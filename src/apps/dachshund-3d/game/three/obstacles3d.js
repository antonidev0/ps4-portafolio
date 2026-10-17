import * as THREE from 'three';
import { cellToWorld } from './board';

const MAX_OBSTACLES = 96;

function geometryFor(style) {
  if (style === 'garden') {
    // Cristal hexagonal (seto de cristal)
    const g = new THREE.CylinderGeometry(0.36, 0.42, 0.85, 6);
    g.translate(0, 0.425, 0);
    return g;
  }
  if (style === 'core') {
    // Bloque de energía con bordes biselados
    const g = new THREE.CylinderGeometry(0.4, 0.44, 1.0, 4, 1);
    g.rotateY(Math.PI / 4);
    g.translate(0, 0.5, 0);
    return g;
  }
  // Arbusto redondeado de neón
  const g = new THREE.SphereGeometry(0.42, 18, 12);
  g.scale(1, 0.85, 1);
  g.translate(0, 0.36, 0);
  return g;
}

/** Obstáculos del tablero dibujados con una sola InstancedMesh. */
export class ObstacleField {
  constructor(parent) {
    this.parent = parent;
    this.cells = [];
    this.mesh = null;
    this.capGeo = new THREE.CircleGeometry(0.5, 24);
    this.capGeo.rotateX(-Math.PI / 2);
    this.capMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false });
    this.caps = new THREE.InstancedMesh(this.capGeo, this.capMat, MAX_OBSTACLES);
    this.caps.count = 0;
    this.caps.frustumCulled = false;
    parent.add(this.caps);
    this._m = new THREE.Matrix4();
    this._q = new THREE.Quaternion();
    this._p = new THREE.Vector3();
    this._s = new THREE.Vector3();
  }

  setStyle(theme) {
    if (this.style === theme.decor && this.mesh) {
      this.material.color.set(theme.obstacle);
      this.material.emissive.set(theme.obstacleEmissive);
      this.capMat.color.set(theme.obstacleEmissive);
      return;
    }
    this.disposeMesh();
    this.style = theme.decor;
    this.geometry = geometryFor(theme.decor);
    this.material = new THREE.MeshStandardMaterial({
      color: theme.obstacle,
      emissive: theme.obstacleEmissive,
      emissiveIntensity: 0.55,
      roughness: 0.35,
      metalness: 0.4,
      flatShading: theme.decor !== 'park',
    });
    this.mesh = new THREE.InstancedMesh(this.geometry, this.material, MAX_OBSTACLES);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;
    this.capMat.color.set(theme.obstacleEmissive);
    this.parent.add(this.mesh);
  }

  /** cells: [{x,y}], dims: {cols, rows}. animate: los nuevos aparecen creciendo. */
  setCells(cells, dims, animate = false) {
    this.dims = dims;
    this.cells = cells.slice(0, MAX_OBSTACLES).map((c, i) => ({
      ...c,
      t: animate ? 0 : 1,
      seed: (c.x * 31 + c.y * 17 + i) % 7,
    }));
  }

  addCells(cells) {
    for (const c of cells) {
      if (this.cells.length >= MAX_OBSTACLES) break;
      this.cells.push({ ...c, t: 0, seed: (c.x * 31 + c.y * 17) % 7 });
    }
  }

  update(dt, time) {
    if (!this.mesh) return;
    const { cols, rows } = this.dims ?? { cols: 1, rows: 1 };
    let i = 0;
    for (const c of this.cells) {
      c.t = Math.min(1, c.t + dt * 2.2);
      const w = cellToWorld(c.x, c.y, cols, rows);
      const grow = 1 - (1 - c.t) ** 3;
      const pulse = 1 + Math.sin(time * 2 + c.seed) * 0.02;
      this._p.set(w.x, 0, w.z);
      this._s.set(pulse, Math.max(0.001, grow) * (0.9 + (c.seed % 3) * 0.08), pulse);
      this._q.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, this.style === 'garden' ? c.seed * 0.4 : 0);
      this._m.compose(this._p, this._q, this._s);
      this.mesh.setMatrixAt(i, this._m);
      this._p.set(w.x, 0.012, w.z);
      this._s.set(1, 1, 1);
      this._q.identity();
      this._m.compose(this._p, this._q, this._s);
      this.caps.setMatrixAt(i, this._m);
      i++;
    }
    this.mesh.count = i;
    this.caps.count = i;
    this.mesh.instanceMatrix.needsUpdate = true;
    this.caps.instanceMatrix.needsUpdate = true;
    this.material.emissiveIntensity = 0.5 + Math.sin(time * 1.8) * 0.12;
  }

  clear() {
    this.cells = [];
    if (this.mesh) this.mesh.count = 0;
    this.caps.count = 0;
  }

  disposeMesh() {
    if (!this.mesh) return;
    this.mesh.removeFromParent();
    this.mesh.dispose();
    this.geometry.dispose();
    this.material.dispose();
    this.mesh = null;
  }

  dispose() {
    this.disposeMesh();
    this.caps.removeFromParent();
    this.caps.dispose();
    this.capGeo.dispose();
    this.capMat.dispose();
  }
}
