import { ChevronDown, ChevronUp } from "lucide-react";

/** Tombol naik/turun untuk mengatur urutan tampil. */
export function ReorderButtons({ index, total, onMove }) {
  const cls =
    "grid size-8 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-ink disabled:opacity-30 disabled:pointer-events-none";
  return (
    <div className="flex flex-col">
      <button type="button" className={cls} disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label="Pindah ke atas" title="Pindah ke atas">
        <ChevronUp className="size-5" />
      </button>
      <button type="button" className={cls} disabled={index === total - 1} onClick={() => onMove(index, index + 1)} aria-label="Pindah ke bawah" title="Pindah ke bawah">
        <ChevronDown className="size-5" />
      </button>
    </div>
  );
}
