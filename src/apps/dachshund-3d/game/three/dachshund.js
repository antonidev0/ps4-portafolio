import * as THREE from 'three';

// Perro salchicha procedural: cuerpo continuo formado por esferas solapadas (InstancedMesh)
// que siguen la trayectoria del perro, más cabeza, patas, orejas y cola articuladas en grupos.

const COLORS = {
  body: 0x8c4a22,
  tan: 0xd59a5a,
  ear: 0x5c2c12,
  nose: 0x101010,
  eye: 0xffffff,
  pupil: 0x1a0d05,
  collar: 0x1e7bff,
  tongue: 0xff6f8a,
  star: 0xffd84a,
};

const BODY_STEP = 0.14; // separación entre esferas del cuerpo
const LEG_HEIGHT = 0.27;

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
function angleLerp(a, b, t) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

/** Polilínea reutilizable con muestreo por longitud de arco y extrapolación en los extremos. */
class Path {
  constructor(capacity) {
    this.x = new Float32Array(capacity);
    this.z = new Float32Array(capacity);
    this.cum = new Float32Array(capacity);
    this.n = 0;
    this.length = 0;
  }
  set(points) {
    const n = Math.min(points.length, this.x.length);
    this.n = n;
    let acc = 0;
    for (let i = 0; i < n; i++) {
      this.x[i] = points[i].x;
      this.z[i] = points[i].z;
      if (i > 0) acc += Math.hypot(this.x[i] - this.x[i - 1], this.z[i] - this.z[i - 1]);
      this.cum[i] = acc;
    }
    this.length = acc;
  }
  pointAt(s, out) {
    const { n, x, z, cum } = this;
    if (n === 1) {
      out.x = x[0];
      out.z = z[0];
      return out;
    }
    let i;
    if (s <= 0) i = 0;
    else if (s >= this.length) i = n - 2;
    else {
      // búsqueda binaria del tramo
      let lo = 0;
      let hi = n - 1;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (cum[mid] <= s) lo = mid;
        else hi = mid;
      }
      i = lo;
    }
    // salta tramos de longitud cero
    while (i < n - 2 && cum[i + 1] - cum[i] < 1e-6) i++;
    const segLen = Math.max(1e-6, cum[i + 1] - cum[i]);
    const t = (s - cum[i]) / segLen;
    out.x = x[i] + (x[i + 1] - x[i]) * t;
    out.z = z[i] + (z[i + 1] - z[i]) * t;
    return out;
  }
  /** Media de tres muestras: redondea las esquinas de 90° de la cuadrícula. */
  smoothAt(s, out, radius = 0.36) {
    const a = this.pointAt(s - radius, TMP_A);
    const ax = a.x;
    const az = a.z;
    const b = this.pointAt(s + radius, TMP_A);
    const bx = b.x;
    const bz = b.z;
    const c = this.pointAt(s, out);
    out.x = (ax + bx + c.x * 2) / 4;
    out.z = (az + bz + c.z * 2) / 4;
    return out;
  }
  /** Dirección hacia la cabeza en la posición s. */
  forwardAt(s, out) {
    const a = this.smoothAt(s - 0.12, TMP_B);
    const ax = a.x;
    const az = a.z;
    const b = this.smoothAt(s + 0.12, TMP_B);
    let dx = ax - b.x;
    let dz = az - b.z;
    const len = Math.hypot(dx, dz) || 1;
    out.x = dx / len;
    out.z = dz / len;
    return out;
  }
}
const TMP_A = { x: 0, z: 0 };
const TMP_B = { x: 0, z: 0 };

export class Dachshund {
  constructor({ maxUnits = 300 } = {}) {
    this.group = new THREE.Group();
    this.disposables = [];
    this.path = new Path(maxUnits + 4);
    this.headYaw = 0;
    this.hasYaw = false;

    const mat = (color, extra = {}) => this.track(new THREE.MeshStandardMaterial({ color, roughness: 0.55, ...extra }));
    this.mats = {
      body: mat(COLORS.body),
      tan: mat(COLORS.tan, { roughness: 0.6 }),
      ear: mat(COLORS.ear, { roughness: 0.65 }),
      nose: mat(COLORS.nose, { roughness: 0.18, metalness: 0.2 }),
      eye: mat(COLORS.eye, { roughness: 0.15 }),
      pupil: mat(COLORS.pupil, { roughness: 0.08 }),
      shine: this.track(new THREE.MeshBasicMaterial({ color: 0xffffff })),
      collar: mat(COLORS.collar, { emissive: COLORS.collar, emissiveIntensity: 0.9, roughness: 0.3 }),
      tongue: mat(COLORS.tongue, { roughness: 0.4 }),
      star: this.track(new THREE.MeshBasicMaterial({ color: COLORS.star })),
    };
    const sphere = this.track(new THREE.SphereGeometry(1, 20, 14));
    const lowSphere = this.track(new THREE.SphereGeometry(1, 14, 10));
    this.geo = { sphere, lowSphere };

    // Cuerpo y vientre: esferas instanciadas que se recolocan cada fotograma
    const capacity = Math.ceil((maxUnits + 2) / BODY_STEP) + 8;
    this.body = new THREE.InstancedMesh(sphere, this.mats.body, capacity);
    this.belly = new THREE.InstancedMesh(lowSphere, this.mats.tan, capacity);
    for (const m of [this.body, this.belly]) {
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      m.frustumCulled = false;
      m.castShadow = true;
      m.count = 0;
      this.group.add(m);
    }
    this.capacity = capacity;

    this.buildHead();
    this.buildLegs();
    this.buildTail();
    this.buildCollar();
    this.buildStars();

    this._m = new THREE.Matrix4();
    this._q = new THREE.Quaternion();
    this._p = new THREE.Vector3();
    this._s = new THREE.Vector3();
    this._pt = { x: 0, z: 0 };
    this._f = { x: 0, z: 1 };
  }

  track(o) {
    this.disposables.push(o);
    return o;
  }

  mesh(geo, mat, { pos = [0, 0, 0], scale = [1, 1, 1], rot = [0, 0, 0] } = {}) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pos);
    m.scale.set(...scale);
    m.rotation.set(...rot);
    m.castShadow = true;
    return m;
  }

  buildHead() {
    const { sphere } = this.geo;
    const M = this.mats;
    const head = new THREE.Group();
    const tilt = new THREE.Group(); // inclinación (alegría, victoria, derrota)
    head.add(tilt);
    this.head = head;
    this.headTilt = tilt;

    tilt.add(this.mesh(sphere, M.body, { scale: [0.29, 0.27, 0.31] }));
    // Hocico alargado
    const snoutGeo = this.track(new THREE.CapsuleGeometry(0.145, 0.24, 6, 14));
    snoutGeo.rotateX(Math.PI / 2);
    tilt.add(this.mesh(snoutGeo, M.body, { pos: [0, -0.07, 0.3], scale: [1, 0.86, 1] }));
    tilt.add(this.mesh(sphere, M.tan, { pos: [0, -0.13, 0.33], scale: [0.13, 0.08, 0.22] }));
    tilt.add(this.mesh(sphere, M.nose, { pos: [0, -0.03, 0.57], scale: [0.085, 0.07, 0.065] }));
    // Lengua (visible al recoger un premio)
    const tongue = this.mesh(sphere, M.tongue, { pos: [0, -0.19, 0.42], scale: [0.055, 0.02, 0.08] });
    tongue.visible = false;
    tilt.add(tongue);
    this.tongue = tongue;

    // Ojos
    this.eyes = [];
    for (const side of [-1, 1]) {
      const eye = new THREE.Group();
      eye.position.set(0.135 * side, 0.07, 0.2);
      eye.rotation.y = 0.32 * side;
      eye.add(this.mesh(sphere, M.eye, { scale: [0.068, 0.072, 0.05] }));
      eye.add(this.mesh(sphere, M.pupil, { pos: [0, 0, 0.032], scale: [0.045, 0.05, 0.03] }));
      const shine = this.mesh(sphere, M.shine, { pos: [0.014, 0.022, 0.058], scale: [0.016, 0.016, 0.01] });
      shine.castShadow = false;
      eye.add(shine);
      tilt.add(eye);
      this.eyes.push(eye);
      // Cejas color canela, típicas del perro salchicha bicolor
      tilt.add(this.mesh(sphere, M.tan, { pos: [0.11 * side, 0.165, 0.2], scale: [0.055, 0.03, 0.045] }));
    }

    // Orejas largas y caídas
    this.ears = [];
    for (const side of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(0.245 * side, 0.1, -0.03);
      pivot.add(this.mesh(sphere, M.ear, { pos: [0.035 * side, -0.17, 0.0], scale: [0.065, 0.24, 0.15] }));
      tilt.add(pivot);
      this.ears.push({ pivot, side });
    }
    this.group.add(head);
  }

  buildLegs() {
    const { sphere } = this.geo;
    const legGeo = this.track(new THREE.CapsuleGeometry(0.075, 0.14, 4, 10));
    this.legs = [];
    // [delante/detrás, lado, fase]
    const defs = [
      ['front', -1, 0],
      ['front', 1, Math.PI],
      ['rear', -1, Math.PI],
      ['rear', 1, 0],
    ];
    for (const [where, side, phase] of defs) {
      const mount = new THREE.Group();
      const swing = new THREE.Group();
      mount.add(swing);
      swing.add(this.mesh(legGeo, this.mats.body, { pos: [0, -0.12, 0] }));
      swing.add(this.mesh(sphere, this.mats.tan, { pos: [0, -LEG_HEIGHT + 0.035, 0.035], scale: [0.09, 0.055, 0.12] }));
      this.group.add(mount);
      this.legs.push({ mount, swing, where, side, phase });
    }
  }

  buildTail() {
    const tailGeo = this.track(new THREE.CapsuleGeometry(0.05, 0.3, 4, 10));
    tailGeo.rotateX(Math.PI / 2);
    tailGeo.translate(0, 0, 0.2);
    const root = new THREE.Group();
    const wag = new THREE.Group();
    const pitch = new THREE.Group();
    root.add(wag);
    wag.add(pitch);
    pitch.add(this.mesh(tailGeo, this.mats.body));
    const tip = this.mesh(this.geo.sphere, this.mats.ear, { pos: [0, 0, 0.42], scale: [0.045, 0.045, 0.06] });
    pitch.add(tip);
    this.group.add(root);
    this.tail = { root, wag, pitch };
  }

  buildCollar() {
    const collarGeo = this.track(new THREE.TorusGeometry(0.27, 0.045, 8, 28));
    const tagGeo = this.track(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16));
    tagGeo.rotateX(Math.PI / 2);
    const collar = new THREE.Group();
    collar.add(this.mesh(collarGeo, this.mats.collar));
    collar.add(this.mesh(tagGeo, this.mats.collar, { pos: [0, -0.31, 0.03] }));
    this.group.add(collar);
    this.collar = collar;
  }

  buildStars() {
    const starGeo = this.track(new THREE.OctahedronGeometry(0.07, 0));
    const stars = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const s = new THREE.Mesh(starGeo, this.mats.star);
      stars.add(s);
    }
    stars.visible = false;
    this.head.add(stars);
    this.stars = stars;
  }

  /** Coloca la cabeza mirando a una dirección sin interpolar (al reiniciar la partida). */
  resetHeading() {
    this.hasYaw = false;
  }

  /**
   * path: puntos {x, z} del mundo, de la cabeza a la cola.
   * st: { dt, time, stride, moving (0..1), look {x,z}|null, joy, victory, defeat }
   */
  update(points, st) {
    const path = this.path;
    path.set(points);
    const L = path.length;
    const t = st.time;
    const phase = st.stride * Math.PI * 1.55;
    const moving = st.moving ?? 1;
    const joy = clamp01(st.joy ?? 0);
    const victory = clamp01(st.victory ?? 0);
    const defeat = clamp01(st.defeat ?? 0);

    const bounce = Math.abs(Math.sin(phase)) * 0.035 * moving;
    const hop = victory * Math.abs(Math.sin(t * 7.5)) * 0.32;
    const lift = bounce + hop + joy * Math.sin(joy * Math.PI) * 0.06;
    const pt = this._pt;
    const f = this._f;

    // --- Cuerpo ---
    const bodyEnd = L + 0.18;
    let count = 0;
    for (let s = 0.02; s <= bodyEnd + 1e-4 && count < this.capacity; s += BODY_STEP) {
      path.smoothAt(s, pt);
      const chest = Math.exp(-((s - 0.5) ** 2) / 0.18);
      const neck = s < 0.25 ? lerp(0.3, 0.36, s / 0.25) : 0.36;
      const haunch = Math.exp(-((bodyEnd - 0.3 - s) ** 2) / 0.06) * 0.02;
      const r = neck + chest * 0.05 + haunch;
      const y = 0.5 + 0.05 * Math.exp(-s * 1.5) + lift;
      this._p.set(pt.x, y, pt.z);
      this._s.set(r, r * 0.86, r);
      this._m.compose(this._p, this._q, this._s);
      this.body.setMatrixAt(count, this._m);
      this._p.y = y - 0.12;
      this._s.set(r * 0.8, r * 0.6, r * 0.8);
      this._m.compose(this._p, this._q, this._s);
      this.belly.setMatrixAt(count, this._m);
      count++;
    }
    this.body.count = count;
    this.belly.count = count;
    this.body.instanceMatrix.needsUpdate = true;
    this.belly.instanceMatrix.needsUpdate = true;

    // --- Patas ---
    const frontS = 0.42;
    const rearS = Math.max(frontS + 0.45, bodyEnd - 0.34);
    for (const leg of this.legs) {
      const s = leg.where === 'front' ? frontS : rearS;
      path.smoothAt(s, pt);
      path.forwardAt(s, f);
      const ox = f.z * 0.19 * leg.side;
      const oz = -f.x * 0.19 * leg.side;
      leg.mount.position.set(pt.x + ox, 0.32 + lift, pt.z + oz);
      leg.mount.rotation.y = Math.atan2(f.x, f.z);
      const run = Math.sin(phase + leg.phase) * 0.75 * moving;
      const kick = victory * Math.sin(t * 15 + leg.phase) * 0.5;
      leg.swing.rotation.x = run + kick;
      leg.swing.rotation.z = defeat * 0.35 * leg.side;
    }

    // --- Collar ---
    path.smoothAt(0.08, pt);
    path.forwardAt(0.08, f);
    this.collar.position.set(pt.x, 0.62 + lift, pt.z);
    this.collar.rotation.set(0, Math.atan2(f.x, f.z), 0);
    this.collar.rotateX(-0.25);

    // --- Cabeza ---
    path.forwardAt(0.05, f);
    let targetYaw = Math.atan2(f.x, f.z);
    if (st.look) {
      // Mira ligeramente hacia el giro que el jugador ya ha pedido
      const lookYaw = Math.atan2(st.look.x, st.look.z);
      targetYaw = angleLerp(targetYaw, lookYaw, 0.3);
    }
    if (!this.hasYaw) {
      this.headYaw = targetYaw;
      this.hasYaw = true;
    } else {
      this.headYaw = angleLerp(this.headYaw, targetYaw, 1 - Math.exp(-(st.dt || 0.016) * 16));
    }
    path.pointAt(-0.2, pt);
    const hx = pt.x;
    const hz = pt.z;
    path.smoothAt(0.02, pt);
    this.head.position.set(lerp(hx, pt.x, 0.35), 0.86 + lift - defeat * 0.18, lerp(hz, pt.z, 0.35));
    this.head.rotation.y = this.headYaw;
    const idleNod = (1 - moving) * Math.sin(t * 1.7) * 0.05;
    this.headTilt.rotation.x =
      idleNod - joy * Math.sin(joy * Math.PI * 2) * 0.22 - victory * (0.45 + Math.sin(t * 7.5) * 0.12) + defeat * 0.5;
    this.headTilt.rotation.z = victory * Math.sin(t * 5) * 0.18 + (1 - moving) * Math.sin(t * 0.9) * 0.06;

    // Orejas: se balancean con el paso, aletean al celebrar y caen al perder
    for (const ear of this.ears) {
      const sway = Math.sin(phase + (ear.side > 0 ? 0 : 0.6)) * 0.14 * moving + Math.sin(t * 2.1) * 0.04;
      const flap = (joy * 0.7 + victory * 0.6) * Math.abs(Math.sin(t * 16));
      ear.pivot.rotation.z = ear.side * (0.12 + sway + flap - defeat * 0.12);
      ear.pivot.rotation.x = -0.08 + (bounce * 2.5) + defeat * 0.35 - victory * 0.25;
    }

    // Ojos: parpadeo, ojos felices y ojos cerrados al perder
    const blink = t % 3.6 < 0.11 ? 0.12 : 1;
    const eyeY = defeat > 0.3 ? 0.14 : Math.min(blink, 1 - joy * 0.45 - victory * 0.4);
    for (const eye of this.eyes) eye.scale.y = eyeY;
    this.tongue.visible = joy > 0.05 || victory > 0.05;

    // Estrellas de mareo al perder
    this.stars.visible = defeat > 0.2;
    if (this.stars.visible) {
      this.stars.children.forEach((s, i) => {
        const a = t * 4 + (i * Math.PI * 2) / 3;
        s.position.set(Math.cos(a) * 0.32, 0.38 + Math.sin(t * 6 + i) * 0.03, Math.sin(a) * 0.32);
        s.rotation.y = t * 6;
      });
    }

    // --- Cola ---
    path.smoothAt(bodyEnd - 0.12, pt);
    path.forwardAt(bodyEnd - 0.12, f);
    this.tail.root.position.set(pt.x, 0.62 + lift, pt.z);
    this.tail.root.rotation.y = Math.atan2(-f.x, -f.z);
    const wagSpeed = 6 + joy * 14 + victory * 14 + (1 - moving) * 2;
    const wagAmp = (0.35 + joy * 0.3 + victory * 0.3) * (1 - defeat);
    this.tail.wag.rotation.y = Math.sin(t * wagSpeed) * wagAmp;
    this.tail.pitch.rotation.x = -0.65 + defeat * 1.0 - victory * 0.25;
  }

  dispose() {
    this.group.removeFromParent();
    this.body.dispose();
    this.belly.dispose();
    this.disposables.forEach((d) => d.dispose());
  }
}
