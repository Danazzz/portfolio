import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, Navigation, Pagination, Zoom } from "swiper/modules";
import { Expand, X } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/zoom";
import { assetUrl, cn, youTubeEmbed } from "../../lib/utils";
import { useLang } from "../../i18n/language";
import { ProjectCover } from "./ProjectCover";

/** Satu media: gambar, video upload, atau video YouTube. */
export function MediaItem({ media, fit = "contain", className, zoom = false }) {
  if (media.type === "youtube") {
    return (
      <iframe
        src={youTubeEmbed(media.url)}
        title={media.caption || "Video"}
        className={cn("h-full w-full", className)}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  if (media.type === "video") {
    return (
      <video
        src={assetUrl(media.url)}
        className={cn("h-full w-full bg-black object-contain", className)}
        controls
        playsInline
        preload="metadata"
      />
    );
  }
  const img = (
    <img
      src={assetUrl(media.url)}
      alt={media.caption || ""}
      loading="lazy"
      className={cn("h-full w-full", fit === "cover" ? "object-cover" : "object-contain", className)}
    />
  );
  return zoom ? <div className="swiper-zoom-container">{img}</div> : img;
}

function Caption({ text }) {
  if (!text) return null;
  return (
    <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pb-8 pt-10 text-sm text-white">
      {text}
    </p>
  );
}

function ExpandButton({ onClick }) {
  const { t } = useLang();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t("media.fullscreen")}
      className="absolute bottom-3 right-3 z-10 grid size-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/65"
    >
      <Expand className="size-4" />
    </button>
  );
}

/** Tampilan layar penuh untuk melihat foto lebih jelas (bisa di-zoom). */
export function Lightbox({ media, index, onClose }) {
  const { t } = useLang();
  useEffect(() => {
    // Fase "capture" + stopPropagation: Esc hanya menutup lightbox, bukan sheet di belakangnya.
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[70] bg-black/95" role="dialog" aria-modal="true" aria-label={t("media.gallery")}>
      <button
        type="button"
        onClick={onClose}
        aria-label={t("common.close")}
        className="absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
      >
        <X className="size-6" />
      </button>
      <Swiper
        modules={[Navigation, Pagination, Keyboard, Zoom]}
        initialSlide={index}
        navigation
        pagination={{ type: "fraction" }}
        keyboard
        zoom
        className="media-swiper h-full w-full text-white"
      >
        {media.map((m) => (
          <SwiperSlide key={m.id || m.url} className="!flex items-center justify-center p-4 sm:p-12">
            <MediaItem media={m} zoom={m.type === "image"} className={m.type === "youtube" ? "aspect-video h-auto max-w-6xl" : ""} />
            {m.caption && <p className="absolute inset-x-0 bottom-12 text-center text-sm text-white/85">{m.caption}</p>}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>,
    document.body,
  );
}

/**
 * Galeri project sesuai mode tampilan yang dipilih di admin:
 *  - carousel : geser kiri/kanan
 *  - grid     : kotak-kotak foto
 *  - single   : satu gambar sampul saja
 */
export function MediaViewer({ media = [], mode = "carousel", title = "", tags = [] }) {
  const { t } = useLang();
  const [lightbox, setLightbox] = useState(null);

  if (!media.length) {
    return (
      <div className="aspect-[16/7]">
        <ProjectCover title={title} tags={tags} size="lg" />
      </div>
    );
  }

  const images = media.filter((m) => m.type === "image");
  const openLightbox = (m) => setLightbox(Math.max(0, images.indexOf(m)));
  const lightboxEl = lightbox !== null && (
    <Lightbox media={images} index={lightbox} onClose={() => setLightbox(null)} />
  );

  if (mode === "grid" && media.length > 1) {
    return (
      <div className="grid grid-cols-2 gap-1.5 bg-surface p-1.5">
        {media.map((m, i) => (
          <div
            key={m.id || m.url}
            className={cn(
              "relative overflow-hidden rounded-2xl bg-espresso",
              i === 0 ? "col-span-2 aspect-video" : "aspect-square",
              media.length % 2 === 0 && i === media.length - 1 && "col-span-2 aspect-video",
            )}
          >
            {m.type === "image" ? (
              <button type="button" className="h-full w-full" onClick={() => openLightbox(m)} aria-label={t("media.view")}>
                <MediaItem media={m} fit="cover" className="transition duration-300 hover:scale-105" />
              </button>
            ) : (
              <MediaItem media={m} />
            )}
          </div>
        ))}
        {lightboxEl}
      </div>
    );
  }

  const list = mode === "single" ? media.slice(0, 1) : media;

  return (
    <div className="relative bg-espresso">
      <Swiper
        modules={[Navigation, Pagination, Keyboard]}
        navigation={list.length > 1}
        pagination={list.length > 1 ? { clickable: true } : false}
        keyboard
        className="media-swiper aspect-video"
      >
        {list.map((m) => (
          <SwiperSlide key={m.id || m.url} className="relative">
            <MediaItem media={m} />
            {m.type === "image" && (
              <>
                <Caption text={m.caption} />
                <ExpandButton onClick={() => openLightbox(m)} />
              </>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
      {lightboxEl}
    </div>
  );
}
