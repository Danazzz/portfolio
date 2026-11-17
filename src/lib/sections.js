/** Urutan menu/halaman website. */
export const SECTION_ORDER = ["projects", "about", "contact"];

/** Bagian di halaman About (alamat lama #/experience dll. diarahkan ke sini). */
export const ABOUT_PARTS = ["experience", "skills", "certificates"];

const hasContact = (p) => Boolean(p.email || p.whatsapp || p.linkedin_url || p.github_url || p.gitlab_url || p.cv_url);

/** Menu yang punya isi (menu kosong disembunyikan). */
export const availableSections = (data) =>
  SECTION_ORDER.filter((id) => (id === "contact" ? hasContact(data.profile) : true));

/** "/id/projects/abc" → "projects" ; "/" → "" */
export const sectionFromPath = (pathname) =>
  pathname.replace(/^\/id(?=\/|$)/, "").split("/").filter(Boolean)[0] || "";

/** "Dana Wardhiana" → "DW" */
export const monogram = (name) =>
  String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "•";
