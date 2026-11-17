import { useState } from "react";
import { Check, ChevronRight, Copy } from "lucide-react";
import { reportText } from "../../lib/errors";
import { cn } from "../../lib/utils";

const DEFAULT_LABELS = { details: "Technical details", copy: "Copy", copied: "Copied" };

/** Detail teknis error yang bisa dibuka-tutup & disalin (untuk dikirim ke developer). */
export function ErrorDetails({ error, labels = DEFAULT_LABELS, className }) {
  const [copied, setCopied] = useState(false);
  const report = reportText(error);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard tidak tersedia */
    }
  };

  return (
    <details className={cn("group w-full rounded-xl border border-line text-left", className)}>
      <summary className="flex cursor-pointer list-none items-center gap-1 px-3 py-2 text-sm text-muted [&::-webkit-details-marker]:hidden">
        <ChevronRight className="size-4 transition group-open:rotate-90" />
        {labels.details}
      </summary>
      <div className="border-t border-line p-3">
        <pre className="max-h-60 overflow-auto whitespace-pre-wrap break-all font-mono text-xs leading-relaxed text-ink/80">
          {report}
        </pre>
        <button
          type="button"
          onClick={copy}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-medium hover:bg-line"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? labels.copied : labels.copy}
        </button>
      </div>
    </details>
  );
}
