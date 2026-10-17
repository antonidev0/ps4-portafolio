import * as THREE from 'three';

/** Renderizador, escena, cámara y luces. Las intensidades vienen del tema activo. */
export function createStage(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.className = 'dg-canvas';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030a1c);
  scene.fog = new THREE.Fog(0x030a1c, 30, 80);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);

  const hemi = new THREE.HemisphereLight(0x6f9cff, 0x05060c, 0.55);
  const key = new THREE.DirectionalLight(0xdfe9ff, 2.1);
  key.position.set(6, 16, 9);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -15;
  key.shadow.camera.right = 15;
  key.shadow.camera.top = 15;
  key.shadow.camera.bottom = -15;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 45;
  key.shadow.bias = -0.0008;
  key.shadow.normalBias = 0.02;
  const rimA = new THREE.PointLight(0x2b8cff, 26, 40, 1.6);
  rimA.position.set(-12, 4, -6);
  const rimB = new THREE.PointLight(0x55d6ff, 26, 40, 1.6);
  rimB.position.set(12, 4, 6);
  scene.add(hemi, key, key.target, rimA, rimB);

  const applyTheme = (theme) => {
    scene.background.set(theme.background);
    scene.fog.color.set(theme.fog);
    hemi.color.set(theme.ambient);
    hemi.intensity = theme.ambientIntensity;
    key.color.set(theme.key);
    key.intensity = theme.keyIntensity;
    rimA.color.set(theme.rimA);
    rimB.color.set(theme.rimB);
    rimA.intensity = rimB.intensity = theme.rimIntensity;
  };

  return { renderer, scene, camera, lights: { hemi, key, rimA, rimB }, applyTheme };
}

const _v = new THREE.Vector3();

/**
 * Coloca la cámara en vista superior con ligera inclinación y la aleja lo justo
 * para que todo el tablero quepa en la zona visible (dejando sitio al HUD).
 * orientation 'portrait' gira la vista 90° para aprovechar pantallas verticales.
 */
export function fitCamera(camera, { cols, rows, aspect, orientation, tilt = 0.42, margin = { x: 0.92, top: 0.74, bottom: -0.9 } }) {
  camera.aspect = aspect;
  camera.fov = aspect < 1 ? 46 : 40;
  const dir =
    orientation === 'portrait'
      ? new THREE.Vector3(Math.sin(tilt), Math.cos(tilt), 0)
      : new THREE.Vector3(0, Math.cos(tilt), Math.sin(tilt));
  const target = new THREE.Vector3(0, 0, 0);
  const hx = cols / 2 + 0.5;
  const hz = rows / 2 + 0.5;
  const corners = [
    [-hx, 0, -hz], [hx, 0, -hz], [-hx, 0, hz], [hx, 0, hz],
    [-hx, 1, -hz], [hx, 1, -hz], [-hx, 1, hz], [hx, 1, hz],
  ];
  const fits = (d) => {
    camera.position.copy(dir).multiplyScalar(d).add(target);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
    let minY = Infinity;
    let maxY = -Infinity;
    for (const c of corners) {
      _v.set(c[0], c[1], c[2]).project(camera);
      if (Math.abs(_v.x) > margin.x) return { ok: false };
      minY = Math.min(minY, _v.y);
      maxY = Math.max(maxY, _v.y);
    }
    return { ok: maxY - minY <= margin.top - margin.bottom, minY, maxY };
  };
  let lo = 4;
  let hi = 160;
  for (let i = 0; i < 26; i++) {
    const mid = (lo + hi) / 2;
    if (fits(mid).ok) hi = mid;
    else lo = mid;
  }
  // Centra verticalmente el tablero en la franja libre entre el HUD y el borde inferior
  const r = fits(hi);
  const shift = (margin.top + margin.bottom) / 2 - (r.maxY + r.minY) / 2;
  camera.position.copy(dir).multiplyScalar(hi);
  camera.lookAt(target);
  camera.updateMatrixWorld(true);
  const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
  const worldPerNdc = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * hi;
  const offset = up.multiplyScalar(-shift * worldPerNdc);
  camera.position.add(offset);
  target.add(offset);
  camera.lookAt(target);
  camera.updateProjectionMatrix();
  return { position: camera.position.clone(), target };
}
