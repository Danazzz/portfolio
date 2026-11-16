/** Urutan menu/halaman website. */
export const SECTION_ORDER = ["projects", "experience", "skills", "certificates", "about", "contact"];

/** Menu yang punya isi (menu kosong disembunyikan dari beranda). */
export const availableSections = (data) =>
  SECTION_ORDER.filter((id) => {
    if (id === "experience") return data.experiences.length > 0;
    if (id === "skills") return data.skills.length > 0;
    if (id === "certificates") return data.certificates.length > 0;
    if (id === "about") return Boolean(data.profile.about);
    return true;
  });

/** "/id/projects/abc" → "projects" ; "/" → "" */
export const sectionFromPath = (pathname) =>
  pathname.replace(/^\/id(?=\/|$)/, "").split("/").filter(Boolean)[0] || "";
