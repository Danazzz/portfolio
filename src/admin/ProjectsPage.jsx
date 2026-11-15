import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, FolderPlus, Images, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { deleteProject, friendlyError, listProjects, saveOrder, saveRow } from "../lib/api";
import { cn, mediaThumb } from "../lib/utils";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { PageHeader } from "./PageHeader";
import { ReorderButtons } from "./ReorderButtons";
import { useConfirm, useToast } from "./feedback-context";

export function ProjectsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const [projects, setProjects] = useState(null);

  const load = useCallback(async () => {
    try {
      setProjects(await listProjects());
    } catch (e) {
      toast(friendlyError(e), "error");
      setProjects([]);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const togglePublished = async (project) => {
    try {
      await saveRow("projects", { id: project.id, published: !project.published });
      toast(project.published ? "Proyek disembunyikan dari website." : "Proyek ditampilkan di website.");
      load();
    } catch (e) {
      toast(friendlyError(e), "error");
    }
  };

  const remove = async (project) => {
    const ok = await confirm({
      title: "Hapus proyek ini?",
      message: `"${project.title}" beserta semua foto & videonya akan dihapus permanen.`,
      confirmLabel: "Ya, hapus",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteProject(project);
      toast("Proyek dihapus.");
      load();
    } catch (e) {
      toast(friendlyError(e), "error");
    }
  };

  const move = async (from, to) => {
    const next = [...projects];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setProjects(next);
    try {
      await saveOrder("projects", next);
    } catch (e) {
      toast(friendlyError(e), "error");
      load();
    }
  };

  return (
    <>
      <PageHeader
        title="Proyek Saya"
        description="Urutan di sini = urutan tampil di website."
        action={
          <Button icon={Plus} onClick={() => navigate("/admin/projects/new")}>
            Tambah proyek
          </Button>
        }
      />

      {projects === null ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 rounded-3xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-line px-6 py-14 text-center">
          <FolderPlus className="size-12 text-muted" />
          <p className="text-lg font-semibold">Belum ada proyek</p>
          <p className="max-w-sm text-muted">Tambahkan proyek pertama Anda lengkap dengan foto, video dan deskripsi.</p>
          <Button icon={Plus} size="lg" onClick={() => navigate("/admin/projects/new")}>
            Tambah proyek pertama
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {projects.map((p, i) => {
            const cover = mediaThumb(p.media.find((m) => m.type !== "video"));
            return (
              <li
                key={p.id}
                className={cn(
                  "flex items-center gap-2 rounded-3xl bg-surface p-3 shadow-card sm:gap-3",
                  !p.published && "opacity-70",
                )}
              >
                <ReorderButtons index={i} total={projects.length} onMove={move} />
                <Link to={`/admin/projects/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="aspect-[16/10] w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#b4846c] to-[#7d5a50] sm:w-28">
                    {cover && <img src={cover} alt="" className="h-full w-full object-cover" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{p.title}</span>
                    <span className="mt-1 flex flex-wrap gap-1.5 text-xs">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 font-medium",
                          p.published ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-line text-muted",
                        )}
                      >
                        {p.published ? "Tampil" : "Draf"}
                      </span>
                      {p.featured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-0.5 font-medium text-[#7d5a50]">
                          <Star className="size-3 fill-current" /> Unggulan
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-muted">
                        <Images className="size-3" /> {p.media.length}
                      </span>
                    </span>
                  </span>
                </Link>
                <div className="flex flex-col sm:flex-row">
                  <Button
                    size="icon"
                    variant="ghost"
                    icon={p.published ? Eye : EyeOff}
                    onClick={() => togglePublished(p)}
                    aria-label={p.published ? "Sembunyikan" : "Tampilkan"}
                    title={p.published ? "Sembunyikan dari website" : "Tampilkan di website"}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    icon={Pencil}
                    onClick={() => navigate(`/admin/projects/${p.id}`)}
                    aria-label="Ubah"
                    title="Ubah"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    icon={Trash2}
                    onClick={() => remove(p)}
                    aria-label="Hapus"
                    title="Hapus"
                    className="text-danger"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
