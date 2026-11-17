import { useRef } from "react";
import { motion, useMotionTemplate, useSpring, useTransform } from "framer-motion";
import { useFinePointer } from "../../lib/pointer";
import { SPRINGS } from "../../lib/motion";
import { cn } from "../../lib/utils";

/**
 * Kartu yang miring 3D mengikuti posisi kursor di atasnya (maks `max` derajat),
 * dengan kilau lembut yang mengikuti arah cahaya. Kembali datar saat kursor pergi.
 * Hanya dengan mouse; di layar sentuh kartu tetap datar.
 */
export function TiltCard({ children, className, max = 6, glare = true, as = "div" }) {
  const fine = useFinePointer();
  const ref = useRef(null);
  const px = useSpring(0.5, SPRINGS.tilt);
  const py = useSpring(0.5, SPRINGS.tilt);
  const rotateY = useTransform(px, [0, 1], [-max, max]);
  const rotateX = useTransform(py, [0, 1], [max, -max]);
  const gx = useTransform(px, (v) => `${v * 100}%`);
  const gy = useTransform(py, (v) => `${v * 100}%`);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgb(255 255 255 / 0.22), transparent 55%)`;
  const glareOpacity = useSpring(0, SPRINGS.tilt);
  const Comp = motion[as];

  const onMove = (e) => {
    if (!fine) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
    glareOpacity.set(1);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
    glareOpacity.set(0);
  };

  return (
    <Comp
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={fine ? { rotateX, rotateY, transformPerspective: 900 } : undefined}
      className={cn("relative [transform-style:preserve-3d]", className)}
    >
      {children}
      {glare && fine && (
        <motion.span
          aria-hidden="true"
          style={{ background: glareBg, opacity: glareOpacity }}
          className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-soft-light"
        />
      )}
    </Comp>
  );
}
