import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { friendlyError, getProfile, removeFiles, saveProfile } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { FieldRenderer } from "./FieldRenderer";
import { changedImages, prepareRow } from "./form-utils";
import { FormCard } from "./fields";
import { PageHeader } from "./PageHeader";
import { useToast } from "./feedback-context";

const TIMEZONES = [
  { value: "", label: "Tidak ditampilkan" },
  { value: "Asia/Jakarta", label: "WIB (Jakarta)" },
  { value: "Asia/Makassar", label: "WITA (Bali, Makassar)" },
  { value: "Asia/Jayapura", label: "WIT (Jayapura)" },
  { value: "Asia/Singapore", label: "Singapura / Malaysia" },
  { value: "Asia/Tokyo", label: "Jepang" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Amsterdam", label: "Eropa Tengah" },
  { value: "Australia/Sydney", label: "Sydney" },
  { value: "America/New_York", label: "New York" },
  { value: "America/Los_Angeles", label: "Los Angeles" },
];

const IDENTITY = [
  { name: "name", label: "Nama lengkap", type: "text", required: true },
  { name: "headline", label: "Keahlian singkat", type: "text", translatable: true, placeholder: "Contoh: Mahasiswa Magister Informatika", help: "Opsional. Tampil di halaman About." },
  { name: "location", label: "Lokasi", type: "text", placeholder: "Contoh: Denpasar, Bali", help: "Opsional. Tampil di bawah beranda.", half: true },
  { name: "timezone", label: "Zona waktu (untuk jam di beranda)", type: "select", options: TIMEZONES, half: true, help: "Pilih \"Tidak ditampilkan\" untuk menyembunyikan jam." },
  { name: "interests", label: "Minat", type: "lines", translatable: true, rows: 5, placeholder: "graphs\ncyber security\nIT audit\nmachine learning", help: "Satu minat per baris. Di beranda tampil bergantian: \"Currently curious about …\"." },
  { name: "about", label: "Tentang saya", type: "textarea", rows: 7, translatable: true, help: "Cerita singkat tentang diri Anda. Tekan Enter untuk paragraf baru." },
];

const PHOTOS = [
  { name: "avatar_url", label: "Foto profil", type: "image", aspect: "aspect-square max-w-48", help: "Tampil bulat di bagian atas. Sebaiknya foto persegi.", half: true },
  { name: "about_image_url", label: "Foto bagian \"About\"", type: "image", aspect: "aspect-[3/4] max-w-48", help: "Opsional — tampilan paling bersih tanpa foto ini.", half: true },
];

const CONTACT = [
  { name: "email", label: "Email", type: "email", placeholder: "nama@email.com", half: true },
  { name: "whatsapp", label: "Nomor WhatsApp", type: "text", validate: "phone", placeholder: "Contoh: 081234567890", half: true },
  { name: "linkedin_url", label: "Link LinkedIn", type: "url", placeholder: "https://linkedin.com/in/...", half: true },
  { name: "github_url", label: "Link GitHub", type: "url", placeholder: "https://github.com/...", half: true },
  { name: "gitlab_url", label: "Link GitLab", type: "url", placeholder: "https://gitlab.com/...", half: true },
  { name: "cv_url", label: "Link CV (PDF / Google Drive)", type: "url", placeholder: "https://...", help: "Jika diisi, muncul tombol CV di website.", half: true },
];

const ALL = [...IDENTITY, ...PHOTOS, ...CONTACT];

export function ProfilePage() {
  const toast = useToast();
  const [original, setOriginal] = useState(null);
  const [value, setValue] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProfile()
      .then((p) => {
        setOriginal(p);
        setValue(p);
      })
      .catch((e) => toast(friendlyError(e), "error"));
  }, [toast]);

  if (!value) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    const { row, errors } = prepareRow(ALL, value);
    setErrors(errors);
    if (Object.keys(errors).length) {
      toast("Ada isian yang perlu diperbaiki (lihat tulisan merah).", "error");
      return;
    }
    setSaving(true);
    try {
      const saved = await saveProfile(row);
      await removeFiles(changedImages(PHOTOS, original, saved));
      setOriginal(saved);
      setValue(saved);
      toast("Profil disimpan.");
    } catch (err) {
      toast(friendlyError(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const section = (fields) => (
    <FieldRenderer fields={fields} value={value} onChange={setValue} folder="profile" errors={errors} />
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <PageHeader title="Profil" description="Data diri dan kontak yang tampil di website." />
      <FormCard step="1" title="Data diri">{section(IDENTITY)}</FormCard>
      <FormCard step="2" title="Foto">{section(PHOTOS)}</FormCard>
      <FormCard step="3" title="Kontak & media sosial" description="Kosongkan yang tidak ingin ditampilkan.">
        {section(CONTACT)}
      </FormCard>
      <div className="sticky bottom-24 z-30 flex justify-end md:bottom-4">
        <Button type="submit" size="lg" icon={Save} loading={saving} className="shadow-float">
          Simpan profil
        </Button>
      </div>
    </form>
  );
}
