import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../lib/hooks";
import { cn } from "../../lib/utils";

const DEFAULT_LABELS = { light: "Ganti ke mode terang", dark: "Ganti ke mode gelap" };

export function ThemeToggle({ className, labels = DEFAULT_LABELS }) {
  const { dark, toggle } = useTheme();
  const label = dark ? labels.light : labels.dark;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn("grid size-10 place-items-center rounded-full transition", className)}
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}
