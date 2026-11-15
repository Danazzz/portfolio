import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function Section({ id, title, subtitle, action, children, className }) {
  return (
    <section id={id} className={cn("mx-auto max-w-6xl scroll-mt-20 px-4 pt-12 sm:pt-16", className)}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-4 flex items-end justify-between gap-4 sm:mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight sm:text-3xl">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-muted sm:text-base">{subtitle}</p>}
          </div>
          {action}
        </div>
        {children}
      </motion.div>
    </section>
  );
}
