import { Link } from "react-router-dom";
import { Briefcase, Home, LayoutGrid, MessageCircle, UserRound } from "lucide-react";
import { cn } from "../../lib/utils";
import { useLang } from "../../i18n/language";

const ITEMS = [
  { id: "", key: "nav.home", icon: Home },
  { id: "projects", key: "nav.projects", icon: LayoutGrid },
  { id: "experience", key: "nav.experience", icon: Briefcase },
  { id: "about", key: "nav.about", icon: UserRound },
  { id: "contact", key: "nav.contact", icon: MessageCircle },
];

/** Menu bawah untuk HP & tablet, seperti tab bar aplikasi. */
export function BottomNav({ sections, active }) {
  const { t, to } = useLang();
  const items = ITEMS.filter((item) => item.id === "" || sections.includes(item.id));

  return (
    <nav
      aria-label="Bottom"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pt-2 backdrop-blur-lg lg:hidden"
    >
      <ul className="mx-auto flex max-w-xl justify-around">
        {items.map(({ id, key, icon: Icon }) => {
          const on = active === id;
          return (
            <li key={key} className="flex-1">
              <Link
                to={to(`/${id}`)}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "flex w-full flex-col items-center gap-0.5 text-[11px] font-medium transition",
                  on ? "text-brand dark:text-cream" : "text-muted",
                )}
              >
                <span className={cn("grid h-7 w-12 place-items-center rounded-full transition", on && "bg-surface-2")}>
                  <Icon className="size-5" strokeWidth={on ? 2.4 : 2} />
                </span>
                {t(key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
