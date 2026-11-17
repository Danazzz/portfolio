import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";

const SPRING = { stiffness: 220, damping: 16, mass: 0.5 };

/**
 * Baris menu besar. Lingkaran panah "magnetik": saat kursor berada di baris,
 * lingkaran tertarik ke arah kursor (maks ±22px), lalu kembali saat kursor pergi.
 */
export function MenuRow({ to, label, className }) {
  const circle = useRef(null);
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);

  const onMove = (e) => {
    if (e.pointerType !== "mouse" || !circle.current) return;
    const r = circle.current.getBoundingClientRect();
    const clamp = (v) => Math.max(-22, Math.min(22, v));
    x.set(clamp((e.clientX - (r.left + r.width / 2)) * 0.18));
    y.set(clamp((e.clientY - (r.top + r.height / 2)) * 0.35));
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Link
      to={to}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={cn(
        "group -mx-3 flex items-center justify-between rounded-2xl px-3 py-3.5 transition-colors duration-300 hover:bg-surface-2/70 sm:py-[min(1rem,1.8vh)]",
        className,
      )}
    >
      <span className="text-[clamp(1.75rem,min(4.2vw,5vh),2.75rem)] font-medium tracking-[-0.03em] transition-transform duration-500 ease-out group-hover:translate-x-2">
        {label}
      </span>
      <motion.span
        ref={circle}
        style={{ x, y }}
        className="grid size-11 place-items-center rounded-full border border-line text-muted transition-colors duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-bg sm:size-12"
      >
        <ArrowRight className="size-5" strokeWidth={1.8} />
      </motion.span>
    </Link>
  );
}
