/** Urutan menu/halaman website. */
export const SECTION_ORDER = ["projects", "research", "about", "contact"];

/** Bagian di halaman About (alamat lama #/experience dll. diarahkan ke sini). */
export const ABOUT_PARTS = ["experience", "skills", "certificates"];

const hasContact = (p) => Boolean(p.email || p.whatsapp || p.linkedin_url || p.github_url || p.gitlab_url || p.cv_url);

/** Menu yang punya isi (menu kosong disembunyikan). */
export const availableSections = (data) =>
  SECTION_ORDER.filter((id) => {
    if (id === "contact") return hasContact(data.profile);
    if (id === "research") return data.research.length > 0;
    return true;
  });

/** "/id/projects/abc" → "projects" ; "/" → "" */
export const sectionFromPath = (pathname) =>
  pathname.replace(/^\/id(?=\/|$)/, "").split("/").filter(Boolean)[0] || "";
