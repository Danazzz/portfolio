import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import pineapple from "../../../assets/hero/pineapple.jpg";
import { TiltCard } from "../../motion/TiltCard";
import { ProjectCover } from "../ProjectCover";
import { EASE } from "../../../lib/motion";
import { cn } from "../../../lib/utils";

/** Isi visual tiap tile — sederhana, satu bahasa visual dengan panel nanas. */
function TileArt({ kind, cover, title }) {
  if (kind === "projects") {
    return cover ? (
      <img src={cover} alt="" className="h-full w-full object-cover" />
    ) : (
      <ProjectCover title={title} size="sm" />
    );
  }
  if (kind === "research") {
    return (
      <div className="relative h-full w-full bg-[#2b201c]">
        <div className="absolute inset-0 opacity-80 [background-image:repeating-linear-gradient(45deg,rgb(240_194_92/0.22)_0_1px,transparent_1px_14px),repeating-linear-gradient(-45deg,rgb(240_194_92/0.22)_0_1px,transparent_1px_14px)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgb(240_194_92/0.35),transparent_60%)]" />
      </div>
    );
  }
  // about: potongan mahkota nanas
  return (
    <div className="h-full w-full bg-[#ece0d1]">
      <img src={pineapple} alt="" className="h-full w-full scale-[1.9] object-cover object-[50%_18%] mix-blend-multiply" />
    </div>
  );
}

/**
 * 3 tile navigasi (seperti thumbnail di zeewrk). Miring 3D mengikuti kursor,
 * gambar membesar pelan saat disorot, label naik sedikit.
 */
export function HomeTiles({ items, className }) {
  return (
    <div className={cn("grid grid-cols-3 gap-2 sm:gap-3", className)}>
      {items.map((item, i) => (
        <motion.div
          key={item.kind}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7 + i * 0.08, ease: EASE }}
        >
          <TiltCard max={8} className="rounded-2xl">
            <Link
              to={item.to}
              className="group relative block aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-black/5 outline-offset-4 sm:aspect-[5/4]"
            >
              <div className="h-full w-full transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.07]">
                <TileArt kind={item.kind} cover={item.cover} title={item.label} />
              </div>
              <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/80 text-[#2b201c] backdrop-blur transition duration-500 group-hover:bg-[#2b201c] group-hover:text-white">
                <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:rotate-45" />
              </span>
              <span className="absolute inset-x-2 bottom-2 rounded-full bg-white/85 px-2 py-1.5 text-center text-[11px] font-medium text-[#2b201c] backdrop-blur-md transition-transform duration-500 group-hover:-translate-y-0.5 sm:text-sm">
                {item.label}
              </span>
            </Link>
          </TiltCard>
        </motion.div>
      ))}
    </div>
  );
}
