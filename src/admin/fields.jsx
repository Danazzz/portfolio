import { useId, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { Button } from "../components/ui/Button";
import { uploadFile, friendlyError } from "../lib/api";
import { assetUrl, cn } from "../lib/utils";
import { useToast } from "./feedback-context";

const inputCls =
  "w-full rounded-2xl border border-line bg-surface px-4 py-3 text-[15px] text-ink placeholder:text-muted/70 transition focus:border-brand-2 focus:outline-none focus:ring-4 focus:ring-brand-2/20";

/** Bungkus label + petunjuk + error untuk setiap isian. */
export function Field({ label, help, required, error, children, htmlFor }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-semibold">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-sm text-danger">{error}</p>
      ) : (
        help && <p className="text-xs text-muted">{help}</p>
      )}
    </div>
  );
}

export function TextInput({ label, help, required, error, className, ...props }) {
  const id = useId();
  return (
    <Field label={label} help={help} required={required} error={error} htmlFor={id}>
      <input id={id} className={cn(inputCls, className)} {...props} />
    </Field>
  );
}

export function TextArea({ label, help, required, error, rows = 4, ...props }) {
  const id = useId();
  return (
    <Field label={label} help={help} required={required} error={error} htmlFor={id}>
      <textarea id={id} rows={rows} className={cn(inputCls, "resize-y leading-relaxed")} {...props} />
    </Field>
  );
}

/** Saklar on/off besar dengan judul & keterangan. */
export function Toggle({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 text-left transition hover:border-brand-2"
    >
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{label}</span>
        {description && <span className="block text-sm text-muted">{description}</span>}
      </span>
      <span
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors",
          checked ? "bg-brand" : "bg-line",
        )}
      >
        <span
          className={cn(
            "absolute top-1 size-5 rounded-full bg-white shadow transition-all",
            checked ? "left-6" : "left-1",
          )}
        />
      </span>
    </button>
  );
}

/** Isian tag: ketik lalu tekan Enter atau koma. */
export function TagInput({ label, help, value, onChange, suggestions = [] }) {
  const [text, setText] = useState("");
  const id = useId();
  const listId = `${id}-list`;

  const add = (raw) => {
    const tags = raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .filter((t) => !value.some((v) => v.toLowerCase() === t.toLowerCase()));
    if (tags.length) onChange([...value, ...tags]);
    setText("");
  };

  return (
    <Field label={label} help={help} htmlFor={id}>
      <div className={cn(inputCls, "flex flex-wrap items-center gap-1.5 px-2.5 py-2")}>
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-surface-2 py-1 pl-3 pr-1 text-sm font-medium">
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="grid size-5 place-items-center rounded-full hover:bg-line"
              aria-label={`Hapus ${tag}`}
            >
              <X className="size-3.5" />
            </button>
          </span>
        ))}
        <input
          id={id}
          list={listId}
          value={text}
          onChange={(e) => (e.target.value.endsWith(",") ? add(e.target.value) : setText(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(text);
            } else if (e.key === "Backspace" && !text && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={() => text && add(text)}
          placeholder={value.length ? "" : "Contoh: React, lalu tekan Enter"}
          className="min-w-32 flex-1 bg-transparent px-1.5 py-1 focus:outline-none"
        />
        <datalist id={listId}>
          {suggestions.filter((s) => !value.includes(s)).map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>
    </Field>
  );
}

/**
 * Upload satu gambar: klik atau seret file ke kotak.
 * Gambar otomatis diperkecil lalu disimpan ke Supabase Storage.
 */
export function ImageField({ label, help, value, onChange, folder = "uploads", aspect = "aspect-video", accept = "image/*" }) {
  const toast = useToast();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);

  const handle = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/") && accept === "image/*") {
      toast("File harus berupa gambar (JPG, PNG, WebP).", "error");
      return;
    }
    setBusy(true);
    try {
      onChange(await uploadFile(file, folder));
    } catch (e) {
      toast(friendlyError(e), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Field label={label} help={help}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          handle(e.dataTransfer.files[0]);
        }}
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 border-dashed bg-surface-2/50 transition",
          over ? "border-brand bg-surface-2" : "border-line",
          aspect,
        )}
      >
        {value ? (
          <img src={assetUrl(value)} alt="" className="h-full w-full object-contain" />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-1 p-3 text-center text-muted"
          >
            <ImagePlus className="size-8 text-brand-2" />
            <span className="text-sm font-medium text-ink">Klik atau seret gambar ke sini</span>
          </button>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-surface/80">
            <Loader2 className="size-7 animate-spin text-brand" />
          </div>
        )}
      </div>
      {value && (
        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="secondary" icon={ImagePlus} onClick={() => inputRef.current?.click()}>
            Ganti
          </Button>
          <Button size="sm" variant="danger" icon={Trash2} onClick={() => onChange("")}>
            Hapus
          </Button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          handle(e.target.files[0]);
          e.target.value = "";
        }}
      />
    </Field>
  );
}

/** Kartu putih pembungkus kelompok isian. */
export function FormCard({ step, title, description, children, className }) {
  return (
    <section className={cn("space-y-4 rounded-3xl bg-surface p-4 shadow-card sm:p-6", className)}>
      {title && (
        <header className="flex items-start gap-3">
          {step && (
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-on-brand">
              {step}
            </span>
          )}
          <div>
            <h2 className="text-lg font-bold">{title}</h2>
            {description && <p className="text-sm text-muted">{description}</p>}
          </div>
        </header>
      )}
      {children}
    </section>
  );
}
