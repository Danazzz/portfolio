import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "../../../lib/utils";

/*
 * Panel abstrak di balik "kaca bergaris" (fluted glass).
 *  - Lapisan belakang: komposisi bentuk lembut (lingkaran, lengkung, pita) yang bergerak pelan.
 *  - Lapisan depan: bilah-bilah kaca vertikal; tiap bilah memperbesar & menggeser gambar di belakangnya.
 *  - Kursor / jari: bilah di dekatnya membias lebih kuat (gambar bergeser & membesar).
 * Semua digambar di <canvas> 2D tanpa library. Mati (gambar diam) bila pengunjung mengurangi gerakan.
 */

const SLATS_DESKTOP = 14;
const SLATS_MOBILE = 9;

const readPalette = (el) => {
  const css = getComputedStyle(el);
  const v = (n) => css.getPropertyValue(n).trim();
  const dark = document.documentElement.classList.contains("dark");
  return dark
    ? { bg1: "#241b17", bg2: "#14100e", sun: "#b4846c", arch: "#fcdec0", blob: "#7d5a50", band: "#3b2b26", dot: v("--accent") }
    : { bg1: "#f3e6d8", bg2: "#e7d5c3", sun: "#c99a7f", arch: "#3b2b26", blob: "#7d5a50", band: "#fcdec0", dot: v("--accent") };
};

/** Warna yang sama tapi transparan — gradien memudar tanpa "cincin abu-abu". */
const clear = (hex) => (/^#[0-9a-f]{6}$/i.test(hex) ? `${hex}00` : "rgba(255,255,255,0)");

/** Gambar komposisi abstrak ke kanvas belakang. t = detik. */
function drawScene(ctx, W, H, p, t) {
  const m = Math.min(W, H);
  const g = ctx.createLinearGradient(0, 0, W * 0.4, H);
  g.addColorStop(0, p.bg1);
  g.addColorStop(1, p.bg2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // pita diagonal lembut
  ctx.save();
  ctx.translate(W * 0.5, H * 0.55);
  ctx.rotate(-0.5 + Math.sin(t * 0.15) * 0.05);
  const band = ctx.createLinearGradient(0, -m * 0.12, 0, m * 0.12);
  band.addColorStop(0, clear(p.band));
  band.addColorStop(0.5, p.band);
  band.addColorStop(1, clear(p.band));
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = band;
  ctx.fillRect(-W, -m * 0.12, W * 2, m * 0.24);
  ctx.restore();

  // "matahari": lingkaran besar dengan tepi lembut
  const sx = W * 0.62 + Math.sin(t * 0.21) * m * 0.04;
  const sy = H * 0.32 + Math.cos(t * 0.17) * m * 0.03;
  const sr = m * 0.3;
  const sun = ctx.createRadialGradient(sx, sy, sr * 0.55, sx, sy, sr);
  sun.addColorStop(0, p.sun);
  sun.addColorStop(1, clear(p.sun));
  ctx.globalAlpha = 1;
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(sx, sy, sr, 0, Math.PI * 2);
  ctx.fill();

  // lengkung (arch) gelap dari bawah
  const ax = W * 0.3 + Math.sin(t * 0.12 + 1) * m * 0.03;
  const aw = m * 0.42;
  const top = H * 0.48 + Math.sin(t * 0.19) * m * 0.02;
  ctx.fillStyle = p.arch;
  ctx.beginPath();
  ctx.moveTo(ax - aw / 2, H + 2);
  ctx.lineTo(ax - aw / 2, top + aw / 2);
  ctx.arc(ax, top + aw / 2, aw / 2, Math.PI, 0);
  ctx.lineTo(ax + aw / 2, H + 2);
  ctx.closePath();
  ctx.fill();

  // gumpalan terakota
  const bx = W * 0.78 + Math.cos(t * 0.23) * m * 0.05;
  const by = H * 0.8 + Math.sin(t * 0.2) * m * 0.03;
  const blob = ctx.createRadialGradient(bx, by, 0, bx, by, m * 0.26);
  blob.addColorStop(0, p.blob);
  blob.addColorStop(0.6, p.blob);
  blob.addColorStop(1, clear(p.blob));
  ctx.fillStyle = blob;
  ctx.beginPath();
  ctx.ellipse(bx, by, m * 0.26, m * 0.2, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // titik kecil aksen
  ctx.fillStyle = p.dot;
  ctx.beginPath();
  ctx.arc(W * 0.2 + Math.sin(t * 0.3) * 6, H * 0.22, m * 0.022, 0, Math.PI * 2);
  ctx.fill();
}

function makeGrain() {
  const c = document.createElement("canvas");
  c.width = c.height = 140;
  const x = c.getContext("2d");
  const img = x.createImageData(140, 140);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = n;
    img.data[i + 3] = 22;
  }
  x.putImageData(img, 0, 0);
  return c;
}

export function FlutedGlass({ className }) {
  const reduce = useReducedMotion();
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const scene = document.createElement("canvas");
    const sctx = scene.getContext("2d");
    const grain = makeGrain();
    let palette = readPalette(wrap);
    let W = 0;
    let H = 0;
    let dpr = 1;
    let raf = 0;
    let visible = true;
    const start = performance.now();
    // posisi kursor (relatif panel) & kekuatannya, dihaluskan tiap frame
    const target = { x: 0.5, active: 0 };
    const pointer = { x: 0.5, active: 0 };

    const layout = () => {
      const r = wrap.getBoundingClientRect();
      W = r.width;
      H = r.height;
      if (!W || !H) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (const c of [canvas, scene]) {
        c.width = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
      }
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = (now) => {
      if (!W || !H) return;
      const t = reduce ? 4 : (now - start) / 1000;
      drawScene(sctx, W, H, palette, t);

      pointer.x += (target.x - pointer.x) * 0.09;
      pointer.active += (target.active - pointer.active) * 0.06;

      const n = W < 520 ? SLATS_MOBILE : SLATS_DESKTOP;
      const sw = W / n;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < n; i++) {
        const x = i * sw;
        const center = (x + sw / 2) / W;
        const d = center - pointer.x;
        const k = Math.exp(-(d * d) / 0.03) * pointer.active; // pengaruh kursor 0..1
        const idle = reduce ? 0 : Math.sin(i * 0.9 + t * 0.6) * 0.6;
        // tiap bilah "melihat" bagian lebih sempit dari gambar (= diperbesar) dan sedikit bergeser
        const zoom = 0.66 - k * 0.3;
        const srcW = sw * zoom;
        const shift = idle * sw * 0.3 - Math.sign(d || 1) * k * sw * 1.6;
        const srcX = Math.max(0, Math.min(W - srcW, x + (sw - srcW) / 2 + shift));
        ctx.drawImage(scene, srcX * dpr, 0, srcW * dpr, H * dpr, x, 0, sw + 0.5, H);

        // kilau kaca: terang di tepi kiri, bayangan di tepi kanan
        const glass = ctx.createLinearGradient(x, 0, x + sw, 0);
        glass.addColorStop(0, `rgba(255,255,255,${0.22 + k * 0.12})`);
        glass.addColorStop(0.18, "rgba(255,255,255,0.04)");
        glass.addColorStop(0.7, "rgba(0,0,0,0)");
        glass.addColorStop(1, `rgba(0,0,0,${0.16 + k * 0.08})`);
        ctx.fillStyle = glass;
        ctx.fillRect(x, 0, sw + 0.5, H);
      }

      // butiran halus supaya terasa seperti cetakan, bukan render digital
      ctx.globalAlpha = 1;
      ctx.fillStyle = ctx.createPattern(grain, "repeat");
      ctx.fillRect(0, 0, W, H);
    };

    const loop = (now) => {
      raf = 0;
      if (!visible) return;
      render(now);
      if (!reduce) raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(loop);
    };

    const setFrom = (clientX, clientY) => {
      const r = canvas.getBoundingClientRect();
      const inside = clientX >= r.left - 60 && clientX <= r.right + 60 && clientY >= r.top - 60 && clientY <= r.bottom + 60;
      target.x = (clientX - r.left) / r.width;
      target.active = inside ? 1 : 0;
    };
    const onPointer = (e) => setFrom(e.clientX, e.clientY);
    const onTouch = (e) => e.touches[0] && setFrom(e.touches[0].clientX, e.touches[0].clientY);
    const onLeave = () => (target.active = 0);

    layout();
    if (reduce) render(performance.now());
    else kick();

    const ro = new ResizeObserver(() => {
      layout();
      render(performance.now());
    });
    ro.observe(wrap);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
    });
    io.observe(wrap);
    const mo = new MutationObserver(() => {
      palette = readPalette(wrap);
      render(performance.now());
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    if (!reduce) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("touchstart", onTouch, { passive: true });
      window.addEventListener("touchmove", onTouch, { passive: true });
      window.addEventListener("touchend", onLeave, { passive: true });
      document.addEventListener("mouseleave", onLeave);
    }
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onLeave);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [reduce]);

  return (
    <div ref={wrapRef} className={cn("relative overflow-hidden rounded-[2rem] bg-surface-2", className)} aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
