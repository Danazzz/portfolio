/*
 * Pembuat bentuk partikel. Setiap bentuk menghasilkan Float32Array berisi `count` titik
 * (x, y, z, 1) yang dinormalisasi ke kira-kira bola berjari-jari 1 di sekitar titik tengah.
 * Dihitung sekali di CPU saat bentuk pertama kali dipakai, lalu diunggah ke GPU sebagai tekstur.
 *
 * Bentuk yang didukung (deskriptor):
 *   "sphere" | "torus" | "wave" | "sculpture" | "lattice"
 *   { type: "text",  text: "nanas", weight?: 600, font?: "Inter Variable" }
 *   { type: "image", src: "/logo.svg", threshold?: 128 }       → sampling piksel (logo)
 *   { type: "model", url: "/model.glb" }                       → sampling permukaan GLTF/GLB
 * Setiap deskriptor objek boleh menambah opsi gerak: { spin, tilt, flow }.
 */

/** PRNG kecil yang bisa diulang (mulberry32) supaya bentuk selalu sama di setiap kunjungan. */
export function random(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TAU = Math.PI * 2;

/** Gerak bawaan tiap bentuk: berputar penuh (spin), kemiringan (tilt), gelombang (flow). */
const MOTION = {
  sphere: { spin: 1, tilt: 0.25, flow: 0 },
  torus: { spin: 1, tilt: 0.3, flow: 0 },
  wave: { spin: 0, tilt: 1.05, flow: 0.11 },
  sculpture: { spin: 1, tilt: 0.15, flow: 0 },
  lattice: { spin: 1, tilt: 0.35, flow: 0 },
  text: { spin: 0, tilt: 0, flow: 0 },
  image: { spin: 0, tilt: 0, flow: 0 },
  model: { spin: 1, tilt: 0.1, flow: 0 },
};

export const shapeType = (desc) => (typeof desc === "string" ? desc : desc?.type) || "sphere";

export function shapeMotion(desc) {
  const base = MOTION[shapeType(desc)] || MOTION.sphere;
  if (typeof desc !== "object") return base;
  return {
    spin: desc.spin ?? base.spin,
    tilt: desc.tilt ?? base.tilt,
    flow: desc.flow ?? base.flow,
  };
}

/** Kunci cache: deskriptor yang sama tidak dihitung ulang. */
export const shapeKey = (desc) => (typeof desc === "string" ? desc : JSON.stringify(desc));

/* ---------- bentuk prosedural ---------- */

function sphere(count, rand) {
  const out = new Float32Array(count * 4);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    // Kisi Fibonacci (rata) + sedikit acak supaya tidak tampak seperti pola mesin.
    const y = 1 - ((i + 0.5) / count) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = i * golden + (rand() - 0.5) * 0.02;
    const shell = 1 - Math.pow(rand(), 4) * 0.14; // kulit tipis dengan sedikit ketebalan
    out.set([Math.cos(th) * r * shell, y * shell, Math.sin(th) * r * shell, 1], i * 4);
  }
  return out;
}

function torus(count, rand) {
  const out = new Float32Array(count * 4);
  const R = 0.72;
  const r = 0.3;
  for (let i = 0; i < count; ) {
    const u = rand() * TAU;
    const v = rand() * TAU;
    // Tolak-sampling supaya kerapatan rata per luas permukaan (sisi luar lebih luas).
    if (rand() > (R + r * Math.cos(v)) / (R + r)) continue;
    const k = r * (1 - Math.pow(rand(), 5) * 0.2);
    const ring = R + k * Math.cos(v);
    // Cincin berdiri (bidang x-y) → saat berputar pada sumbu tegak terlihat seperti koin berbalik.
    out.set([ring * Math.cos(u), ring * Math.sin(u), k * Math.sin(v), 1], i * 4);
    i++;
  }
  return out;
}

/** Bidang datar (x-z) berpola kisi; gelombangnya digerakkan di shader (flow). */
function wave(count, rand) {
  const out = new Float32Array(count * 4);
  const side = Math.ceil(Math.sqrt(count));
  const size = 2.1;
  for (let i = 0; i < count; i++) {
    const gx = (i % side) / (side - 1) - 0.5;
    const gz = Math.floor(i / side) / (side - 1) - 0.5;
    const x = (gx + (rand() - 0.5) * 0.12 / side) * size;
    const z = (gz + (rand() - 0.5) * 0.12 / side) * size;
    const y = 0.12 * Math.sin(x * 2.1 + 0.4) * Math.cos(z * 1.7);
    out.set([x, y, z, 1], i * 4);
  }
  return out;
}

/**
 * Patung organik: bola yang permukaannya bergelombang lembut (lekuk-lekuk seperti patung Arp),
 * dipadatkan di lekukan supaya bentuknya terbaca.
 */
function sculpture(count, rand) {
  const out = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const z = rand() * 2 - 1;
    const a = rand() * TAU;
    const s = Math.sqrt(1 - z * z);
    const x = s * Math.cos(a);
    const y = z;
    const w = s * Math.sin(a);
    const lobes =
      0.2 * Math.sin(2.6 * x + 1.1) * Math.sin(2.2 * y + 0.4) +
      0.16 * Math.cos(3.1 * w - 0.6 * y) +
      0.08 * Math.sin(5.2 * y + 2.0 * x);
    const r = (0.8 + lobes) * (1 - Math.pow(rand(), 5) * 0.12);
    out.set([x * r * 1.05, y * r * 1.12, w * r, 1], i * 4);
  }
  return out;
}

/**
 * Kisi gyroid di dalam bola: permukaan matematis sin x cos y + sin y cos z + sin z cos x = 0.
 * Titik acak "ditarik" ke permukaan dengan beberapa langkah Newton.
 */
function lattice(count, rand) {
  const out = new Float32Array(count * 4);
  const k = 4.2;
  const f = (x, y, z) => Math.sin(x) * Math.cos(y) + Math.sin(y) * Math.cos(z) + Math.sin(z) * Math.cos(x);
  let i = 0;
  let guard = 0;
  while (i < count && guard++ < count * 40) {
    let x = (rand() * 2 - 1) * k;
    let y = (rand() * 2 - 1) * k;
    let z = (rand() * 2 - 1) * k;
    for (let n = 0; n < 4; n++) {
      const v = f(x, y, z);
      const gx = Math.cos(x) * Math.cos(y) - Math.sin(z) * Math.sin(x);
      const gy = -Math.sin(x) * Math.sin(y) + Math.cos(y) * Math.cos(z);
      const gz = -Math.sin(y) * Math.sin(z) + Math.cos(z) * Math.cos(x);
      const g2 = gx * gx + gy * gy + gz * gz || 1;
      x -= (v * gx) / g2;
      y -= (v * gy) / g2;
      z -= (v * gz) / g2;
    }
    const len = Math.hypot(x, y, z) / k;
    if (len > 1 || Math.abs(f(x, y, z)) > 0.02) continue;
    out.set([x / k, y / k, z / k, 1], i * 4);
    i++;
  }
  return out;
}

/* ---------- sampling piksel (teks & logo) ---------- */

/**
 * Ambil titik dari piksel yang terisi di kanvas 2D, lalu beri ketebalan (z) supaya
 * terasa seperti relief 3D saat bergoyang.
 */
function fromPixels(ctx, width, height, count, rand, { threshold = 128, size = 2.3, depth = 0.16 } = {}) {
  const data = ctx.getImageData(0, 0, width, height).data;
  const px = [];
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] > threshold) {
        px.push(x, y);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (!px.length) return null;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const scale = size / Math.max(1, maxX - minX, maxY - minY);
  const out = new Float32Array(count * 4);
  const n = px.length / 2;
  for (let i = 0; i < count; i++) {
    const p = Math.floor(rand() * n) * 2;
    const x = (px[p] + rand() - 0.5 - cx) * scale;
    const y = -(px[p + 1] + rand() - 0.5 - cy) * scale;
    // 65% di permukaan depan/belakang, sisanya mengisi ketebalan.
    const face = rand();
    const z = face < 0.65 ? (face < 0.325 ? -0.5 : 0.5) * depth : (rand() - 0.5) * depth;
    out.set([x, y, z, 1], i * 4);
  }
  return out;
}

async function text(desc, count, rand) {
  const { text = "Hello", weight = 600, font = "Inter Variable" } = desc;
  const family = `${weight} 200px "${font}", system-ui, sans-serif`;
  try {
    await document.fonts?.load(family, text);
  } catch {
    /* font tidak tersedia → pakai font sistem */
  }
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.font = family;
  const w = Math.ceil(ctx.measureText(text).width) + 40;
  canvas.width = Math.min(2048, w);
  canvas.height = 260;
  ctx.font = family;
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000";
  ctx.fillText(text, 20, 130);
  return fromPixels(ctx, canvas.width, canvas.height, count, rand, { size: 2.5, depth: 0.14 });
}

async function image(desc, count, rand) {
  const img = new Image();
  img.decoding = "async";
  img.src = desc.src;
  await img.decode();
  const canvas = document.createElement("canvas");
  const max = 640;
  const ratio = (img.naturalWidth || 1) / (img.naturalHeight || 1);
  canvas.width = Math.round(ratio >= 1 ? max : max * ratio);
  canvas.height = Math.round(ratio >= 1 ? max / ratio : max);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return fromPixels(ctx, canvas.width, canvas.height, count, rand, {
    threshold: desc.threshold ?? 128,
    size: 2.1,
    depth: 0.22,
  });
}

/* ---------- model 3D (GLTF/GLB) ---------- */

async function model(desc, count, rand) {
  // Dimuat hanya bila ada bentuk model, supaya bundel utama tetap ringan.
  const [{ GLTFLoader }, { MeshSurfaceSampler }, { Vector3 }] = await Promise.all([
    import("three/examples/jsm/loaders/GLTFLoader.js"),
    import("three/examples/jsm/math/MeshSurfaceSampler.js"),
    import("three"),
  ]);
  const gltf = await new GLTFLoader().loadAsync(desc.url);
  gltf.scene.updateMatrixWorld(true);
  const samplers = [];
  gltf.scene.traverse((obj) => {
    if (!obj.isMesh || !obj.geometry?.attributes?.position) return;
    const sampler = new MeshSurfaceSampler(obj).setRandomGenerator(rand).build();
    const area = sampler.distribution?.[sampler.distribution.length - 1] || 0;
    if (area > 0) samplers.push({ sampler, area, matrix: obj.matrixWorld });
  });
  if (!samplers.length) return null;
  const total = samplers.reduce((s, m) => s + m.area, 0);
  const out = new Float32Array(count * 4);
  const v = new Vector3();
  for (let i = 0; i < count; i++) {
    let pick = rand() * total;
    let m = samplers[0];
    for (const s of samplers) {
      if ((pick -= s.area) <= 0) {
        m = s;
        break;
      }
    }
    m.sampler.sample(v);
    v.applyMatrix4(m.matrix);
    out.set([v.x, v.y, v.z, 1], i * 4);
  }
  return normalize(out);
}

/** Pusatkan & skalakan supaya muat dalam bola berjari-jari 1. */
function normalize(points) {
  const n = points.length / 4;
  let cx = 0;
  let cy = 0;
  let cz = 0;
  for (let i = 0; i < n; i++) {
    cx += points[i * 4];
    cy += points[i * 4 + 1];
    cz += points[i * 4 + 2];
  }
  cx /= n;
  cy /= n;
  cz /= n;
  let r = 0;
  for (let i = 0; i < n; i++) {
    r = Math.max(r, Math.hypot(points[i * 4] - cx, points[i * 4 + 1] - cy, points[i * 4 + 2] - cz));
  }
  const s = 1 / (r || 1);
  for (let i = 0; i < n; i++) {
    points[i * 4] = (points[i * 4] - cx) * s;
    points[i * 4 + 1] = (points[i * 4 + 1] - cy) * s;
    points[i * 4 + 2] = (points[i * 4 + 2] - cz) * s;
  }
  return points;
}

/** Cangkang lebar tempat partikel datang saat animasi pertama kali tampil. */
export function shell(count, seed = 7) {
  const rand = random(seed);
  const out = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const z = rand() * 2 - 1;
    const a = rand() * TAU;
    const s = Math.sqrt(1 - z * z);
    const r = 3.2 + rand() * 2.8;
    out.set([s * Math.cos(a) * r, z * r, s * Math.sin(a) * r, 1], i * 4);
  }
  return out;
}

const PROCEDURAL = { sphere, torus, wave, sculpture, lattice };

/**
 * Hasilkan titik untuk satu deskriptor bentuk. Selalu mengembalikan Promise;
 * bentuk yang gagal dimuat (gambar/model rusak) jatuh ke bola supaya animasi tetap jalan.
 */
export async function buildShape(desc, count, seed = 1) {
  const type = shapeType(desc);
  const rand = random(seed + type.length * 101);
  try {
    if (PROCEDURAL[type]) return PROCEDURAL[type](count, rand);
    if (type === "text") return (await text(desc, count, rand)) || sphere(count, rand);
    if (type === "image") return (await image(desc, count, rand)) || sphere(count, rand);
    if (type === "model") return (await model(desc, count, rand)) || sphere(count, rand);
  } catch (err) {
    console.warn("[particles] bentuk gagal dimuat, memakai bola:", desc, err);
  }
  return sphere(count, rand);
}
