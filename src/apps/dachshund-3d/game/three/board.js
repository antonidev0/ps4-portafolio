import * as THREE from 'three';

/** Convierte una casilla lógica a coordenadas del mundo (centro de la casilla). */
export const cellToWorld = (x, y, cols, rows) => ({ x: x - cols / 2 + 0.5, z: y - rows / 2 + 0.5 });

function makeGridTexture(cols, rows, theme) {
  const px = Math.max(24, Math.min(64, Math.floor(1536 / Math.max(cols, rows))));
  const canvas = document.createElement('canvas');
  canvas.width = cols * px;
  canvas.height = rows * px;
  const g = canvas.getContext('2d');
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      g.fillStyle = (x + y) % 2 ? theme.boardAlt : theme.board;
      g.fillRect(x * px, y * px, px, px);
    }
  }
  // Líneas con un halo suave: una pasada ancha y transparente y otra fina
  const lines = (width, alpha) => {
    g.globalAlpha = alpha;
    g.strokeStyle = theme.grid;
    g.lineWidth = width;
    g.beginPath();
    for (let x = 0; x <= cols; x++) {
      g.moveTo(x * px, 0);
      g.lineTo(x * px, rows * px);
    }
    for (let y = 0; y <= rows; y++) {
      g.moveTo(0, y * px);
      g.lineTo(cols * px, y * px);
    }
    g.stroke();
  };
  lines(px * 0.12, 0.35);
  lines(Math.max(1, px * 0.03), 1);
  g.globalAlpha = 1;
  // Pequeños puntos en las intersecciones
  g.fillStyle = theme.grid;
  for (let y = 0; y <= rows; y++) {
    for (let x = 0; x <= cols; x++) {
      g.beginPath();
      g.arc(x * px, y * px, px * 0.05, 0, Math.PI * 2);
      g.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makeGlowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 8, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,0.9)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0.35)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Tablero rectangular: losa oscura, cuadrícula luminosa y bordes de neón.
 * Devuelve { group, dispose, update(time) }.
 */
export function createBoard(cols, rows, theme) {
  const group = new THREE.Group();
  const disposables = [];
  const track = (o) => (disposables.push(o), o);

  const slabGeo = track(new THREE.BoxGeometry(cols + 0.7, 0.5, rows + 0.7));
  const slabMat = track(new THREE.MeshStandardMaterial({ color: 0x050914, roughness: 0.6, metalness: 0.3 }));
  const slab = new THREE.Mesh(slabGeo, slabMat);
  slab.position.y = -0.26;
  slab.receiveShadow = true;
  group.add(slab);

  const gridTex = track(makeGridTexture(cols, rows, theme));
  const topGeo = track(new THREE.PlaneGeometry(cols, rows));
  const topMat = track(
    new THREE.MeshStandardMaterial({
      map: gridTex,
      roughness: 0.75,
      metalness: 0.1,
      emissive: 0xffffff,
      emissiveMap: gridTex,
      emissiveIntensity: 0.32,
    }),
  );
  const top = new THREE.Mesh(topGeo, topMat);
  top.rotation.x = -Math.PI / 2;
  top.position.y = 0.0;
  top.receiveShadow = true;
  group.add(top);

  // Bordes luminosos
  const borderMat = track(
    new THREE.MeshStandardMaterial({ color: theme.border, emissive: theme.border, emissiveIntensity: 1.6, roughness: 0.3 }),
  );
  const t = 0.16;
  const h = 0.22;
  const hGeo = track(new THREE.BoxGeometry(cols + t * 2 + 0.2, h, t));
  const vGeo = track(new THREE.BoxGeometry(t, h, rows + 0.2));
  const borders = [
    [hGeo, 0, -(rows / 2 + t / 2 + 0.1)],
    [hGeo, 0, rows / 2 + t / 2 + 0.1],
    [vGeo, -(cols / 2 + t / 2 + 0.1), 0],
    [vGeo, cols / 2 + t / 2 + 0.1, 0],
  ];
  for (const [geo, x, z] of borders) {
    const m = new THREE.Mesh(geo, borderMat);
    m.position.set(x, h / 2 - 0.02, z);
    group.add(m);
  }

  // Halo bajo el tablero
  const glowTex = track(makeGlowTexture());
  const glowGeo = track(new THREE.PlaneGeometry(cols * 1.7, rows * 1.9));
  const glowMat = track(
    new THREE.MeshBasicMaterial({
      map: glowTex,
      color: theme.border,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = -0.55;
  group.add(glow);

  return {
    group,
    glowTexture: glowTex,
    update(time) {
      borderMat.emissiveIntensity = 1.35 + Math.sin(time * 1.6) * 0.25;
    },
    dispose() {
      group.removeFromParent();
      disposables.forEach((d) => d.dispose());
    },
  };
}
