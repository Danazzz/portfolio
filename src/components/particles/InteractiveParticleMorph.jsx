import { useEffect, useRef, useState } from "react";
import { buildShape, shapeKey } from "./shapes";
import { cn } from "../../lib/utils";

const DEFAULT_SHAPES = ["sculpture", "sphere", "torus", "wave"];

/** Parameter yang bisa diubah langsung tanpa membuat ulang animasi (lihat DEFAULTS di engine.js). */
const LIVE_PARAMS = [
  "size", "opacity", "interactionRadius", "repulsion", "attraction", "stir", "stiffness", "damping",
  "maxForce", "noise", "noiseScale", "noiseSpeed", "breath", "scatter", "morphDuration",
  "rotationSpeed", "pointerTilt", "interval", "center", "fit", "maxPixelRatio",
];

/** Ubah nilai warna CSS apa pun ("var(--brand)", "currentColor", "#fff") menjadi "rgb(...)". */
function resolveColor(el, value) {
  const probe = document.createElement("span");
  probe.style.color = value || "currentColor";
  probe.style.display = "none";
  el.appendChild(probe);
  const rgb = getComputedStyle(probe).color;
  probe.remove();
  return rgb;
}

/** Hemat data atau RAM ≤ 2 GB → cukup gambar diam (dicek sebelum engine & Three.js diunduh). */
const liteDevice = () => !!navigator.connection?.saveData || (navigator.deviceMemory || 8) <= 2;

function usePrefersReducedMotion() {
  const query = "(prefers-reduced-motion: reduce)";
  const [reduce, setReduce] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setReduce(mql.matches);
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);
  return reduce;
}

/**
 * Cadangan bila WebGL tidak tersedia: bentuk pertama digambar sekali sebagai titik-titik diam
 * di kanvas 2D (tanpa animasi), dengan warna yang sama.
 */
function StaticParticles({ shape, color, center = [0, 0], fit = 0.36 }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    let cancelled = false;
    buildShape(shape, 5000).then((pts) => {
      if (cancelled || !canvas) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      ctx.fillStyle = resolveColor(canvas.parentElement, color);
      const r = fit * Math.min(w, h);
      const cx = w / 2 + (center[0] * w) / 2;
      const cy = h / 2 - (center[1] * h) / 2;
      const a = 0.45; // sedikit diputar supaya terlihat tiga dimensi
      for (let i = 0; i < pts.length; i += 4) {
        const x = pts[i] * Math.cos(a) + pts[i + 2] * Math.sin(a);
        const z = -pts[i] * Math.sin(a) + pts[i + 2] * Math.cos(a);
        ctx.globalAlpha = 0.25 + 0.5 * (z * 0.5 + 0.5);
        ctx.fillRect(cx + x * r, cy - pts[i + 1] * r, 1.6, 1.6);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [shape, color, center, fit]);
  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}

/**
 * Patung partikel 3D interaktif (Three.js + simulasi GPU).
 * Ribuan partikel membentuk objek, bergerak organik terus-menerus, tersibak oleh kursor
 * lalu kembali dengan pegas, dan berubah bentuk dengan menyebar lalu merapat.
 *
 * Kanvas transparan dan tidak menangkap klik/gulir, jadi aman diletakkan di belakang konten.
 *
 * Props utama:
 *  - shapes   : daftar bentuk (lihat shapes.js), mis. ["sculpture", { type: "text", text: "nanas" }]
 *  - shape    : indeks bentuk yang ditampilkan (dikendalikan dari luar). Bila kosong, berganti
 *               otomatis setiap `interval` ms.
 *  - color / accentColor : warna CSS apa pun, termasuk var(--...). Default: warna teks induk.
 *  - count, size, interactionRadius, repulsion, attraction, stiffness, damping, noise,
 *    morphDuration, rotationSpeed, center, fit, … : lihat DEFAULTS di engine.js
 *  - fallback : elemen pengganti bila WebGL tidak tersedia (default: titik-titik diam)
 */
export function InteractiveParticleMorph({
  shapes = DEFAULT_SHAPES,
  shape,
  count = 0,
  color = "currentColor",
  accentColor,
  className,
  fallback,
  onShapeChange,
  ...params
}) {
  const ref = useRef(null);
  const engineRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const reduce = usePrefersReducedMotion();

  // Nilai terbaru disimpan di ref supaya efek pembuatan tidak perlu diulang tiap render.
  const latest = useRef({});
  latest.current = { shapes, shape, color, accentColor, params, onShapeChange };
  const shapesKey = shapes.map(shapeKey).join("|");
  const paramsKey = JSON.stringify(LIVE_PARAMS.map((k) => params[k]));

  // Buat animasi (dibuat ulang hanya bila jumlah partikel / preferensi gerak berubah).
  useEffect(() => {
    const el = ref.current;
    let engine = null;
    let cancelled = false;
    setFailed(false);
    // Hemat data / RAM sangat kecil → gambar diam, Three.js tidak diunduh sama sekali.
    if (liteDevice()) {
      setFailed(true);
      return;
    }
    import("./engine")
      .then(({ createParticleMorph, supportsWebGL }) => {
        if (cancelled) return;
        if (!supportsWebGL()) throw new Error("WebGL2 tidak tersedia");
        const now = latest.current;
        const live = Object.fromEntries(LIVE_PARAMS.filter((k) => now.params[k] !== undefined).map((k) => [k, now.params[k]]));
        engine = createParticleMorph(el, {
          ...live,
          count,
          shapes: now.shapes,
          initialShape: now.shape ?? 0,
          interval: now.shape == null ? (live.interval ?? 7000) : 0,
          reducedMotion: reduce,
          color: resolveColor(el, now.color),
          accentColor: resolveColor(el, now.accentColor || now.color),
          onShapeChange: (i) => latest.current.onShapeChange?.(i),
          onContextLost: () => setFailed(true),
          // Masih lambat setelah kualitas diturunkan → lepas animasi, tampilkan gambar diam.
          onTooSlow: () => {
            if (cancelled) return;
            engine?.destroy();
            engine = null;
            engineRef.current = null;
            setFailed(true);
          },
        });
        engineRef.current = engine;
        if (import.meta.env.DEV) el.__particles = engine; // untuk pengujian
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("[particles] memakai tampilan cadangan:", err);
        setFailed(true);
      });
    return () => {
      cancelled = true;
      engine?.destroy();
      engineRef.current = null;
    };
  }, [count, reduce]);

  // Parameter berubah → terapkan langsung.
  useEffect(() => {
    const { params: p, shape: s } = latest.current;
    const live = Object.fromEntries(LIVE_PARAMS.filter((k) => p[k] !== undefined).map((k) => [k, p[k]]));
    if (s != null) live.interval = 0;
    engineRef.current?.setOptions(live);
  }, [paramsKey]);

  // Daftar bentuk berubah.
  useEffect(() => {
    engineRef.current?.setShapes(latest.current.shapes, latest.current.shape ?? 0);
  }, [shapesKey]);

  // Bentuk dikendalikan dari luar.
  useEffect(() => {
    if (shape != null) engineRef.current?.morphTo(shape);
  }, [shape]);

  // Warna mengikuti tema: hitung ulang saat class/atribut <html> berubah (mode gelap/terang).
  useEffect(() => {
    const el = ref.current;
    const apply = () => {
      const { color: c, accentColor: a } = latest.current;
      engineRef.current?.setColors(resolveColor(el, c), resolveColor(el, a || c));
    };
    apply();
    const mo = new MutationObserver(apply);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
    return () => mo.disconnect();
  }, [color, accentColor]);

  // Kanvas diletakkan absolut di dalam elemen ini; beri "relative" hanya bila pemanggil belum memosisikannya.
  const positioned = /(^|\s)(absolute|fixed|sticky)(\s|$)/.test(className || "");
  return (
    <div ref={ref} aria-hidden="true" className={cn("pointer-events-none overflow-hidden", !positioned && "relative", className)}>
      {failed &&
        (fallback ?? <StaticParticles shape={shapes[0]} color={accentColor || color} center={params.center} fit={params.fit} />)}
    </div>
  );
}
