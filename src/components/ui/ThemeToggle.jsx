import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../lib/hooks";
import { cn } from "../../lib/utils";

export function ThemeToggle({ className }) {
  const { dark, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn("grid size-10 place-items-center rounded-full transition", className)}
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}
