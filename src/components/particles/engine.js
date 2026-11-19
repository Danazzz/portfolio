import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DataTexture,
  FloatType,
  HalfFloatType,
  Matrix4,
  NormalBlending,
  PerspectiveCamera,
  Points,
  RGBAFormat,
  Raycaster,
  SRGBColorSpace,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import { buildShape, shapeKey, shapeMotion, shell } from "./shapes";
import { pointsFragment, pointsVertex, positionShader, velocityShader } from "./shaders";

/**
 * Parameter bawaan. Satuan gaya & jarak relatif terhadap ukuran objek (jari-jari ≈ 1);
 * gaya dalam "per frame 60 fps" sehingga terasa sama di layar 60 Hz maupun 120 Hz.
 */
export const DEFAULTS = {
  count: 0, // 0 = otomatis sesuai perangkat
  size: 2.6, // ukuran titik (px CSS) di kedalaman tengah objek
  color: "#2b201c",
  accentColor: null, // ±16% partikel memakai warna ini
  opacity: 1,
  interactionRadius: 0.3,
  repulsion: 0.024,
  attraction: 0.005,
  stir: 0.6, // seberapa kuat partikel terseret arah gerak kursor
  stiffness: 0.02, // pegas ke bentuk target
  damping: 0.9, // sisa kecepatan per frame
  maxForce: 0.012,
  noise: 0.00008, // gerak mikro organik (kecil: bentuk harus tetap tajam)
  noiseScale: 1.1,
  noiseSpeed: 0.07,
  breath: 0.012,
  scatter: 0.3, // seberapa jauh partikel menyebar di tengah morph
  morphDuration: 2.6, // detik
  rotationSpeed: 0.12, // radian per detik (bentuk yang berputar)
  pointerTilt: 0.3, // kemiringan objek mengikuti posisi kursor (radian)
  interval: 7000, // ms tiap bentuk ditahan sebelum berganti (0 = tidak berganti otomatis)
  center: [0, 0], // posisi pusat objek dalam setengah lebar/tinggi kanvas (-1..1)
  fit: 0.36, // jari-jari objek sebagai porsi sisi terpendek kanvas
  maxPixelRatio: 2,
  reducedMotion: false,
};

const TAU = Math.PI * 2;
const ease = (dt, rate) => 1 - Math.exp(-dt * rate); // faktor lerp yang tidak tergantung fps

/**
 * Jumlah partikel otomatis. Fisika dihitung untuk semua partikel setiap frame,
 * jadi perangkat lemah langsung diberi jumlah kecil (bukan hanya "digambar lebih sedikit").
 */
export function autoCount() {
  const coarse = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
  const weak = (navigator.deviceMemory || 8) <= 4 || (navigator.hardwareConcurrency || 8) <= 4;
  if (coarse) return weak ? 64 * 64 : 96 * 96; // HP lemah 4.096 / HP 9.216
  return weak ? 112 * 112 : 160 * 160; // laptop lemah 12.544 / desktop 25.600
}

/** Cek dukungan WebGL2 tanpa membuat renderer (untuk memilih tampilan cadangan). */
export function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!c.getContext("webgl2");
  } catch {
    return false;
  }
}

/**
 * Membuat animasi partikel di dalam `container` (kanvas transparan, tidak menangkap klik).
 * Mengembalikan kontrol: morphTo, setShapes, setOptions, setColors, destroy, stats.
 * Melempar error bila WebGL/tekstur float tidak tersedia (pemanggil menampilkan cadangan).
 */
export function createParticleMorph(container, options = {}) {
  const o = { ...DEFAULTS, ...options };
  const side = Math.ceil(Math.sqrt(o.count || autoCount()));
  const N = side * side;

  /* ---------- renderer & scene ---------- */
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, { position: "absolute", inset: "0", width: "100%", height: "100%", display: "block", pointerEvents: "none" });

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  container.appendChild(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  const CAM_DIST = 6;
  camera.position.set(0, 0, CAM_DIST);
  camera.updateMatrixWorld();

  /* ---------- simulasi GPU ---------- */
  const gpu = new GPUComputationRenderer(side, side, renderer);
  if (!renderer.extensions.has("EXT_color_buffer_float")) gpu.setDataType(HalfFloatType);

  const floatTexture = (data) => {
    const t = new DataTexture(data, side, side, RGBAFormat, FloatType);
    t.needsUpdate = true;
    return t;
  };

  const shellPoints = shell(N);
  const pos0 = gpu.createTexture();
  pos0.image.data.set(shellPoints);
  const vel0 = gpu.createTexture();
  const posVar = gpu.addVariable("texturePosition", positionShader, pos0);
  const velVar = gpu.addVariable("textureVelocity", velocityShader, vel0);
  gpu.setVariableDependencies(posVar, [posVar, velVar]);
  gpu.setVariableDependencies(velVar, [posVar, velVar]);

  // Data acak per partikel: benih, jeda morph, ukuran, terang/aksen.
  const rnd = new Float32Array(N * 4);
  for (let i = 0; i < N * 4; i++) rnd[i] = Math.random();
  const randomTex = floatTexture(rnd);
  const shellTex = floatTexture(shellPoints);

  const sim = {
    uTime: { value: 0 },
    uDt: { value: 1 },
    uStiffness: { value: o.stiffness },
    uDamping: { value: o.damping },
    uMaxForce: { value: o.maxForce },
    uNoise: { value: o.noise },
    uNoiseScale: { value: o.noiseScale },
    uNoiseSpeed: { value: o.noiseSpeed },
    uMorph: { value: 0 },
    uScatter: { value: o.scatter },
    uBreath: { value: o.breath },
    uFlow: { value: 0 },
    uRadius: { value: o.interactionRadius },
    uRepel: { value: o.repulsion },
    uAttract: { value: o.attraction },
    uStir: { value: o.stir },
    uMouse: { value: 0 },
    uRayOrigin: { value: new Vector3(0, 0, 100) },
    uRayDir: { value: new Vector3(0, 0, -1) },
    uMouseVel: { value: new Vector3() },
    uTargetA: { value: shellTex },
    uTargetB: { value: shellTex },
    uRandom: { value: randomTex },
  };
  Object.assign(velVar.material.uniforms, sim);
  posVar.material.uniforms.uDt = sim.uDt;

  const error = gpu.init();
  if (error) {
    renderer.dispose();
    canvas.remove();
    throw new Error(error);
  }

  /* ---------- partikel yang dirender ---------- */
  const geometry = new BufferGeometry();
  const refs = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) {
    refs[i * 2] = ((i % side) + 0.5) / side;
    refs[i * 2 + 1] = (Math.floor(i / side) + 0.5) / side;
  }
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(N * 3), 3));
  geometry.setAttribute("reference", new BufferAttribute(refs, 2));

  const material = new ShaderMaterial({
    vertexShader: pointsVertex,
    fragmentShader: pointsFragment,
    uniforms: {
      uPosition: { value: null },
      uVelocity: { value: null },
      uRandom: { value: randomTex },
      uSize: { value: o.size },
      uPixelRatio: { value: 1 },
      uCamDist: { value: CAM_DIST },
      uDepthRange: { value: 1 },
      uIntro: { value: o.reducedMotion ? 1 : 0 },
      uColor: { value: new Color() },
      uAccent: { value: new Color() },
      uOpacity: { value: o.opacity },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  points.rotation.order = "XYZ";
  scene.add(points);

  /* ---------- warna ---------- */
  const hsl = { h: 0, s: 0, l: 0 };
  function setColors(color, accent) {
    material.uniforms.uColor.value.setStyle(color || "#000");
    material.uniforms.uAccent.value.setStyle(accent || color || "#000");
    // Partikel terang (mode gelap) dijumlahkan sehingga bercahaya; partikel gelap dicampur biasa.
    material.uniforms.uColor.value.getHSL(hsl, SRGBColorSpace);
    const blending = hsl.l > 0.55 ? AdditiveBlending : NormalBlending;
    if (material.blending !== blending) {
      material.blending = blending;
      material.needsUpdate = true;
    }
    if (!running) renderOnce();
  }

  /* ---------- ukuran & penempatan ---------- */
  // Layar sentuh (umumnya HP) dibatasi lebih rendah: titik tetap tajam, GPU jauh lebih ringan.
  const touch = window.matchMedia("(pointer: coarse)").matches;
  let pixelRatio = Math.min(window.devicePixelRatio || 1, o.maxPixelRatio, touch ? 1.6 : Infinity);
  let width = 1;
  let height = 1;
  function layout() {
    width = Math.max(1, container.clientWidth);
    height = Math.max(1, container.clientHeight);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    material.uniforms.uPixelRatio.value = pixelRatio;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const vh = 2 * CAM_DIST * Math.tan((camera.fov * Math.PI) / 360);
    const vw = vh * camera.aspect;
    points.position.set((o.center[0] * vw) / 2, (o.center[1] * vh) / 2, 0);
    const scale = o.fit * Math.min(vh, vw);
    points.scale.setScalar(scale);
    material.uniforms.uDepthRange.value = scale * 1.1;
  }

  /* ---------- kursor ---------- */
  const pointer = { x: 0, y: 0, sx: 0, sy: 0, tx: 0, ty: 0, active: false, moved: -1e9 };
  const ndc = new Vector2();
  const raycaster = new Raycaster();
  const inverse = new Matrix4();
  const hit = new Vector3();
  const prevHit = new Vector3();
  let hasPrevHit = false;

  const onPointerMove = (e) => {
    const r = container.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    pointer.active = inside;
    if (!inside) return;
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    pointer.moved = performance.now();
  };
  const onPointerEnd = (e) => {
    // Jari diangkat, atau mouse keluar dari jendela.
    if (e.type === "pointerup" && e.pointerType === "mouse") return;
    if (e.type === "mouseout" && e.relatedTarget) return;
    pointer.active = false;
  };

  /* ---------- bentuk & morph ---------- */
  const cache = new Map(); // kunci → Promise<{ texture, motion }>
  let destroyed = false;
  let shapes = [];
  let index = -1;
  let current = { motion: { spin: 0, tilt: 0, flow: 0 } };
  let pending = null; // bentuk tujuan yang sedang dimorph
  let queued = null;
  let morphT = 0;
  let hold = 0;

  function loadShape(desc) {
    const key = `${shapeKey(desc)}#${N}`;
    if (!cache.has(key)) {
      cache.set(
        key,
        buildShape(desc, N).then((data) => ({ texture: floatTexture(data), motion: shapeMotion(desc) })),
      );
    }
    return cache.get(key);
  }

  function startMorph(entry, i) {
    pending = { ...entry, index: i };
    sim.uTargetB.value = entry.texture;
    sim.uMorph.value = 0;
    morphT = 0;
    o.onShapeChange?.(i);
  }

  /** Pindah ke bentuk ke-i (indeks dalam daftar `shapes`). */
  async function morphTo(i) {
    if (!shapes.length) return;
    const target = ((i % shapes.length) + shapes.length) % shapes.length;
    const entry = await loadShape(shapes[target]);
    if (destroyed) return;
    if (o.reducedMotion) {
      // Tanpa animasi: langsung tampil di bentuk baru.
      sim.uTargetA.value = sim.uTargetB.value = entry.texture;
      current = { ...entry, index: target };
      index = target;
      gpu.renderTexture(entry.texture, posVar.renderTargets[0]);
      gpu.renderTexture(entry.texture, posVar.renderTargets[1]);
      o.onShapeChange?.(target);
      renderOnce();
      return;
    }
    if (pending) {
      queued = target;
      return;
    }
    index = target;
    startMorph(entry, target);
  }

  function setShapes(list, start = 0) {
    shapes = list?.length ? list : ["sphere"];
    shapes.forEach(loadShape); // siapkan semua bentuk di belakang layar
    index = -1;
    hold = 0;
    morphTo(start);
  }

  /* ---------- loop animasi ---------- */
  let running = false;
  let visible = true;
  let raf = 0;
  let last = 0;
  let time = 0;
  let spin = 0;
  let spinWeight = 0;
  let tilt = 0;
  let flow = 0;
  const stats = { fps: 0, count: N, drawCount: N, quality: 0, shape: -1, morphing: false };
  let perfFrames = 0;
  let perfTime = 0;
  let frameNo = 0;

  function renderOnce() {
    material.uniforms.uPosition.value = gpu.getCurrentRenderTarget(posVar).texture;
    material.uniforms.uVelocity.value = gpu.getCurrentRenderTarget(velVar).texture;
    renderer.render(scene, camera);
  }

  /**
   * Turunkan kualitas sekali-dua kali bila frame terlalu lambat. Bila setelah itu masih
   * di bawah ±40 fps, animasi dihentikan dan pemanggil menampilkan gambar diam (onTooSlow).
   */
  function adapt(dt) {
    frameNo++;
    if (frameNo < 45 || stats.quality >= 3) return;
    perfFrames++;
    perfTime += dt;
    if (perfFrames < 90) return;
    const avg = perfTime / perfFrames;
    stats.fps = Math.round(1 / avg);
    perfFrames = 0;
    perfTime = 0;
    if (stats.quality === 2) {
      if (avg > 1 / 40) {
        stats.quality = 3;
        stop();
        o.onTooSlow?.();
      }
      return;
    }
    if (avg > 1 / 45) {
      stats.quality++;
      const share = stats.quality === 1 ? 0.65 : 0.42;
      stats.drawCount = Math.floor(N * share);
      geometry.setDrawRange(0, stats.drawCount);
      pixelRatio = Math.min(pixelRatio, stats.quality === 1 ? 1.25 : 1);
      layout();
    }
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    time += dt;
    adapt(dt);

    // Intro: partikel memudar masuk sambil terbang dari cangkang luar.
    material.uniforms.uIntro.value = Math.min(1, material.uniforms.uIntro.value + dt / 1.4);

    // Timeline morph.
    if (pending) {
      morphT += dt / o.morphDuration;
      sim.uMorph.value = Math.min(1, morphT);
      if (morphT >= 1) {
        sim.uTargetA.value = pending.texture;
        sim.uMorph.value = 0;
        current = pending;
        pending = null;
        hold = 0;
        if (queued !== null) {
          const q = queued;
          queued = null;
          morphTo(q);
        }
      }
    } else if (o.interval > 0 && shapes.length > 1 && index >= 0) {
      // Tahan bentuk; tunda pergantian selama pengunjung sedang "memainkan" partikel.
      const busy = pointer.active && now - pointer.moved < 1500;
      hold += busy ? 0 : dt * 1000;
      if (hold >= o.interval) {
        hold = 0;
        morphTo(index + 1);
      }
    }
    stats.morphing = !!pending;
    stats.shape = index;

    // Gerak bentuk tujuan (atau bentuk sekarang) diterapkan pelan-pelan.
    const motion = (pending || current).motion;
    spinWeight += (motion.spin - spinWeight) * ease(dt, 1.2);
    tilt += (motion.tilt - tilt) * ease(dt, 1.4);
    flow += (motion.flow - flow) * ease(dt, 1.4);
    spin += dt * o.rotationSpeed * spinWeight;
    if (!motion.spin) spin += (Math.round(spin / TAU) * TAU - spin) * ease(dt, 0.9); // kembali menghadap depan
    sim.uFlow.value = flow;

    // Kursor dihaluskan: posisi untuk gaya (cepat) dan untuk kemiringan objek (lambat, berinersia).
    pointer.sx += (pointer.x - pointer.sx) * ease(dt, 14);
    pointer.sy += (pointer.y - pointer.sy) * ease(dt, 14);
    const tiltTarget = pointer.active ? 1 : 0;
    pointer.tx += (pointer.x * tiltTarget - pointer.tx) * ease(dt, 2.2);
    pointer.ty += (pointer.y * tiltTarget - pointer.ty) * ease(dt, 2.2);

    points.rotation.x = tilt + Math.sin(time * 0.17) * 0.05 - pointer.ty * o.pointerTilt * 0.6;
    points.rotation.y = spin + Math.sin(time * 0.23) * 0.22 + pointer.tx * o.pointerTilt;
    points.updateMatrixWorld();

    // Garis pandang kursor dalam koordinat objek (supaya gaya bekerja di ruang simulasi).
    ndc.set(pointer.sx, pointer.sy);
    raycaster.setFromCamera(ndc, camera);
    inverse.copy(points.matrixWorld).invert();
    sim.uRayOrigin.value.copy(raycaster.ray.origin).applyMatrix4(inverse);
    sim.uRayDir.value.copy(raycaster.ray.direction).transformDirection(inverse);
    hit.copy(sim.uRayDir.value).multiplyScalar(-sim.uRayOrigin.value.dot(sim.uRayDir.value)).add(sim.uRayOrigin.value);
    const mv = sim.uMouseVel.value;
    if (hasPrevHit && pointer.active) {
      prevHit.sub(hit).multiplyScalar(-1 / Math.max(0.5, dt * 60)); // kecepatan per frame
      mv.lerp(prevHit, ease(dt, 10));
      if (mv.length() > 0.08) mv.setLength(0.08);
    } else {
      mv.multiplyScalar(1 - ease(dt, 6));
    }
    prevHit.copy(hit);
    hasPrevHit = true;
    sim.uMouse.value += ((pointer.active ? 1 : 0) - sim.uMouse.value) * ease(dt, 4);

    sim.uTime.value = time;
    sim.uDt.value = dt * 60;
    gpu.compute();
    renderOnce();
  }

  function start() {
    if (running || destroyed || !visible || document.hidden || o.reducedMotion) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  // Berhenti saat tidak terlihat (digulir keluar / tab lain) supaya hemat baterai.
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
    else stop();
  });
  io.observe(container);
  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVisibility);
  const ro = new ResizeObserver(() => {
    layout();
    if (!running) renderOnce();
  });
  ro.observe(container);
  const onContextLost = (e) => {
    e.preventDefault();
    stop();
    o.onContextLost?.();
  };
  canvas.addEventListener("webglcontextlost", onContextLost);

  function listen(on) {
    const method = on ? "addEventListener" : "removeEventListener";
    window[method]("pointermove", onPointerMove, { passive: true });
    window[method]("pointerdown", onPointerMove, { passive: true });
    window[method]("pointerup", onPointerEnd, { passive: true });
    window[method]("pointercancel", onPointerEnd, { passive: true });
    document[method]("mouseout", onPointerEnd);
  }
  if (!o.reducedMotion) listen(true);

  layout();
  setColors(o.color, o.accentColor);
  if (o.reducedMotion) {
    // Versi diam: partikel langsung di bentuk pertama, tanpa noise/kursor/loop.
    sim.uNoise.value = 0;
  }
  setShapes(o.shapes, o.initialShape || 0);
  start();

  return {
    stats,
    /** Khusus pengujian: baca posisi semua partikel dari GPU (lambat, jangan dipanggil per frame). */
    readPositions() {
      const rt = gpu.getCurrentRenderTarget(posVar);
      const isHalf = rt.texture.type === HalfFloatType;
      const out = isHalf ? new Uint16Array(N * 4) : new Float32Array(N * 4);
      renderer.readRenderTargetPixels(rt, 0, 0, side, side, out);
      return out;
    },
    /** Khusus pengujian: titik target bentuk yang sedang tampil. */
    readTargets: () => (pending || current).texture?.image.data,
    /** Khusus pengujian: posisi kursor dalam koordinat objek & kekuatan pengaruhnya. */
    pointerInfo: () => ({ origin: sim.uRayOrigin.value.toArray(), dir: sim.uRayDir.value.toArray(), strength: sim.uMouse.value }),
    morphTo,
    setShapes,
    setColors,
    /** Ubah parameter tanpa membuat ulang (jumlah partikel tidak bisa diubah di sini). */
    setOptions(next) {
      Object.assign(o, next);
      sim.uStiffness.value = o.stiffness;
      sim.uDamping.value = o.damping;
      sim.uMaxForce.value = o.maxForce;
      sim.uNoise.value = o.reducedMotion ? 0 : o.noise;
      sim.uNoiseScale.value = o.noiseScale;
      sim.uNoiseSpeed.value = o.noiseSpeed;
      sim.uBreath.value = o.breath;
      sim.uScatter.value = o.scatter;
      sim.uRadius.value = o.interactionRadius;
      sim.uRepel.value = o.repulsion;
      sim.uAttract.value = o.attraction;
      sim.uStir.value = o.stir;
      material.uniforms.uSize.value = o.size;
      material.uniforms.uOpacity.value = o.opacity;
      layout();
      if (!running) renderOnce();
    },
    destroy() {
      destroyed = true;
      stop();
      io.disconnect();
      ro.disconnect();
      listen(false);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      cache.forEach((p) => p.then((e) => e.texture.dispose()).catch(() => {}));
      cache.clear();
      geometry.dispose();
      material.dispose();
      randomTex.dispose();
      shellTex.dispose();
      gpu.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
