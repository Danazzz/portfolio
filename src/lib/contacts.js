import { FileText, Github, Instagram, Linkedin, Mail, MessageCircle } from "lucide-react";
import { assetUrl, whatsappLink } from "./utils";

const prettyUrl = (url) => String(url).replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
const handle = (url) => prettyUrl(url).split("/").filter(Boolean).pop() || prettyUrl(url);

/** Daftar kontak dari profil; WhatsApp paling atas (paling cepat dibalas). */
export function contactLinks(profile, t) {
  const wa = whatsappLink(profile.whatsapp);
  return [
    wa && {
      id: "whatsapp",
      label: "WhatsApp",
      value: profile.whatsapp,
      icon: MessageCircle,
      href: `${wa}?text=${encodeURIComponent(t("contact.waMessage"))}`,
      primary: true,
    },
    profile.email && { id: "email", label: "Email", value: profile.email, icon: Mail, href: `mailto:${profile.email}`, copy: profile.email },
    profile.linkedin_url && { id: "linkedin", label: "LinkedIn", value: handle(profile.linkedin_url), icon: Linkedin, href: profile.linkedin_url },
    profile.github_url && { id: "github", label: "GitHub", value: handle(profile.github_url), icon: Github, href: profile.github_url },
    profile.instagram_url && { id: "instagram", label: "Instagram", value: handle(profile.instagram_url), icon: Instagram, href: profile.instagram_url },
    profile.cv_url && { id: "cv", label: t("contact.cv"), value: "PDF", icon: FileText, href: assetUrl(profile.cv_url) },
  ].filter(Boolean);
}
