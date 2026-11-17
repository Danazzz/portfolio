import { Activity, Award, Briefcase, Code2, FolderKanban, MoreHorizontal, UserRound } from "lucide-react";

/** Menu panel admin. `mobile: true` = tampil di bar bawah HP; sisanya ada di "Lainnya". */
export const ADMIN_TABS = [
  { to: "projects", label: "Proyek", icon: FolderKanban, mobile: true },
  { to: "experiences", label: "Pengalaman", icon: Briefcase },
  { to: "skills", label: "Skill", icon: Code2 },
  { to: "certificates", label: "Sertifikat", icon: Award },
  { to: "profile", label: "Profil", icon: UserRound, mobile: true },
  { to: "system", label: "Cek Sistem", icon: Activity, mobile: true },
];

export const MOBILE_TABS = [
  ...ADMIN_TABS.filter((t) => t.mobile),
  { to: "more", label: "Lainnya", icon: MoreHorizontal },
];
