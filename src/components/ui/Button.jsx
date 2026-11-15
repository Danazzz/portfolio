import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

const VARIANTS = {
  primary: "bg-brand text-on-brand hover:brightness-110 shadow-sm",
  secondary: "bg-surface-2 text-ink hover:bg-line",
  outline: "border border-line bg-surface text-ink hover:bg-surface-2",
  ghost: "text-ink hover:bg-surface-2",
  danger: "bg-danger/10 text-danger hover:bg-danger/20",
  light: "bg-white text-espresso hover:bg-cream",
};

const SIZES = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-[15px] gap-2",
  lg: "h-13 px-6 text-base gap-2",
  icon: "size-10 justify-center",
};

/**
 * Tombol serbaguna. Jika diberi `href`, otomatis menjadi link
 * (link luar dibuka di tab baru).
 */
export function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  loading = false,
  className,
  children,
  href,
  ...props
}) {
  const classes = cn(
    "inline-flex shrink-0 items-center justify-center rounded-full font-medium transition active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
  const content = (
    <>
      {loading ? (
        <Loader2 className="size-[1.1em] animate-spin" />
      ) : (
        Icon && <Icon className="size-[1.1em]" strokeWidth={2.2} />
      )}
      {children}
    </>
  );

  if (href) {
    const external = /^(https?:|mailto:|tel:)/.test(href);
    return (
      <a
        href={href}
        className={classes}
        {...(external && !href.startsWith("mailto:") ? { target: "_blank", rel: "noreferrer" } : {})}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={classes} disabled={loading || props.disabled} {...props}>
      {content}
    </button>
  );
}
