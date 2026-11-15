import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { useMediaQuery } from "../../lib/hooks";

/**
 * Bottom sheet ala aplikasi mobile. Di layar lebar tampil sebagai modal di tengah.
 * Di HP bisa ditutup dengan menarik pegangan ke bawah.
 */
export function Sheet({ open, onClose, onExited, label, closeLabel = "Tutup", size = "md", children, className }) {
  const desktop = useMediaQuery("(min-width: 640px)");
  const drag = useDragControls();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const panel = desktop
    ? { initial: { opacity: 0, scale: 0.96, y: 16 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.96, y: 16 } }
    : { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } };

  return createPortal(
    <AnimatePresence onExitComplete={onExited}>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={label}
        >
          <motion.div
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            {...panel}
            transition={{ type: "spring", damping: 32, stiffness: 340 }}
            drag={desktop ? false : "y"}
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose?.();
            }}
            className={cn(
              "relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-surface shadow-float sm:rounded-[28px]",
              size === "lg" ? "sm:max-w-3xl" : "sm:max-w-lg",
              className,
            )}
          >
            <div
              className="absolute inset-x-0 top-0 z-20 flex touch-none justify-center pb-3 pt-2.5 sm:hidden"
              onPointerDown={(e) => drag.start(e)}
            >
              <span className="h-1.5 w-11 rounded-full bg-white/80 shadow" />
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="absolute right-3 top-3 z-20 grid size-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/60"
            >
              <X className="size-5" />
            </button>
            <div className="overflow-y-auto overscroll-contain">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
