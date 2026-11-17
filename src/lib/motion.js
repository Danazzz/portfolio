/** Muncul pelan dari bawah — dipakai untuk judul & bagian halaman. */
export const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

/** Kurva gerak lembut ala Apple. */
export const EASE = [0.22, 1, 0.36, 1];
