import { cn } from "../../lib/utils";

/* Variasi gradient lembut dari palet coklat portfolio */
const GRADIENTS = [
  "from-[#7d5a50] to-[#b4846c]",
  "from-[#3b2b26] to-[#7d5a50]",
  "from-[#b4846c] to-[#e8c4a4]",
  "from-[#5a4038] to-[#b4846c]",
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
 * Sampul otomatis untuk proyek yang belum punya gambar:
 * gradient coklat + motif kisi kulit nanas + inisial judul.
 * (`tags` diterima supaya pemanggil lama tetap jalan, tapi tidak ditampilkan.)
 */
// eslint-disable-next-line no-unused-vars
export function ProjectCover({ title, tags, size = "md", className }) {
  const gradient = GRADIENTS[hash(title) % GRADIENTS.length];
  return (
    <div
      className={cn("relative h-full w-full overflow-hidden bg-gradient-to-br text-white", gradient, className)}
      aria-hidden="true"
    >
      {/* motif kisi kulit nanas */}
      <div className="absolute inset-0 opacity-70 [background-image:repeating-linear-gradient(45deg,rgb(255_255_255/0.09)_0_1px,transparent_1px_26px),repeating-linear-gradient(-45deg,rgb(255_255_255/0.09)_0_1px,transparent_1px_26px)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgb(255_255_255/0.22),transparent_55%)]" />
      <span
        className={cn(
          "absolute bottom-[8%] left-[6%] font-semibold leading-none tracking-[-0.05em] text-white/85",
          size === "sm" ? "text-3xl" : size === "lg" ? "text-[clamp(4rem,12vw,9rem)]" : "text-[clamp(3rem,8vw,5.5rem)]",
        )}
      >
        {initials(title)}
      </span>
    </div>
  );
}
