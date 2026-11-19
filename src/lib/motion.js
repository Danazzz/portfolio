/*
 * Sistem gerak website — satu sumber untuk kurva, durasi dan pegas.
 * Prinsipnya: masuk cepat lalu mengendap pelan (expo-out), tidak memantul berlebihan.
 */

/** Expo-out: cepat di awal, mengendap halus. Dipakai hampir semua gerak masuk. */
export const EASE = [0.16, 1, 0.3, 1];

/** Expo-in-out: untuk tirai/klip gambar yang membuka. */
export const EASE_IN_OUT = [0.87, 0, 0.13, 1];

export const DURATION = {
  fast: 0.35, // hover, ikon
  base: 0.9, // blok teks muncul
  slow: 1.15, // judul besar naik dari balik garis
  reveal: 1.4, // gambar membuka
};

/** Jeda antar elemen dalam satu kelompok yang muncul berurutan. */
export const STAGGER = 0.07;

/*
 * Pegas untuk efek kursor:
 *  - magnet : lincah, sedikit mengayun saat dilepas
 *  - tilt   : lebih berat supaya kartu terasa punya massa
 *  - drift  : lambat dengan inersia, untuk lapisan parallax
 */
export const SPRING = {
  magnet: { stiffness: 170, damping: 15, mass: 0.5 },
  tilt: { stiffness: 140, damping: 18, mass: 0.9 },
  drift: { stiffness: 45, damping: 16, mass: 1 },
};

/** Muncul pelan dari bawah — untuk blok yang tampil saat halaman dibuka. */
export const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION.base, delay, ease: EASE },
});
