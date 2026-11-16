import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

/** Pembungkus isi halaman menu: masuk dengan animasi geser seperti membuka layanan di aplikasi. */
export function Page({ subtitle, narrow = false, children, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className={cn("mx-auto px-4 pt-20 sm:pt-24", narrow ? "max-w-3xl" : "max-w-6xl", className)}
    >
      {subtitle && <p className="mb-5 text-muted sm:text-lg">{subtitle}</p>}
      {children}
    </motion.div>
  );
}
