import * as THREE from 'three';

// Ambientación alrededor del tablero (nunca dentro del área de juego).

export function createDecor(theme, cols, rows) {
  const group = new THREE.Group();
  const disposables = [];
  const track = (o) => (disposables.push(o), o);
  const animated = [];
  const hw = cols / 2 + 1.6;
  const hh = rows / 2 + 1.6;

  const glow = (color, intensity = 1.4) =>
    track(new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: 0.3 }));

  // n puntos repartidos uniformemente por el perímetro exterior
  const perimeter = (n, inset = 0) => {
    const w = hw + inset;
    const h = hh + inset;
    const total = 4 * (w + h);
    const pts = [];
    for (let i = 0; i < n; i++) {
      let d = ((i + 0.5) / n) * total;
      if (d < 2 * w) pts.push({ x: -w + d, z: -h });
      else if ((d -= 2 * w) < 2 * h) pts.push({ x: w, z: -h + d });
      else if ((d -= 2 * h) < 2 * w) pts.push({ x: w - d, z: h });
      else pts.push({ x: -w, z: h - (d - 2 * w) });
    }
    return pts;
  };

  if (theme.decor === 'park') {
    const poleGeo = track(new THREE.CylinderGeometry(0.05, 0.07, 1.6, 8));
    const bulbGeo = track(new THREE.SphereGeometry(0.17, 14, 10));
    const poleMat = track(new THREE.MeshStandardMaterial({ color: 0x1b2a4a, roughness: 0.4, metalness: 0.6 }));
    const bulbMat = glow(theme.accent, 2.2);
    for (const p of perimeter(12)) {
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(p.x, 0.3, p.z);
      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.set(p.x, 1.2, p.z);
      group.add(pole, bulb);
    }
    const orbGeo = track(new THREE.SphereGeometry(0.22, 16, 12));
    const orbMat = glow(theme.border, 1.8);
    for (let i = 0; i < 6; i++) {
      const orb = new THREE.Mesh(orbGeo, orbMat);
      const a = (i / 6) * Math.PI * 2;
      orb.userData = { a, r: Math.max(hw, hh) + 1.5, y: 2.2 + (i % 3) * 0.5 };
      group.add(orb);
      animated.push((t) => {
        const { a: a0, r, y } = orb.userData;
        orb.position.set(Math.cos(a0 + t * 0.08) * r, y + Math.sin(t + a0) * 0.3, Math.sin(a0 + t * 0.08) * r * 0.75);
      });
    }
  } else if (theme.decor === 'garden') {
    const coneGeo = track(new THREE.ConeGeometry(0.22, 1, 5));
    coneGeo.translate(0, 0.5, 0);
    const mats = [glow(theme.border, 1.2), glow(theme.rimB, 1.2), glow(0xff6bd6, 1.0)];
    perimeter(18, 0.3).forEach((p, i) => {
      for (let k = 0; k < 3; k++) {
        const c = new THREE.Mesh(coneGeo, mats[(i + k) % 3]);
        c.position.set(p.x + (k - 1) * 0.3, -0.05, p.z + ((k * 7) % 3 - 1) * 0.25);
        c.scale.set(1, 0.6 + ((i + k) % 4) * 0.35, 1);
        c.rotation.z = (k - 1) * 0.25;
        group.add(c);
      }
    });
    // Luciérnagas
    const n = 60;
    const pos = new Float32Array(n * 3);
    const seeds = [];
    for (let i = 0; i < n; i++) seeds.push([Math.random() * Math.PI * 2, Math.random(), Math.random()]);
    const geo = track(new THREE.BufferGeometry());
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = track(new THREE.PointsMaterial({ color: 0xe2c6ff, size: 0.12, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    group.add(pts);
    animated.push((t) => {
      for (let i = 0; i < n; i++) {
        const [a, r, h] = seeds[i];
        const R = Math.max(hw, hh) + 0.5 + r * 3;
        pos[i * 3] = Math.cos(a + t * 0.05 * (1 + r)) * R;
        pos[i * 3 + 1] = 0.6 + h * 2.5 + Math.sin(t * 1.3 + a * 3) * 0.25;
        pos[i * 3 + 2] = Math.sin(a + t * 0.05 * (1 + r)) * R * 0.8;
      }
      geo.attributes.position.needsUpdate = true;
    });
  } else {
    const R = Math.max(cols, rows) * 0.62 + 2;
    const ringGeo = track(new THREE.TorusGeometry(R, 0.06, 8, 96));
    const ringGeo2 = track(new THREE.TorusGeometry(R * 1.12, 0.04, 8, 96));
    const ringA = new THREE.Mesh(ringGeo, glow(theme.border, 1.6));
    const ringB = new THREE.Mesh(ringGeo2, glow(theme.rimB, 1.4));
    ringA.rotation.x = Math.PI / 2;
    ringB.rotation.x = Math.PI / 2;
    ringA.position.y = -0.9;
    ringB.position.y = -1.4;
    group.add(ringA, ringB);
    animated.push((t) => {
      ringA.rotation.z = t * 0.15;
      ringB.rotation.z = -t * 0.1;
      ringA.position.y = -0.9 + Math.sin(t * 0.8) * 0.12;
    });
    const pillarGeo = track(new THREE.BoxGeometry(0.18, 2.6, 0.18));
    const pillarMat = glow(theme.border, 1.3);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const p = new THREE.Mesh(pillarGeo, pillarMat);
      p.position.set(sx * (hw + 0.3), 0.8, sz * (hh + 0.3));
      group.add(p);
    }
    animated.push((t) => {
      pillarMat.emissiveIntensity = 1.1 + Math.sin(t * 3) * 0.35;
    });
  }

  return {
    group,
    update(t) {
      for (const fn of animated) fn(t);
    },
    dispose() {
      group.removeFromParent();
      disposables.forEach((d) => d.dispose());
    },
  };
}

/** Campo de estrellas lejano, compartido por todos los escenarios. */
export function createStarfield(count = 500) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 45 + Math.random() * 30;
    const a = Math.random() * Math.PI * 2;
    const y = -20 + Math.random() * 50;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = Math.sin(a) * r;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0x6fb4ff, size: 0.35, transparent: true, opacity: 0.7, depthWrite: false, fog: false });
  const points = new THREE.Points(geo, mat);
  return {
    points,
    setColor: (c) => mat.color.set(c),
    update: (t) => (points.rotation.y = t * 0.01),
    dispose() {
      points.removeFromParent();
      geo.dispose();
      mat.dispose();
    },
  };
}
