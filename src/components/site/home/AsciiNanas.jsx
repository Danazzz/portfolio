import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "../../../lib/utils";

/*
 * Nanas dari karakter teks (monospace) yang digambar di <canvas>.
 *  - Saat muncul: karakter acak "tersusun" menjadi bentuk nanas.
 *  - Kursor / jari: karakter di sekitarnya beriak (berganti simbol & sedikit terdorong).
 *  - Diam: sesekali satu-dua karakter berkedip & daun bergoyang pelan.
 * Pengunjung yang mematikan animasi melihat gambar diam.
 */

const RIPPLE = "*+x%#&@$";
const NOISE = "!?/\\|<>{}[]=+-*:;.,'~^%$#@&";
const randomChar = () => NOISE[(Math.random() * NOISE.length) | 0];
const smooth = (k) => k * k * (3 - 2 * k);

/** Bentuk nanas → daftar sel { x, y, ch, tone } dalam satuan sel. */
function buildShape(cols, rows) {
  const cells = [];
  const cx = cols / 2;
  // Badan: elips di 60% bawah. Lebar sel ≈ 0.6 tinggi sel, jadi rx dikali 1/0.6.
  const bodyTop = rows * 0.4;
  const by = bodyTop + (rows - bodyTop) * 0.5;
  const ry = (rows - bodyTop) * 0.48;
  const rx = Math.min(cols * 0.42, ry * 0.95 / 0.6);
  // Daun: [sudut (derajat dari vertikal), panjang relatif, lebar relatif]
  const leaves = [
    [0, 1, 0.1],
    [-17, 0.9, 0.095],
    [17, 0.9, 0.095],
    [-36, 0.74, 0.09],
    [36, 0.74, 0.09],
    [-58, 0.5, 0.085],
    [58, 0.5, 0.085],
  ];
  const baseY = bodyTop + 1.2;
  const crownH = bodyTop * 0.95;
  const P = 6; // jarak antar garis kisi sisik

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const dx = (x + 0.5 - cx) * 0.6; // ke satuan tinggi sel
      // --- badan ---
      const nx = (x + 0.5 - cx) / rx;
      const ny = (y + 0.5 - by) / ry;
      const d = nx * nx + ny * ny;
      if (d <= 1) {
        const a = (((x + y * 1.2) % P) + P) % P;
        const b = (((x - y * 1.2) % P) + P) % P;
        let ch = ".";
        let tone = "body";
        if (a < 0.9 && b < 0.9) ch = "x";
        else if (a < 0.9) ch = "/";
        else if (b < 0.9) ch = "\\";
        else if (Math.abs(a - P / 2) < 0.9 && Math.abs(b - P / 2) < 0.9) {
          ch = "o";
          tone = "eye";
        } else ch = d > 0.82 ? ":" : ".";
        if (d > 0.9) tone = "edge";
        cells.push({ x, y, ch, tone });
        continue;
      }
      // --- mahkota ---
      const vy = baseY - (y + 0.5);
      if (vy <= 0 || vy > crownH) continue;
      for (const [deg, len, width] of leaves) {
        const r = (deg * Math.PI) / 180;
        // proyeksi ke sumbu daun
        const along = vy * Math.cos(r) + dx * Math.sin(r);
        const across = dx * Math.cos(r) - vy * Math.sin(r);
        const L = crownH * len;
        if (along < 0 || along > L) continue;
        const t = along / L;
        const w = crownH * width * Math.sin(Math.PI * Math.min(1, t * 1.15 + 0.08)) * (1 - t * 0.55);
        if (Math.abs(across) <= w) {
          const ch = Math.abs(deg) < 10 ? "|" : deg < 0 ? (Math.abs(across) < w * 0.4 ? "\\" : "(") : Math.abs(across) < w * 0.4 ? "/" : ")";
          cells.push({ x, y, ch: t > 0.92 ? "'" : ch, tone: "leaf" });
          break;
        }
      }
    }
  }
  return cells;
}

const readColors = (el) => {
  const css = getComputedStyle(el);
  const v = (name) => css.getPropertyValue(name).trim();
  return { body: v("--brand"), edge: v("--muted"), eye: v("--accent"), leaf: v("--brand-2"), ripple: v("--ink") };
};

export function AsciiNanas({ className }) {
  const reduce = useReducedMotion();
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let cells = [];
    let colors = readColors(wrap);
    let W = 0;
    let H = 0;
    let cw = 0;
    let chH = 0;
    let fontSize = 12;
    let raf = 0;
    let visible = true;
    let start = performance.now();
    const pointer = { x: -9999, y: -9999, active: false, energy: 0 };

    const layout = () => {
      const rect = wrap.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      if (!W || !H) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fontSize = Math.max(9, Math.min(15, Math.round(H / 52)));
      chH = fontSize * 1.1;
      cw = fontSize * 0.62;
      const cols = Math.floor(W / cw);
      const rows = Math.floor(H / chH);
      const offX = (W - cols * cw) / 2;
      const offY = (H - rows * chH) / 2;
      cells = buildShape(cols, rows).map((c, i) => ({
        ...c,
        px: offX + c.x * cw,
        py: offY + c.y * chH,
        // posisi & waktu awal untuk animasi "tersusun"
        sx: (Math.random() - 0.5) * W * 0.6,
        sy: (Math.random() - 0.5) * H * 0.3 + H * 0.15,
        delay: (c.y / rows) * 700 + Math.random() * 350 + (i % 7) * 10,
        flicker: 0,
      }));
      ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      ctx.textBaseline = "top";
    };

    const draw = (now) => {
      ctx.clearRect(0, 0, W, H);
      const t = now - start;
      const R = Math.max(70, Math.min(W, H) * 0.2);
      pointer.energy += ((pointer.active ? 1 : 0) - pointer.energy) * 0.08;

      for (const c of cells) {
        let x = c.px;
        let y = c.py;
        let ch = c.ch;
        let color = colors[c.tone] || colors.body;
        let alpha = 1;

        // 1) muncul: dari posisi acak ke tempatnya
        const p = reduce ? 1 : Math.min(1, Math.max(0, (t - c.delay) / 900));
        if (p < 1) {
          const e = 1 - (1 - p) ** 3;
          x = c.px + c.sx * (1 - e);
          y = c.py + c.sy * (1 - e);
          alpha = e;
          if (p < 0.85) ch = randomChar();
          if (p === 0) continue;
        }

        if (!reduce) {
          // 2) daun bergoyang pelan
          if (c.tone === "leaf") x += Math.sin(t / 900 + c.y * 0.35) * (1.2 + (H * 0.4 - c.py) / H) * 1.4;

          // 3) riak di sekitar kursor
          if (pointer.energy > 0.01) {
            const dx = x + cw / 2 - pointer.x;
            const dy = y + chH / 2 - pointer.y;
            const dist = Math.hypot(dx, dy);
            if (dist < R) {
              const k = smooth(1 - dist / R) * pointer.energy;
              const wave = Math.sin(dist / 9 - t / 90);
              x += (dx / (dist || 1)) * k * 7;
              y += (dy / (dist || 1)) * k * 7;
              if (k > 0.18) {
                ch = RIPPLE[Math.abs(Math.floor(wave * 3 + dist / 14 + t / 120)) % RIPPLE.length];
                color = k > 0.5 ? colors.ripple : colors.eye;
              }
            }
          }

          // 4) kedipan acak saat diam
          if (p >= 1) {
            if (c.flicker > 0) {
              c.flicker -= 1;
              ch = randomChar();
              color = colors.eye;
            } else if (Math.random() < 0.0004) c.flicker = 6;
          }
        }

        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.fillText(ch, x, y);
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now) => {
      raf = 0;
      if (!visible) return;
      draw(now);
      if (!reduce) raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(loop);
    };

    const setPointer = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = clientX - rect.left;
      pointer.y = clientY - rect.top;
      pointer.active = pointer.x > -40 && pointer.y > -40 && pointer.x < W + 40 && pointer.y < H + 40;
    };
    const onPointer = (e) => setPointer(e.clientX, e.clientY);
    const onTouch = (e) => e.touches[0] && setPointer(e.touches[0].clientX, e.touches[0].clientY);
    const onLeave = () => (pointer.active = false);

    layout();
    kick();
    const ro = new ResizeObserver(() => {
      layout();
      if (reduce) draw(performance.now());
    });
    ro.observe(wrap);
    // Hemat baterai: berhenti saat tidak terlihat di layar.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
    });
    io.observe(wrap);
    // Ganti tema → ambil ulang warna.
    const mo = new MutationObserver(() => {
      colors = readColors(wrap);
      if (reduce) draw(performance.now());
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    if (!reduce) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("pointerdown", onPointer, { passive: true });
      window.addEventListener("touchstart", onTouch, { passive: true });
      window.addEventListener("touchmove", onTouch, { passive: true });
      window.addEventListener("touchend", onLeave, { passive: true });
      document.addEventListener("mouseleave", onLeave);
    } else {
      start = -1e6;
      draw(performance.now());
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onLeave);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [reduce]);

  return (
    <div ref={wrapRef} className={cn("relative select-none", className)} aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
