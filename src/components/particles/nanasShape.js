/*
 * Logo nanas (sama dengan NanasLogo.jsx) sebagai gambar untuk sampling partikel.
 * Garis kisi pada badan dibuat berlubang (mask), jadi pola belah ketupatnya tetap terbaca
 * saat logo tersusun dari titik-titik.
 */
const lines = [-12, -6, 0, 6, 12, 18]
  .flatMap((o) => [`M${4 + o} 10 L${28 + o} 34`, `M${28 - o} 10 L${4 - o} 34`])
  .map((d) => `<path d="${d}"/>`)
  .join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="640" height="640">
<defs><mask id="m"><rect width="32" height="32" fill="#fff"/><g stroke="#000" stroke-width="1.15">${lines}</g></mask></defs>
<path d="M16 12.6C14.2 9 14.3 5.4 16 1.4c1.7 4 1.8 7.6 0 11.2Z"/>
<path d="M15.4 12.8C11.8 11.4 9.2 8.6 8 4.6c3.7 1 6.3 3.8 7.4 8.2Z"/>
<path d="M16.6 12.8c3.6-1.4 6.2-4.2 7.4-8.2-3.7 1-6.3 3.8-7.4 8.2Z"/>
<ellipse cx="16" cy="21.2" rx="8.2" ry="9.6" mask="url(#m)"/>
</svg>`;

/** Deskriptor bentuk siap pakai untuk <InteractiveParticleMorph shapes={[NANAS_LOGO, ...]} />. */
export const NANAS_LOGO = { type: "image", src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` };
