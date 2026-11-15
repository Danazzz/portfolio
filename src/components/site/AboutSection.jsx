import { Section } from "./Section";
import { assetUrl } from "../../lib/utils";

export function AboutSection({ profile }) {
  if (!profile.about) return null;
  return (
    <Section id="about" title="About me">
      <div className="flex flex-col gap-5 rounded-3xl bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:gap-8 sm:p-6">
        {profile.about_image_url && (
          <img
            src={assetUrl(profile.about_image_url)}
            alt={profile.name}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-2xl object-cover sm:aspect-[3/4] sm:w-64"
          />
        )}
        <p className="whitespace-pre-line leading-relaxed text-ink/90 sm:text-lg">{profile.about}</p>
      </div>
    </Section>
  );
}
