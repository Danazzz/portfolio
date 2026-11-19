import { TiltLayer } from "../motion/Tilt";
import { cn } from "../../lib/utils";

/* Bidang warna polos dari palet coklat portfolio, dengan warna huruf yang kontras. */
const TONES = [
  { bg: "#3b2b26", fg: "#e9c9aa" },
  { bg: "#7d5a50", fg: "#fcdec0" },
  { bg: "#b4846c", fg: "#3b2b26" },
  { bg: "#ead6c1", fg: "#7d5a50" },
];

const hash = (text) => [...String(text)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

const initials = (title) =>
  String(title || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

/**
 * Sampul otomatis untuk proyek yang belum punya gambar, bergaya sampul buku:
 * bidang warna polos, label kecil di kiri atas, dan inisial raksasa yang terpotong tepi bawah.
 * Di dalam kartu miring (<Tilt>), inisialnya bergeser sebagai lapisan tersendiri.
 * (`tags` & `size` diterima supaya pemanggil lama tetap jalan.)
 */
// eslint-disable-next-line no-unused-vars
export function ProjectCover({ title, label, tags, size, className }) {
  const tone = TONES[hash(title) % TONES.length];
  return (
    <div
      className={cn("@container relative h-full w-full overflow-hidden", className)}
      style={{ backgroundColor: tone.bg, color: tone.fg }}
      aria-hidden="true"
    >
      {label && (
        <span className="absolute left-[5%] top-[7%] text-[clamp(0.625rem,1.5cqw,0.8125rem)] font-medium uppercase tracking-[0.16em] opacity-75">
          {label}
        </span>
      )}
      <TiltLayer depth={-16} className="absolute inset-x-0 bottom-0">
        <span className="block translate-y-[17%] pl-[3.5%] text-[40cqw] font-[420] leading-[0.78] tracking-[-0.065em] opacity-95">
          {initials(title)}
        </span>
      </TiltLayer>
    </div>
  );
}
