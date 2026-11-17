import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase, isSupabaseReady } from "../lib/supabase";
import { checkIsAdmin } from "../lib/api";
import { logError } from "../lib/errorLog";
import { FeedbackProvider } from "./FeedbackProvider";
import { Login } from "./Login";
import { AdminLayout } from "./AdminLayout";
import { NotAdmin, SetupNotice } from "./Notices";
import { ProjectsPage } from "./ProjectsPage";
import { ProjectEditor } from "./ProjectEditor";
import { CollectionPage } from "./CollectionPage";
import { ProfilePage } from "./ProfilePage";
import { SystemPage } from "./SystemPage";
import { MorePage } from "./MorePage";
import { COLLECTIONS } from "./collections";

function Loading() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <Loader2 className="size-8 animate-spin text-brand" />
    </div>
  );
}

function useAdminSession() {
  const [state, setState] = useState({ status: "loading", session: null, isAdmin: false });

  useEffect(() => {
    let active = true;
    const resolve = async (session) => {
      if (!session) {
        if (active) setState({ status: "ready", session: null, isAdmin: false });
        return;
      }
      let isAdmin = false;
      try {
        isAdmin = await checkIsAdmin();
      } catch (e) {
        logError(e, "Cek status admin");
      }
      if (active) setState({ status: "ready", session, isAdmin });
    };

    supabase.auth.getSession().then(({ data }) => resolve(data.session));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      // Hindari cek ulang saat token diperbarui di latar belakang.
      // setTimeout: Supabase melarang memanggil API langsung di dalam callback ini (bisa macet).
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") setTimeout(() => resolve(session), 0);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return state;
}

function AdminRoutes() {
  const { status, session, isAdmin } = useAdminSession();

  if (status === "loading") return <Loading />;
  if (!session) return <Login />;
  if (!isAdmin) return <NotAdmin email={session.user.email} />;

  // Catatan: semua link & pengalihan di admin memakai alamat absolut ("/admin/...").
  // Admin berada di rute "/admin/*" dengan opsi v7_relativeSplatPath, sehingga alamat
  // relatif (mis. "profile") dihitung dari halaman yang sedang dibuka → "/admin/projects/profile".
  return (
    <Routes>
      <Route element={<AdminLayout email={session.user.email} />}>
        <Route index element={<Navigate to="/admin/projects" replace />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/new" element={<ProjectEditor />} />
        <Route path="projects/:id" element={<ProjectEditor />} />
        {COLLECTIONS.map((c) => (
          <Route key={c.table} path={c.path} element={<CollectionPage config={c} />} />
        ))}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="system" element={<SystemPage />} />
        <Route path="more" element={<MorePage />} />
        <Route path="*" element={<Navigate to="/admin/projects" replace />} />
      </Route>
    </Routes>
  );
}

export default function AdminApp() {
  useEffect(() => {
    const prev = document.title;
    document.title = "Panel Admin — Portfolio";
    return () => {
      document.title = prev;
    };
  }, []);

  if (!isSupabaseReady) return <SetupNotice />;
  return (
    <FeedbackProvider>
      <AdminRoutes />
    </FeedbackProvider>
  );
}
