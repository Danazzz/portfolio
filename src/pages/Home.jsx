import { Outlet } from "react-router-dom";
import { RefreshCw, WifiOff } from "lucide-react";
import { PortfolioProvider } from "../components/site/PortfolioProvider";
import { TopBar } from "../components/site/TopBar";
import { HeroHeader } from "../components/site/HeroHeader";
import { ServiceGrid } from "../components/site/ServiceGrid";
import { FeaturedBanner } from "../components/site/FeaturedBanner";
import { ProjectsSection } from "../components/site/ProjectsSection";
import { AboutSection } from "../components/site/AboutSection";
import { ExperienceSection } from "../components/site/ExperienceSection";
import { SkillsSection } from "../components/site/SkillsSection";
import { CertificatesSection } from "../components/site/CertificatesSection";
import { ContactSection } from "../components/site/ContactSection";
import { BottomNav } from "../components/site/BottomNav";
import { Skeleton } from "../components/ui/Skeleton";
import { Button } from "../components/ui/Button";
import { usePortfolio } from "../lib/portfolio";

function LoadingView() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="h-64 rounded-b-[2.5rem] bg-gradient-to-br from-[#7d5a50] to-[#b4846c] dark:from-[#3b2b26] dark:to-[#7d5a50]" />
      <div className="mx-auto -mt-16 max-w-6xl space-y-6 px-4">
        <Skeleton className="h-28 rounded-3xl bg-surface shadow-float" />
        <div className="grid grid-cols-4 gap-4 sm:grid-cols-8">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="mx-auto size-14 rounded-full" />
          ))}
        </div>
        <Skeleton className="aspect-[16/8] rounded-3xl md:aspect-[16/5]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-72 rounded-3xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorView({ onRetry }) {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <span className="grid size-16 place-items-center rounded-full bg-surface-2">
          <WifiOff className="size-8 text-brand" />
        </span>
        <h1 className="text-xl font-bold">Couldn&apos;t load the page</h1>
        <p className="max-w-sm text-muted">Please check your internet connection and try again.</p>
        <Button icon={RefreshCw} onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  );
}

function HomeContent() {
  const { status, data, reload } = usePortfolio();

  if (status === "error") return <ErrorView onRetry={reload} />;
  if (!data) return <LoadingView />;

  const { profile, projects, experiences, skills, certificates } = data;
  const sections = [
    profile.about && "about",
    "projects",
    experiences.length && "experience",
    skills.length && "skills",
    certificates.length && "certificates",
    "contact",
  ].filter(Boolean);

  const stats = [
    { label: "Projects", value: projects.length },
    { label: "Experiences", value: experiences.length },
    certificates.length
      ? { label: "Certificates", value: certificates.length }
      : { label: "Skills", value: skills.length },
  ];

  return (
    <>
      <TopBar name={profile.name} sections={sections} />
      <main className="pb-28 md:pb-8">
        <HeroHeader profile={profile} stats={stats} />
        <ServiceGrid
          profile={profile}
          sections={sections}
          counts={{ projects: projects.length, certificates: certificates.length }}
        />
        <FeaturedBanner projects={projects.filter((p) => p.featured)} />
        <ProjectsSection projects={projects} />
        <AboutSection profile={profile} />
        <ExperienceSection experiences={experiences} />
        <SkillsSection skills={skills} />
        <CertificatesSection certificates={certificates} />
        <ContactSection profile={profile} />
      </main>
      <BottomNav sections={sections} />
    </>
  );
}

export default function Home() {
  return (
    <PortfolioProvider>
      <HomeContent />
      <Outlet />
    </PortfolioProvider>
  );
}
