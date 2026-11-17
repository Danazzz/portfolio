import { useCallback, useEffect, useState } from "react";
import { Inbox, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteRow, friendlyError, listRows, removeFiles, saveOrder, saveRow } from "../lib/api";
import { assetUrl } from "../lib/utils";
import { Button } from "../components/ui/Button";
import { Sheet } from "../components/ui/Sheet";
import { Skeleton } from "../components/ui/Skeleton";
import { FieldRenderer } from "./FieldRenderer";
import { changedImages, hasTranslation, prepareRow } from "./form-utils";
import { PageHeader } from "./PageHeader";
import { ReorderButtons } from "./ReorderButtons";
import { emptyRow } from "./collections";
import { useConfirm, useToast } from "./feedback-context";
import { NoIndonesianBadge } from "./NoIndonesianBadge";

/** Halaman kelola data sederhana: daftar + form tambah/ubah dalam bottom sheet. */
export function CollectionPage({ config }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [rows, setRows] = useState(null);
  const [editing, setEditing] = useState(null); // { original, value }
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setRows(await listRows(config.table));
    } catch (e) {
      toast(friendlyError(e), "error");
      setRows([]);
    }
  }, [config.table, toast]);

  useEffect(() => {
    setRows(null);
    load();
  }, [load]);

  const openForm = (row) => {
    setErrors({});
    setEditing({ original: row || null, value: row ? { ...row } : emptyRow(config.fields) });
  };

  const closeForm = () => {
    // Hapus gambar yang sempat di-upload tapi batal disimpan.
    if (editing) removeFiles(changedImages(config.fields, editing.value, editing.original || {}));
    setEditing(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    const { row, errors } = prepareRow(config.fields, editing.value);
    setErrors(errors);
    if (Object.keys(errors).length) return;
    setSaving(true);
    try {
      if (!row.id) row.sort_order = rows.length;
      await saveRow(config.table, row);
      if (editing.original) await removeFiles(changedImages(config.fields, editing.original, row));
      toast(editing.original ? "Perubahan disimpan." : `${capitalize(config.itemName)} ditambahkan.`);
      setEditing(null);
      load();
    } catch (err) {
      toast(friendlyError(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    const ok = await confirm({
      title: `Hapus ${config.itemName} ini?`,
      message: `"${config.primary(row)}" akan dihapus permanen.`,
      confirmLabel: "Ya, hapus",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteRow(config.table, row.id);
      await removeFiles(changedImages(config.fields, row, {}));
      toast(`${capitalize(config.itemName)} dihapus.`);
      load();
    } catch (e) {
      toast(friendlyError(e), "error");
    }
  };

  const move = async (from, to) => {
    const next = [...rows];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setRows(next);
    try {
      await saveOrder(config.table, next);
    } catch (e) {
      toast(friendlyError(e), "error");
      load();
    }
  };

  return (
    <>
      <PageHeader
        title={config.title}
        description={config.description}
        action={
          <Button icon={Plus} onClick={() => openForm(null)}>
            Tambah {config.itemName}
          </Button>
        }
      />

      {rows === null ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 rounded-3xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-line px-6 py-14 text-center">
          <Inbox className="size-12 text-muted" />
          <p className="font-semibold">Belum ada {config.itemName}</p>
          <Button icon={Plus} onClick={() => openForm(null)}>
            Tambah {config.itemName} pertama
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((row, i) => {
            const image = config.image?.(row);
            return (
              <li key={row.id} className="flex items-center gap-2 rounded-3xl bg-surface p-3 shadow-card sm:gap-3">
                <ReorderButtons index={i} total={rows.length} onMove={move} />
                {config.image && (
                  <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-surface-2">
                    {image && <img src={assetUrl(image)} alt="" className="h-full w-full object-contain" />}
                  </span>
                )}
                <button type="button" onClick={() => openForm(row)} className="min-w-0 flex-1 text-left">
                  <p className="truncate font-semibold">{config.primary(row)}</p>
                  {config.secondary && <p className="truncate text-sm text-muted">{config.secondary(row)}</p>}
                  {config.fields.some((f) => f.translatable) && !hasTranslation(row) && <NoIndonesianBadge />}
                </button>
                <Button size="icon" variant="ghost" icon={Pencil} onClick={() => openForm(row)} aria-label="Ubah" title="Ubah" />
                <Button size="icon" variant="ghost" icon={Trash2} onClick={() => remove(row)} aria-label="Hapus" title="Hapus" className="text-danger" />
              </li>
            );
          })}
        </ul>
      )}

      <Sheet open={Boolean(editing)} onClose={closeForm} label={`Form ${config.itemName}`}>
        {editing && (
          <form onSubmit={submit} noValidate className="space-y-5 p-5 pt-8 sm:p-7">
            <h2 className="pr-10 text-xl font-bold">
              {editing.original ? `Ubah ${config.itemName}` : `Tambah ${config.itemName}`}
            </h2>
            <FieldRenderer
              fields={config.fields}
              value={editing.value}
              onChange={(value) => setEditing((s) => ({ ...s, value }))}
              folder={config.table}
              errors={errors}
            />
            <div className="flex gap-2 pt-2">
              <Button variant="secondary" onClick={closeForm} className="flex-1">
                Batal
              </Button>
              <Button type="submit" loading={saving} className="flex-1">
                Simpan
              </Button>
            </div>
          </form>
        )}
      </Sheet>
    </>
  );
}

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
