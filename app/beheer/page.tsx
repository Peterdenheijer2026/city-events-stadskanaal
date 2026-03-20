import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PLEINEN } from "@/lib/pleinen";
import BeheerDashboard from "./BeheerDashboard";

const SUPER_ADMIN_EMAIL = "admin@cityeventsstadskanaal.nl";
const TREASURER_EMAIL = "penningmeester@cityeventsstadskanaal.nl";

export default async function BeheerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/beheer/login");
  }

  const isSuperAdminByEmail = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL;
  const isTreasurer = user.email?.toLowerCase() === TREASURER_EMAIL;

  if (isTreasurer) {
    redirect("/beheer/boekhouding");
  }

  let profile: { is_super_admin: boolean } | null = null;
  let permissions: { plein_slug: string }[] = [];
  let allProfiles: { id: string; email: string; is_super_admin: boolean }[] = [];
  let userPermissions: { user_id: string; plein_slug: string }[] = [];

  const { data: profileRow } = await supabase.from("profiles").select("is_super_admin").eq("id", user.id).single();
  profile = profileRow ?? null;

  const isSuperAdmin = isSuperAdminByEmail || !!profile?.is_super_admin;

  if (isSuperAdmin) {
    const { data: rpcData } = await supabase.rpc("get_admin_profiles_and_permissions");
    if (rpcData && typeof rpcData === "object" && "profiles" in rpcData && "permissions" in rpcData) {
      const raw = rpcData as {
        profiles: { id: string; email: string; is_super_admin: boolean }[];
        permissions: { user_id: string; plein_slug: string }[];
      };
      allProfiles = Array.isArray(raw.profiles)
        ? raw.profiles.sort((a, b) => (a.email ?? "").localeCompare(b.email ?? ""))
        : [];
      userPermissions = Array.isArray(raw.permissions) ? raw.permissions : [];
    }
  } else {
    const { data: perms } = await supabase.from("plein_permissions").select("plein_slug").eq("user_id", user.id);
    permissions = perms ?? [];
    if (permissions.length === 0 && !isTreasurer) {
      redirect("/beheer/no-access");
    }
  }

  const roleLabel = isSuperAdmin ? "Hoofdbeheerder" : "Beheerder";

  return (
    <div className="beheer-page beheer-page--facturen">
      <div className="facturen-app">
        <header className="facturen-app__header">
          <div className="facturen-app__title-block">
            <p className="facturen-app__eyebrow">City Events Stadskanaal</p>
            <h1 className="facturen-app__title">Beheer</h1>
            <p className="facturen-app__subtitle">
              {user.email}
              <span className="facturen-app__subtitle-meta"> · {roleLabel}</span>
            </p>
          </div>
          <div className="facturen-app__toolbar facturen-app__toolbar--wrap beheer-app-toolbar">
            <Link href="/" className="facturen-btn facturen-btn--ghost">
              Naar site
            </Link>
            <form action="/beheer/logout" method="post" className="beheer-logout-form">
              <button type="submit" className="facturen-btn facturen-btn--ghost">
                Uitloggen
              </button>
            </form>
          </div>
        </header>

        <BeheerDashboard
          isSuperAdmin={isSuperAdmin}
          pleinen={PLEINEN}
          myPermissions={isSuperAdmin ? PLEINEN.map((p) => p.slug) : permissions.map((p) => p.plein_slug)}
          allProfiles={allProfiles}
          userPermissions={userPermissions}
          currentUserId={user.id}
        />
      </div>
    </div>
  );
}
