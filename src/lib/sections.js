/** Urutan menu/halaman website. */
export const SECTION_ORDER = ["projects", "research", "about"];

/** Bagian di halaman About (alamat lama #/experience dll. diarahkan ke sini). */
export const ABOUT_PARTS = ["experience", "skills", "certificates"];

/** Menu yang punya isi (menu kosong disembunyikan). */
export const availableSections = (data) =>
  SECTION_ORDER.filter((id) => {
    if (id === "research") return data.research.length > 0;
    return true;
  });

/** "/id/projects/abc" → "projects" ; "/" → "" */
export const sectionFromPath = (pathname) =>
  pathname.replace(/^\/id(?=\/|$)/, "").split("/").filter(Boolean)[0] || "";
