import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Film, Loader2, Star, Trash2, UploadCloud, Youtube } from "lucide-react";
import { friendlyError, uploadFile } from "../lib/api";
import { MAX_UPLOAD_MB, mediaTypeOf } from "../lib/media";
import { assetUrl, cn, getYouTubeId, youTubeThumb } from "../lib/utils";
import { Button } from "../components/ui/Button";
import { useToast } from "./feedback-context";

const newKey = () => Math.random().toString(36).slice(2);

function Thumb({ item }) {
  if (item.type === "youtube") {
    return (
      <>
        <img src={youTubeThumb(item.url)} alt="" className="h-full w-full object-cover" />
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white">
          <Youtube className="size-3" /> YouTube
        </span>
      </>
    );
  }
  if (item.type === "video") {
    return (
      <>
        <video src={assetUrl(item.url)} muted preload="metadata" className="h-full w-full bg-black object-cover" />
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
          <Film className="size-3" /> Video
        </span>
      </>
    );
  }
  return <img src={assetUrl(item.url)} alt="" className="h-full w-full object-cover" />;
}

/**
 * Daftar foto & video sebuah project.
 * - Seret file ke kotak atau klik untuk memilih (bisa banyak sekaligus)
 * - Tempel link YouTube
 * - Atur urutan dengan tombol panah atau seret kotak (di komputer)
 * - Media pertama = sampul
 */
export function MediaManager({ media, setMedia, onDiscard, folder = "projects" }) {
  const toast = useToast();
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);
  const [youtube, setYoutube] = useState("");
  const [dragIndex, setDragIndex] = useState(null);

  const uploading = media.some((m) => m.uploading);

  const addFiles = (fileList) => {
    const files = Array.from(fileList || []);
    files.forEach(async (file) => {
      const type = mediaTypeOf(file);
      if (!type) {
        toast(`"${file.name}" bukan foto atau video.`, "error");
        return;
      }
      if (type === "video" && file.size > MAX_UPLOAD_MB * 1024 * 1024) {
        toast(`Video "${file.name}" lebih dari ${MAX_UPLOAD_MB} MB. Upload ke YouTube lalu tempel link-nya.`, "error");
        return;
      }
      const key = newKey();
      const preview = URL.createObjectURL(file);
      setMedia((list) => [...list, { key, type, url: preview, caption: "", uploading: true }]);
      try {
        const url = await uploadFile(file, folder);
        setMedia((list) => list.map((m) => (m.key === key ? { ...m, url, uploading: false } : m)));
      } catch (e) {
        toast(friendlyError(e), "error");
        setMedia((list) => list.filter((m) => m.key !== key));
      } finally {
        URL.revokeObjectURL(preview);
      }
    });
  };

  const addYoutube = () => {
    if (!getYouTubeId(youtube)) {
      toast("Link YouTube tidak dikenali. Contoh: https://youtu.be/abc123xyz00", "error");
      return;
    }
    setMedia((list) => [...list, { key: newKey(), type: "youtube", url: youtube.trim(), caption: "" }]);
    setYoutube("");
  };

  const move = (from, to) => {
    if (to < 0 || to >= media.length || from === to) return;
    setMedia((list) => {
      const next = [...list];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const remove = (item) => {
    setMedia((list) => list.filter((m) => m.key !== item.key));
    onDiscard(item);
  };

  const setCaption = (key, caption) =>
    setMedia((list) => list.map((m) => (m.key === key ? { ...m, caption } : m)));

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          if (dragIndex !== null) return;
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          if (dragIndex !== null) return;
          e.preventDefault();
          setOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-3xl border-2 border-dashed transition",
          over ? "border-brand bg-surface-2" : "border-line bg-surface-2/40",
        )}
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 px-4 py-8 text-center"
        >
          <span className="grid size-14 place-items-center rounded-full bg-brand text-on-brand">
            <UploadCloud className="size-7" />
          </span>
          <span className="font-semibold">Klik atau seret foto/video ke sini</span>
          <span className="text-sm text-muted">
            Bisa pilih banyak sekaligus. Foto otomatis diperkecil. Video maks {MAX_UPLOAD_MB} MB.
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Youtube className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-red-600" />
          <input
            value={youtube}
            onChange={(e) => setYoutube(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addYoutube();
              }
            }}
            placeholder="Atau tempel link video YouTube di sini"
            className="w-full rounded-2xl border border-line bg-surface py-3 pl-12 pr-4 text-[15px] focus:border-brand-2 focus:outline-none focus:ring-4 focus:ring-brand-2/20"
          />
        </div>
        <Button variant="secondary" onClick={addYoutube} disabled={!youtube.trim()}>
          Tambah video
        </Button>
      </div>

      {media.length > 0 && (
        <>
          <p className="text-sm text-muted">
            {uploading ? "Sedang meng-upload… tunggu sampai selesai sebelum menyimpan." : "Media pertama dipakai sebagai sampul. Atur urutan dengan tombol panah."}
          </p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {media.map((item, i) => (
              <li
                key={item.key}
                draggable={!item.uploading}
                onDragStart={() => setDragIndex(i)}
                onDragEnd={() => setDragIndex(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragIndex !== null) move(dragIndex, i);
                  setDragIndex(null);
                }}
                className={cn(
                  "overflow-hidden rounded-2xl border bg-surface transition",
                  i === 0 ? "border-brand ring-2 ring-brand/30" : "border-line",
                  dragIndex === i && "opacity-40",
                )}
              >
                <div className="relative aspect-video bg-surface-2">
                  <Thumb item={item} />
                  {i === 0 && (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-on-brand">
                      <Star className="size-3 fill-current" /> Sampul
                    </span>
                  )}
                  {item.uploading && (
                    <div className="absolute inset-0 grid place-items-center bg-black/45 text-white">
                      <span className="inline-flex items-center gap-2 text-sm font-medium">
                        <Loader2 className="size-5 animate-spin" /> Meng-upload…
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-2">
                  <input
                    value={item.caption || ""}
                    onChange={(e) => setCaption(item.key, e.target.value)}
                    placeholder="Keterangan (opsional)"
                    className="w-full rounded-xl bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-2/40"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex">
                      <IconBtn label="Geser ke kiri" onClick={() => move(i, i - 1)} disabled={i === 0}>
                        <ArrowLeft className="size-4" />
                      </IconBtn>
                      <IconBtn label="Geser ke kanan" onClick={() => move(i, i + 1)} disabled={i === media.length - 1}>
                        <ArrowRight className="size-4" />
                      </IconBtn>
                      <IconBtn label="Jadikan sampul" onClick={() => move(i, 0)} disabled={i === 0}>
                        <Star className="size-4" />
                      </IconBtn>
                    </div>
                    <IconBtn label="Hapus" onClick={() => remove(item)} disabled={item.uploading} danger>
                      <Trash2 className="size-4" />
                    </IconBtn>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function IconBtn({ label, onClick, disabled, danger, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-8 place-items-center rounded-full transition disabled:pointer-events-none disabled:opacity-30",
        danger ? "text-danger hover:bg-danger/10" : "text-muted hover:bg-surface-2 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
