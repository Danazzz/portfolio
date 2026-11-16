import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { ArrowRight } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import { cn, mediaThumb } from "../../lib/utils";
import { ProjectCover } from "./ProjectCover";
import { useLang } from "../../i18n/language";

/** Banner promo bergeser otomatis berisi project unggulan. */
export function FeaturedBanner({ projects }) {
  const navigate = useNavigate();
  const { t, tr, to } = useLang();
  if (!projects.length) return null;

  return (
    <section aria-label={t("featured.title")} className="mb-6">
      <h2 className="mb-3 text-lg font-bold tracking-tight sm:text-xl">{t("featured.title")}</h2>
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={12}
        slidesPerView={1.08}
        breakpoints={{ 768: { slidesPerView: projects.length > 1 ? 2 : 1, spaceBetween: 16 } }}
        autoplay={projects.length > 1 ? { delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
        loop={projects.length >= 4}
        pagination={projects.length > 1 ? { clickable: true } : false}
        className="!pb-8"
      >
        {projects.map((project) => {
          const cover = mediaThumb(project.media.find((m) => m.type !== "video"));
          return (
            <SwiperSlide key={project.id}>
              <button
                type="button"
                onClick={() => navigate(to(`/projects/${project.slug}`))}
                className={cn(
                  "group relative block aspect-[16/8] w-full overflow-hidden",
                  projects.length === 1 && "md:aspect-[21/7] lg:aspect-[4/1]",
                  "rounded-3xl bg-gradient-to-br from-[#7d5a50] to-[#b4846c] text-left shadow-card",
                )}
              >
                {cover ? (
                  <img
                    src={cover}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <ProjectCover title={tr(project, "title")} className="absolute inset-0" size="lg" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white sm:p-5">
                  <div className="min-w-0">
                    {project.category && (
                      <span className="mb-1.5 inline-block rounded-full bg-[#fcdec0] px-2.5 py-0.5 text-xs font-semibold text-[#3b2b26]">
                        {project.category}
                      </span>
                    )}
                    <h3 className="truncate text-lg font-bold sm:text-2xl">{tr(project, "title")}</h3>
                    {tr(project, "summary") && <p className="line-clamp-1 text-sm text-white/85">{tr(project, "summary")}</p>}
                  </div>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#3b2b26] transition group-hover:translate-x-1">
                    <ArrowRight className="size-5" />
                  </span>
                </div>
              </button>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
