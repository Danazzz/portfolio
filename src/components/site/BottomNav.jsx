import { Briefcase, Home, LayoutGrid, MessageCircle, UserRound } from "lucide-react";
import { useActiveSection } from "../../lib/hooks";
import { cn, scrollToSection } from "../../lib/utils";

const ITEMS = [
  { id: "top", label: "Home", icon: Home },
  { id: "projects", label: "Projects", icon: LayoutGrid },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "about", label: "About", icon: UserRound },
  { id: "contact", label: "Contact", icon: MessageCircle },
];

/** Menu bawah khusus HP, seperti tab bar aplikasi. */
export function BottomNav({ sections }) {
  const items = ITEMS.filter((item) => item.id === "top" || sections.includes(item.id));
  const active = useActiveSection(items.map((i) => i.id));

  return (
    <nav
      aria-label="Bottom"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pt-2 backdrop-blur-lg md:hidden"
    >
      <ul className="flex justify-around">
        {items.map(({ id, label, icon: Icon }) => {
          const on = active === id;
          return (
            <li key={id} className="flex-1">
              <button
                type="button"
                onClick={() => scrollToSection(id)}
                aria-current={on ? "true" : undefined}
                className={cn(
                  "flex w-full flex-col items-center gap-0.5 text-[11px] font-medium transition",
                  on ? "text-brand dark:text-cream" : "text-muted",
                )}
              >
                <span className={cn("grid h-7 w-12 place-items-center rounded-full transition", on && "bg-surface-2")}>
                  <Icon className="size-5" strokeWidth={on ? 2.4 : 2} />
                </span>
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
