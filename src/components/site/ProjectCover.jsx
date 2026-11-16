import { cn } from "../../lib/utils";

/* Variasi gradient dari palet coklat portfolio */
const GRADIENTS = [
  "from-[#7d5a50] via-[#946b5d] to-[#b4846c]",
  "from-[#3b2b26] via-[#5a4038] to-[#7d5a50]",
  "from-[#b4846c] via-[#c99a7f] to-[#e8bf9f]",
  "from-[#5a4038] via-[#7d5a50] to-[#c99a7f]",
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
 * gradient coklat + inisial judul + tag teknologi.
 */
export function ProjectCover({ title, tags = [], size = "md", className }) {
  const gradient = GRADIENTS[hash(title) % GRADIENTS.length];
  return (
    <div
      className={cn("relative h-full w-full overflow-hidden bg-gradient-to-br text-white", gradient, className)}
      aria-hidden="true"
    >
      {/* pola titik halus */}
      <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(rgb(255_255_255/0.5)_1px,transparent_1px)] [background-size:14px_14px]" />
      <div className="absolute -right-8 -top-10 size-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-12 -left-6 size-32 rounded-full bg-[#fcdec0]/15" />
      <div className="relative flex h-full flex-col justify-between p-4">
        <span
          className={cn(
            "font-bold leading-none tracking-tight text-white/90",
            size === "sm" ? "text-2xl" : size === "lg" ? "text-6xl" : "text-5xl",
          )}
        >
          {initials(title)}
        </span>
        {size !== "sm" && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium backdrop-blur">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
