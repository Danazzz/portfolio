/** Urutan menu/halaman website. */
export const SECTION_ORDER = ["projects", "research", "about"];

/** Bagian di halaman About (alamat lama #/experience dll. diarahkan ke sini). */
export const ABOUT_PARTS = ["experience", "skills", "certificates"];

/**
 * Menu yang tampil di website. Semua menu selalu tampil — halaman yang belum
 * berisi (mis. Research) menampilkan pesan "belum ada" sendiri.
 * `data` tetap diterima supaya aturan per menu bisa ditambahkan lagi nanti.
 */
// eslint-disable-next-line no-unused-vars
export const availableSections = (data) => SECTION_ORDER;

/** "/id/projects/abc" → "projects" ; "/" → "" */
export const sectionFromPath = (pathname) =>
  pathname.replace(/^\/id(?=\/|$)/, "").split("/").filter(Boolean)[0] || "";
