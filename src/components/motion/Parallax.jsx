import { motion, useSpring, useTransform } from "framer-motion";
import { pointerX, pointerY, useCanHover, usePointerTracking } from "../../lib/pointer";
import { SPRING } from "../../lib/motion";

/**
 * Lapisan yang bergeser pelan mengikuti posisi kursor di layar, dengan sedikit "telat"
 * (inersia) sehingga terasa punya kedalaman. `depth` = pergeseran maksimum dalam px;
 * nilai negatif bergerak berlawanan arah kursor (terasa lebih jauh di belakang).
 */
export function PointerParallax({ depth = 10, as = "div", className, children }) {
  const canHover = useCanHover();
  usePointerTracking(canHover);
  const x = useSpring(
    useTransform(pointerX, (v) => v * depth),
    SPRING.drift,
  );
  const y = useSpring(
    useTransform(pointerY, (v) => v * depth * 0.6),
    SPRING.drift,
  );
  const Tag = motion[as];
  return (
    <Tag className={className} style={canHover ? { x, y } : undefined}>
      {children}
    </Tag>
  );
}
