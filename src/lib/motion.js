/**
 * Token gerak — dipakai di semua animasi supaya "rasa"-nya konsisten.
 *  EASE    : kurva keluar lembut (expo-out-ish) untuk transisi biasa
 *  SPRINGS : pegas untuk interaksi mouse (ada inersia, tidak kaku)
 */
export const EASE = [0.22, 1, 0.36, 1];

export const SPRINGS = {
  /** tombol/elemen magnetik: responsif, sedikit memantul */
  magnetic: { stiffness: 180, damping: 15, mass: 0.4 },
  /** kartu miring 3D: halus, tanpa pantulan berlebih */
  tilt: { stiffness: 140, damping: 18, mass: 0.6 },
  /** lapisan parallax: lambat & berat → terasa ada kedalaman */
  parallax: { stiffness: 60, damping: 20, mass: 1 },
};

/** Muncul pelan dari bawah — dipakai untuk judul & bagian halaman. */
export const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: EASE },
});
