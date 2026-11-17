import { useId } from "react";
import { cn } from "../../lib/utils";

/**
 * Logo "Nanas": badan belah ketupat + mahkota tiga daun.
 * Warna mengikuti token tema (coklat); daun bergoyang saat induk ber-class "group" disentuh kursor.
 */
export function NanasLogo({ className, title = "nanas" }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} role="img" aria-label={title}>
      <defs>
        <clipPath id={`body-${id}`}>
          <ellipse cx="16" cy="21.2" rx="8.2" ry="9.6" />
        </clipPath>
      </defs>
      <g className="origin-[16px_12.5px] transition-transform duration-500 ease-out group-hover:animate-[nanas-sway_0.9s_ease-in-out]">
        <path d="M16 12.6C14.2 9 14.3 5.4 16 1.4c1.7 4 1.8 7.6 0 11.2Z" fill="var(--brand-2)" />
        <path d="M15.4 12.8C11.8 11.4 9.2 8.6 8 4.6c3.7 1 6.3 3.8 7.4 8.2Z" fill="var(--brand-2)" opacity=".85" />
        <path d="M16.6 12.8c3.6-1.4 6.2-4.2 7.4-8.2-3.7 1-6.3 3.8-7.4 8.2Z" fill="var(--brand-2)" opacity=".85" />
      </g>
      <ellipse cx="16" cy="21.2" rx="8.2" ry="9.6" fill="var(--brand)" />
      <g clipPath={`url(#body-${id})`} stroke="var(--bg)" strokeWidth="1.1" opacity=".9">
        {[-12, -6, 0, 6, 12, 18].map((o) => (
          <path key={`a${o}`} d={`M${4 + o} 10 L${28 + o} 34`} />
        ))}
        {[-12, -6, 0, 6, 12, 18].map((o) => (
          <path key={`b${o}`} d={`M${28 - o} 10 L${4 - o} 34`} />
        ))}
      </g>
    </svg>
  );
}
