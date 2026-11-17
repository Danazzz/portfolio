import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, GalleryHorizontal, Image as ImageIcon, LayoutGrid, Save } from "lucide-react";
import { friendlyError, listProjects, removeFiles, saveProject } from "../lib/api";
import { cn, mediaThumb } from "../lib/utils";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { BilingualField, FormCard, TagInput, TextInput, Toggle } from "./fields";
import { checkFormat, cleanTranslations, getTr, setTr } from "./form-utils";
import { MediaManager } from "./MediaManager";
import { ProjectCover } from "../components/site/ProjectCover";
import { useConfirm, useToast } from "./feedback-context";

const EMPTY = {
  title: "",
  summary: "",
  description: "",
  category: "",
  role: "",
  year: "",
  tags: [],
  demo_url: "",
  source_url: "",
  display_mode: "carousel",
  featured: false,
  published: true,
  translations: {},
};

const MODES = [
  {
    value: "carousel",
    icon: GalleryHorizontal,
    title: "Geser (carousel)",
    text: "Foto tampil satu per satu, pengunjung menggeser kiri/kanan. Cocok untuk screenshot aplikasi.",
  },
  {
    value: "grid",
    icon: LayoutGrid,
    title: "Galeri kotak",
    text: "Semua foto tampil sekaligus dalam kotak-kotak. Cocok untuk banyak foto.",
  },
  {
    value: "single",
    icon: ImageIcon,
    title: "Satu gambar",
    text: "Hanya sampul (media pertama) yang ditampilkan.",
  },
];

function ModePicker({ value, onChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3" role="radiogroup">
      {MODES.map(({ value: v, icon: Icon, title, text }) => {
        const on = value === v;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(v)}
            className={cn(
              "relative flex flex-col gap-2 rounded-2xl border-2 p-4 text-left transition",
              on ? "border-brand bg-surface-2" : "border-line hover:border-brand-2",
            )}
          >
            {on && (
              <span className="absolute right-3 top-3 grid size-6 place-items-center rounded-full bg-brand text-on-brand">
                <Check className="size-4" strokeWidth={3} />
              </span>
            )}
            <Icon className="size-7 text-brand dark:text-cream" />
            <span className="font-semibold">{title}</span>
            <span className="text-sm text-muted">{text}</span>
          </button>
        );
      })}
    </div>
  );
}

function CardPreview({ form, media }) {
  const cover = mediaThumb(media.find((m) => m.type !== "video" && !m.uploading));
  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <div className="aspect-[16/10] bg-gradient-to-br from-[#b4846c] to-[#7d5a50]">
        {cover ? (
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <ProjectCover title={form.title || "?"} tags={form.tags} />
        )}
      </div>
      <div className="space-y-1 p-3">
        {form.category && <span className="text-xs font-semibold text-brand dark:text-cream">{form.category}</span>}
        <p className="font-semibold leading-snug">{form.title || "Judul proyek"}</p>
        <p className="line-clamp-2 text-sm text-muted">{form.summary || "Ringkasan singkat proyek"}</p>
      </div>
    </div>
  );
}

export function ProjectEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();

  const [all, setAll] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [media, setMedia] = useState([]);
  const [removed, setRemoved] = useState([]);
  const [errors, setErrors] = useState({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listProjects()
      .then((projects) => {
        setAll(projects);
        if (!id) return;
        const project = projects.find((p) => p.id === id);
        if (!project) {
          toast("Proyek tidak ditemukan.", "error");
          navigate("/admin/projects", { replace: true });
          return;
        }
        const { media: items, ...rest } = project;
        setForm({ ...EMPTY, ...rest });
        setMedia(items.map((m) => ({ ...m, key: m.id })));
      })
      .catch((e) => toast(friendlyError(e), "error"));
  }, [id, navigate, toast]);

  // Peringatan saat menutup tab sebelum menyimpan.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const suggestions = useMemo(() => {
    const projects = all || [];
    return {
      categories: [...new Set(projects.map((p) => p.category).filter(Boolean))],
      tags: [...new Set(projects.flatMap((p) => p.tags || []))],
    };
  }, [all]);

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  };
  const setId = (key, value) => {
    setForm((f) => setTr(f, key, value));
    setDirty(true);
  };
  const setMediaDirty = (updater) => {
    setMedia(updater);
    setDirty(true);
  };

  const discardMedia = (item) => {
    if (item.id) setRemoved((list) => [...list, item]);
    else removeFiles([item.url]);
  };

  const leave = async () => {
    if (dirty) {
      const ok = await confirm({
        title: "Batalkan perubahan?",
        message: "Perubahan yang belum disimpan akan hilang.",
        confirmLabel: "Ya, batalkan",
        danger: true,
      });
      if (!ok) return;
      removeFiles(media.filter((m) => !m.id).map((m) => m.url));
    }
    navigate("/admin/projects");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (media.some((m) => m.uploading)) {
      toast("Tunggu sampai semua file selesai di-upload.", "error");
      return;
    }
    const title = form.title.trim();
    const found = Object.fromEntries(
      [
        ["title", title ? null : "Judul proyek wajib diisi."],
        ["year", checkFormat("year", form.year)],
        ["demo_url", checkFormat("url", form.demo_url)],
        ["source_url", checkFormat("url", form.source_url)],
      ].filter(([, msg]) => msg),
    );
    if (Object.keys(found).length) {
      setErrors(found);
      toast("Ada isian yang perlu diperbaiki (lihat tulisan merah).", "error");
      if (found.title) window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const clean = {
        ...form,
        title,
        summary: form.summary.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        role: (form.role || "").trim(),
        year: (form.year || "").trim(),
        demo_url: form.demo_url.trim(),
        source_url: form.source_url.trim(),
        translations: cleanTranslations(form.translations),
      };
      await saveProject(clean, media, removed);
      setDirty(false);
      toast(id ? "Perubahan proyek disimpan." : "Proyek baru ditambahkan!");
      navigate("/admin/projects");
    } catch (err) {
      toast(friendlyError(err), "error");
    } finally {
      setSaving(false);
    }
  };

  if (!all) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    );
  }

  const saveButton = (cls) => (
    <Button type="submit" size="lg" icon={Save} loading={saving} className={cls}>
      {id ? "Simpan perubahan" : "Simpan proyek"}
    </Button>
  );

  return (
    <form onSubmit={submit} noValidate>
      <button
        type="button"
        onClick={leave}
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" /> Semua proyek
      </button>
      <h1 className="mb-5 text-2xl font-bold tracking-tight">{id ? "Ubah proyek" : "Tambah proyek baru"}</h1>

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <FormCard step="1" title="Info proyek">
            <p className="rounded-2xl bg-surface-2 px-4 py-3 text-sm text-muted">
              Website tampil dalam <b className="text-ink">English</b> terlebih dahulu. Isi tab{" "}
              <b className="text-ink">🇮🇩 Indonesia</b> untuk versi Bahasa Indonesia (opsional).
            </p>
            <BilingualField
              label="Judul proyek"
              required
              value={form.title}
              onChange={(v) => set("title", v)}
              valueId={getTr(form, "title")}
              onChangeId={(v) => setId("title", v)}
              error={errors.title}
              placeholder="Contoh: Point of Sale App"
            />
            <BilingualField
              label="Ringkasan singkat"
              value={form.summary}
              onChange={(v) => set("summary", v)}
              valueId={getTr(form, "summary")}
              onChangeId={(v) => setId("summary", v)}
              maxLength={160}
              placeholder="Satu kalimat tentang proyek ini"
              help={`Tampil di kartu proyek. ${form.summary.length}/160 huruf.`}
            />
            <BilingualField
              label="Deskripsi lengkap"
              kind="textarea"
              rows={6}
              value={form.description}
              onChange={(v) => set("description", v)}
              valueId={getTr(form, "description")}
              onChangeId={(v) => setId("description", v)}
              placeholder="Ceritakan masalah yang diselesaikan, fitur utama, dan peran Anda."
              help="Tekan Enter untuk membuat paragraf baru."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Kategori"
                list="category-options"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                placeholder="Contoh: Web App, Mobile"
                help="Dipakai untuk tombol filter di website."
              />
              <datalist id="category-options">
                {suggestions.categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <TagInput
                label="Teknologi yang dipakai"
                value={form.tags}
                onChange={(tags) => set("tags", tags)}
                suggestions={suggestions.tags}
                help="Ketik lalu tekan Enter."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
              <BilingualField
                label="Peran Anda"
                value={form.role || ""}
                onChange={(v) => set("role", v)}
                valueId={getTr(form, "role")}
                onChangeId={(v) => setId("role", v)}
                placeholder="Contoh: Frontend & database"
                help="Opsional. Tampil di tabel Specs pada detail proyek."
              />
              <TextInput
                label="Tahun"
                inputMode="numeric"
                value={form.year || ""}
                onChange={(e) => set("year", e.target.value)}
                placeholder="Contoh: 2024"
                help="Opsional."
                error={errors.year}
              />
            </div>
          </FormCard>

          <FormCard step="2" title="Foto & video" description="Tambahkan screenshot, foto, video, atau link YouTube.">
            <MediaManager media={media} setMedia={setMediaDirty} onDiscard={discardMedia} />
          </FormCard>

          <FormCard step="3" title="Cara menampilkan galeri" description="Pilih tampilan foto saat proyek dibuka.">
            <ModePicker value={form.display_mode} onChange={(v) => set("display_mode", v)} />
          </FormCard>

          <FormCard step="4" title="Link (opsional)">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Link demo / website"
                type="url"
                value={form.demo_url}
                onChange={(e) => set("demo_url", e.target.value)}
                placeholder="https://..."
                error={errors.demo_url}
              />
              <TextInput
                label="Link source code"
                type="url"
                value={form.source_url}
                onChange={(e) => set("source_url", e.target.value)}
                placeholder="https://github.com/..."
                error={errors.source_url}
              />
            </div>
          </FormCard>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-4">
          <FormCard title="Publikasi">
            <Toggle
              checked={form.published}
              onChange={(v) => set("published", v)}
              label="Tampilkan di website"
              description={form.published ? "Pengunjung bisa melihat proyek ini." : "Disembunyikan (draf)."}
            />
            <Toggle
              checked={form.featured}
              onChange={(v) => set("featured", v)}
              label="Jadikan unggulan"
              description="Muncul di banner geser paling atas."
            />
            <div>
              <p className="mb-2 text-sm font-semibold">Pratinjau kartu</p>
              <CardPreview form={form} media={media} />
            </div>
            {saveButton("hidden w-full lg:flex")}
          </FormCard>
        </aside>
      </div>

      <div className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/95 px-4 pt-3 backdrop-blur-lg lg:hidden">
        {saveButton("w-full")}
      </div>
    </form>
  );
}
