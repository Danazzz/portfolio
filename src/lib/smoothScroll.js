import Lenis from "lenis";

/**
 * Scroll halus (Lenis) untuk halaman website. Tidak dipakai di panel admin,
 * dan mati jika pengunjung memilih "kurangi gerakan" di perangkatnya.
 */
let lenis = null;
let raf = 0;
let locks = 0;

export function startSmoothScroll() {
  if (lenis || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
  const loop = (time) => {
    lenis?.raf(time);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
}

export function stopSmoothScroll() {
  cancelAnimationFrame(raf);
  lenis?.destroy();
  lenis = null;
  locks = 0;
}

/** Ke paling atas tanpa animasi (dipakai saat pindah halaman). */
export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo(0, 0);
}

/** Gulir halus ke sebuah elemen. */
export function scrollToElement(el, offset = -96) {
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset, duration: 1.1 });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Kunci scroll halaman saat menu/pencarian/panel terbuka.
 * Mengembalikan fungsi untuk membuka kunci (bisa bertumpuk).
 */
export function lockScroll() {
  locks += 1;
  lenis?.stop();
  const prev = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  return () => {
    locks = Math.max(0, locks - 1);
    document.body.style.overflow = prev;
    if (!locks) lenis?.start();
  };
}
