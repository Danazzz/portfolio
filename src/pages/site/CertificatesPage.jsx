import { useState } from "react";
import { Award, ExternalLink } from "lucide-react";
import { Page } from "../../components/site/Page";
import { Lightbox } from "../../components/site/MediaViewer";
import { usePortfolio } from "../../lib/portfolio";
import { assetUrl } from "../../lib/utils";
import { useLang } from "../../i18n/language";

export default function CertificatesPage() {
  const { data } = usePortfolio();
  const { t, date } = useLang();
  const [open, setOpen] = useState(null);
  const { certificates } = data;

  const images = certificates
    .filter((c) => c.image_url)
    .map((c) => ({ id: c.id, type: "image", url: c.image_url, caption: c.title }));

  if (!certificates.length) {
    return (
      <Page>
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-line py-12 text-muted">
          <Award className="size-10" />
          <p>{t("certificates.empty")}</p>
        </div>
      </Page>
    );
  }

  return (
    <Page subtitle={t("certificates.subtitle")}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.map((cert) => (
          <li key={cert.id} className="flex flex-col overflow-hidden rounded-3xl bg-surface shadow-card">
            {cert.image_url && (
              <button
                type="button"
                onClick={() => setOpen(images.findIndex((m) => m.id === cert.id))}
                className="aspect-[4/3] overflow-hidden bg-surface-2"
                aria-label={`${t("media.view")}: ${cert.title}`}
              >
                <img
                  src={assetUrl(cert.image_url)}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                />
              </button>
            )}
            <div className="flex flex-1 gap-3 p-4">
              {!cert.image_url && (
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-surface-2 text-brand-2">
                  <Award className="size-6" />
                </span>
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h2 className="font-semibold leading-snug">{cert.title}</h2>
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
          </li>
        ))}
      </ul>
      {open !== null && <Lightbox media={images} index={open} onClose={() => setOpen(null)} />}
    </Page>
  );
}
