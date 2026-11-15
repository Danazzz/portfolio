import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Award, ExternalLink } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import { Section } from "./Section";
import { Lightbox } from "./MediaViewer";
import { assetUrl } from "../../lib/utils";
import { useLang } from "../../i18n/language";

export function CertificatesSection({ certificates }) {
  const { t, date } = useLang();
  const [open, setOpen] = useState(null);
  if (!certificates.length) return null;

  const images = certificates
    .filter((c) => c.image_url)
    .map((c) => ({ id: c.id, type: "image", url: c.image_url, caption: c.title }));

  return (
    <Section id="certificates" title={t("nav.certificates")} subtitle={t("certificates.subtitle")}>
      <Swiper
        modules={[Navigation]}
        spaceBetween={12}
        slidesPerView={1.15}
        breakpoints={{ 640: { slidesPerView: 2.2 }, 1024: { slidesPerView: 3, spaceBetween: 16 } }}
        navigation
        className="!-mx-4 !px-4 sm:!mx-0 sm:!px-0"
      >
        {certificates.map((cert) => (
          <SwiperSlide key={cert.id} className="!h-auto pb-2">
            <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-surface shadow-card">
              <button
                type="button"
                disabled={!cert.image_url}
                onClick={() => setOpen(images.findIndex((m) => m.id === cert.id))}
                className="grid aspect-[4/3] place-items-center overflow-hidden bg-surface-2"
                aria-label={`View ${cert.title}`}
              >
                {cert.image_url ? (
                  <img src={assetUrl(cert.image_url)} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <Award className="size-12 text-brand-2" />
                )}
              </button>
              <div className="flex flex-1 flex-col gap-1 p-4">
                <h3 className="font-semibold leading-snug">{cert.title}</h3>
                <p className="text-sm text-muted">{[cert.issuer, date(cert.issued_at)].filter(Boolean).join(" · ")}</p>
                {cert.credential_url && (
                  <a
                    href={cert.credential_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-semibold text-brand dark:text-cream"
                  >
                    {t("certificates.view")} <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {open !== null && <Lightbox media={images} index={open} onClose={() => setOpen(null)} />}
    </Section>
  );
}
