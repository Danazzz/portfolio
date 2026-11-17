import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Magnetic } from "./Magnetic";
import { cn } from "../../lib/utils";

const VARIANTS = {
  solid: "bg-ink text-bg hover:bg-brand",
  outline: "border border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-bg",
};

/**
 * Tombol pil magnetik dengan panah yang bergeser saat disorot.
 * `to` → link internal, `onClick` → tombol biasa.
 */
export function MagneticButton({ to, onClick, children, variant = "solid", arrow = true, className }) {
  const cls = cn(
    "group inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold uppercase tracking-[0.08em] transition-colors duration-300",
    VARIANTS[variant],
    className,
  );
  const content = (
    <>
      <span>{children}</span>
      {arrow && (
        <span className="relative inline-flex size-4 overflow-hidden">
          <ArrowRight className="absolute size-4 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-5" />
          <ArrowRight className="absolute size-4 -translate-x-5 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-0" />
        </span>
      )}
    </>
  );
  return (
    <Magnetic strength={0.3} radius={50} max={10}>
      {to ? (
        <Link to={to} className={cls}>
          {content}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className={cls}>
          {content}
        </button>
      )}
    </Magnetic>
  );
}
