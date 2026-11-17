import { motion } from "framer-motion";
import { EASE } from "../../lib/motion";

/**
 * Muncul saat masuk layar (sekali): naik sedikit + memudar masuk.
 * `delay` untuk efek berurutan (stagger) pada daftar.
 */
export function Reveal({ children, className, delay = 0, y = 24, as = "div", ...rest }) {
  const Comp = motion[as];
  return (
    <Comp
      {...rest}
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </Comp>
  );
}
