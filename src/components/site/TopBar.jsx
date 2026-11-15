import { Link } from "react-router-dom";
import { ThemeToggle } from "../ui/ThemeToggle";
import { useScrolled } from "../../lib/hooks";
import { cn, scrollToSection } from "../../lib/utils";

const NAV_ITEMS = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "certificates", label: "Certificates" },
  { id: "contact", label: "Contact" },
];

export function TopBar({ name, sections }) {
  const scrolled = useScrolled(40);
  const initial = (name || "D").trim().charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        scrolled ? "border-b border-line bg-surface/85 text-ink backdrop-blur-lg" : "text-white",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link
          to="/"
          onClick={() => scrollToSection("top")}
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span
            className={cn(
              "grid size-9 place-items-center rounded-xl text-lg font-bold transition-colors",
              scrolled ? "bg-brand text-on-brand" : "bg-white/20 text-white",
            )}
          >
            {initial}
          </span>
          <span className="text-lg">{name?.split(" ")[0] || "Portfolio"}</span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_ITEMS.filter((item) => sections.includes(item.id)).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-medium transition",
                scrolled ? "hover:bg-surface-2" : "hover:bg-white/15",
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <ThemeToggle className={cn("ml-auto md:ml-1", scrolled ? "hover:bg-surface-2" : "hover:bg-white/15")} />
      </div>
    </div>
  );
}
