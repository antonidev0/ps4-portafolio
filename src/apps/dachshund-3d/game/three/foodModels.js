import * as THREE from 'three';

// Huesos y galletas hechos con geometrías de Three.js. Las geometrías y materiales
// se crean una vez y se comparten entre todos los premios.

const easeOutBack = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
};

export class FoodField {
  constructor(parent) {
    this.parent = parent;
    this.disposables = [];
    const track = (o) => (this.disposables.push(o), o);

    this.geo = {
      shaft: track(new THREE.CylinderGeometry(0.075, 0.075, 0.5, 14)),
      knob: track(new THREE.SphereGeometry(0.105, 16, 12)),
      cookie: track(new THREE.CylinderGeometry(0.3, 0.3, 0.12, 28)),
      rim: track(new THREE.TorusGeometry(0.3, 0.06, 10, 32)),
      chip: track(new THREE.SphereGeometry(0.045, 8, 6)),
      ring: track(new THREE.RingGeometry(0.36, 0.44, 40)),
    };
    this.geo.shaft.rotateZ(Math.PI / 2);
    this.geo.rim.rotateX(Math.PI / 2);
    this.geo.ring.rotateX(-Math.PI / 2);

    this.mat = {
      bone: track(new THREE.MeshStandardMaterial({ color: 0xf4ecd8, roughness: 0.45, emissive: 0x9fd8ff, emissiveIntensity: 0.22 })),
      cookie: track(new THREE.MeshStandardMaterial({ color: 0xd88a3a, roughness: 0.7, emissive: 0x6a2a00, emissiveIntensity: 0.25 })),
      cookieRim: track(new THREE.MeshStandardMaterial({ color: 0xb8672a, roughness: 0.75 })),
      chip: track(new THREE.MeshStandardMaterial({ color: 0x3b1d0e, roughness: 0.5 })),
      icing: track(new THREE.MeshStandardMaterial({ color: 0xff7eb6, roughness: 0.4, emissive: 0xff4f9a, emissiveIntensity: 0.35 })),
      ringBone: track(new THREE.MeshBasicMaterial({ color: 0x7fd4ff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })),
      ringCookie: track(new THREE.MeshBasicMaterial({ color: 0xffa54a, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })),
    };

    this.pool = { bone: [], cookie: [] };
    this.items = new Map(); // id -> { obj, type, t, state }
  }

  makeBone() {
    const g = new THREE.Group();
    const model = new THREE.Group();
    const shaft = new THREE.Mesh(this.geo.shaft, this.mat.bone);
    shaft.castShadow = true;
    model.add(shaft);
    for (const x of [-0.25, 0.25]) {
      for (const z of [-0.075, 0.075]) {
        const k = new THREE.Mesh(this.geo.knob, this.mat.bone);
        k.position.set(x, 0, z);
        k.castShadow = true;
        model.add(k);
      }
    }
    model.rotation.x = -0.35;
    g.add(model);
    const ring = new THREE.Mesh(this.geo.ring, this.mat.ringBone);
    ring.position.y = -0.47;
    g.add(ring);
    g.userData = { model, ring };
    return g;
  }

  makeCookie() {
    const g = new THREE.Group();
    const model = new THREE.Group();
    const base = new THREE.Mesh(this.geo.cookie, this.mat.cookie);
    base.castShadow = true;
    model.add(base);
    const rim = new THREE.Mesh(this.geo.rim, this.mat.cookieRim);
    model.add(rim);
    // Pepitas de chocolate y puntos de glaseado
    const spots = [
      [0.12, 0.08], [-0.13, 0.1], [0.02, -0.15], [-0.08, -0.06], [0.17, -0.1], [-0.16, -0.16], [0.05, 0.19],
    ];
    spots.forEach(([x, z], i) => {
      const c = new THREE.Mesh(this.geo.chip, i % 3 === 0 ? this.mat.icing : this.mat.chip);
      c.position.set(x, 0.065, z);
      c.scale.y = 0.6;
      model.add(c);
    });
    model.rotation.x = 0.5;
    g.add(model);
    const ring = new THREE.Mesh(this.geo.ring, this.mat.ringCookie);
    ring.position.y = -0.47;
    g.add(ring);
    g.userData = { model, ring };
    return g;
  }

  acquire(type) {
    const obj = this.pool[type].pop() ?? (type === 'bone' ? this.makeBone() : this.makeCookie());
    this.parent.add(obj);
    return obj;
  }

  release(item) {
    item.obj.removeFromParent();
    this.pool[item.type].push(item.obj);
  }

  /** Muestra un premio nuevo con animación de aparición. */
  add(prize, world) {
    const obj = this.acquire(prize.type);
    obj.position.set(world.x, 0.5, world.z);
    obj.scale.setScalar(0.001);
    this.items.set(prize.id, { obj, type: prize.type, t: 0, state: 'in', phase: Math.random() * 6 });
  }

  /** Animación de recogida: sube y se encoge. */
  collect(id) {
    const it = this.items.get(id);
    if (it) {
      it.state = 'out';
      it.t = 0;
    }
  }

  clear() {
    for (const it of this.items.values()) this.release(it);
    this.items.clear();
  }

  update(dt, time) {
    for (const [id, it] of this.items) {
      it.t += dt;
      const { model, ring } = it.obj.userData;
      model.rotation.y = time * 1.6 + it.phase;
      if (it.state === 'in') {
        const k = Math.min(1, it.t / 0.45);
        it.obj.scale.setScalar(Math.max(0.001, easeOutBack(k)));
        if (k >= 1) it.state = 'idle';
      }
      if (it.state !== 'out') {
        it.obj.position.y = 0.5 + Math.sin(time * 2.6 + it.phase) * 0.08;
        ring.position.y = -0.47 - Math.sin(time * 2.6 + it.phase) * 0.08;
        ring.scale.setScalar(1 + Math.sin(time * 3 + it.phase) * 0.08);
      } else {
        const k = Math.min(1, it.t / 0.28);
        it.obj.scale.setScalar(Math.max(0.001, 1 - k));
        it.obj.position.y += dt * 2.5;
        if (k >= 1) {
          this.release(it);
          this.items.delete(id);
        }
      }
    }
  }

  dispose() {
    this.clear();
    this.disposables.forEach((d) => d.dispose());
  }
}
