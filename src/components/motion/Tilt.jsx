import { createContext, useContext } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useCanHover } from "../../lib/pointer";
import { SPRING } from "../../lib/motion";
import { cn } from "../../lib/utils";

const TiltContext = createContext(null);

/**
 * Kartu yang miring 3D mengikuti posisi kursor di atasnya, dengan kilau cahaya halus.
 * Lapisan di dalamnya (<TiltLayer>) bergeser dengan kedalaman berbeda → terasa berlapis.
 *  - className      : ukuran/rasio area (pembungkus diam yang menerima kursor)
 *  - innerClassName : bentuk kartu yang miring (sudut bulat, overflow, latar)
 *  - max            : kemiringan maksimum (derajat)
 */
export function Tilt({ children, className, innerClassName, max = 6, glare = true }) {
  const canHover = useCanHover();
  const nx = useMotionValue(0); // -1..1, posisi kursor relatif terhadap kartu
  const ny = useMotionValue(0);
  const lit = useMotionValue(0);
  const sx = useSpring(nx, SPRING.tilt);
  const sy = useSpring(ny, SPRING.tilt);
  const glow = useSpring(lit, SPRING.tilt);

  const rotateY = useTransform(sx, (v) => v * max);
  const rotateX = useTransform(sy, (v) => -v * max);
  const gx = useTransform(sx, [-1, 1], [0, 100]);
  const gy = useTransform(sy, [-1, 1], [0, 100]);
  const sheen = useMotionTemplate`radial-gradient(70% 70% at ${gx}% ${gy}%, rgb(255 255 255 / 0.2), transparent 65%)`;

  const onPointerMove = (e) => {
    if (!canHover || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    nx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    ny.set(((e.clientY - r.top) / r.height) * 2 - 1);
    lit.set(1);
  };
  const onPointerLeave = () => {
    nx.set(0);
    ny.set(0);
    lit.set(0);
  };

  return (
    <div
      onPointerMove={canHover ? onPointerMove : undefined}
      onPointerLeave={canHover ? onPointerLeave : undefined}
      className={cn("[perspective:1400px]", className)}
    >
      <motion.div
        style={canHover ? { rotateX, rotateY } : undefined}
        className={cn("relative isolate h-full w-full [backface-visibility:hidden]", innerClassName)}
      >
        <TiltContext.Provider value={canHover ? { x: sx, y: sy } : null}>{children}</TiltContext.Provider>
        {glare && canHover && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 mix-blend-soft-light"
            style={{ background: sheen, opacity: glow }}
          />
        )}
      </motion.div>
    </div>
  );
}

/** Lapisan di dalam <Tilt> yang bergeser mengikuti kursor sejauh `depth` px (negatif = arah berlawanan). */
export function TiltLayer({ depth = 10, className, children }) {
  const ctx = useContext(TiltContext);
  const fallback = useMotionValue(0);
  const x = useTransform(ctx?.x ?? fallback, (v) => v * depth);
  const y = useTransform(ctx?.y ?? fallback, (v) => v * depth);
  return (
    <motion.div className={className} style={ctx ? { x, y } : undefined}>
      {children}
    </motion.div>
  );
}
