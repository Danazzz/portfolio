import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { ADMIN_TABS } from "./admin-tabs";
import { PageHeader } from "./PageHeader";

/** HP: menu yang tidak muat di bar bawah. */
export function MorePage() {
  return (
    <>
      <PageHeader title="Lainnya" />
      <ul className="divide-y divide-line overflow-hidden rounded-3xl bg-surface shadow-card">
        {ADMIN_TABS.filter((t) => !t.mobile).map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link to={`/admin/${to}`} className="flex items-center gap-3 px-4 py-4 hover:bg-surface-2">
              <Icon className="size-5 text-brand dark:text-cream" />
              <span className="flex-1 font-medium">{label}</span>
              <ChevronRight className="size-5 text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
