import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { PLEINEN, PLEIN_SLUGS } from "@/lib/pleinen";
import PleinEditForm from "./PleinEditForm";

const SUPER_ADMIN_EMAIL = "admin@cityeventsstadskanaal.nl";

export const dynamic = "force-dynamic";

export default async function BeheerPleinPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!PLEIN_SLUGS.includes(slug)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/beheer/login");

  const plein = PLEINEN.find((p) => p.slug === slug);
  if (!plein) notFound();

  const isSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL;
  const { data: perm } = await supabase
    .from("plein_permissions")
    .select("plein_slug")
    .eq("user_id", user.id)
    .eq("plein_slug", slug)
    .maybeSingle();
  const { data: profile } = await supabase.from("profiles").select("is_super_admin").eq("id", user.id).single();

  const canEdit = isSuperAdmin || profile?.is_super_admin || perm;
  if (!canEdit) redirect("/beheer");

  const { data: content } = await supabase
    .from("plein_content")
    .select("general_text, program_data, image_paths")
    .eq("plein_slug", slug)
    .single();

  return (
    <div className="beheer-page beheer-page--facturen">
      <div className="facturen-app">
        <header className="facturen-app__header">
          <div className="facturen-app__title-block">
            <p className="facturen-app__eyebrow">Pleinen · Beheer</p>
            <h1 className="facturen-app__title">{plein.name}</h1>
            <p className="facturen-app__subtitle">
              Algemene tekst, programma en afbeeldingen voor de openbare pleinpagina aanpassen.
            </p>
          </div>
          <div className="facturen-app__toolbar facturen-app__toolbar--wrap beheer-plein-toolbar">
            <Link href="/beheer" className="facturen-btn facturen-btn--ghost">
              ← Terug naar beheer
            </Link>
            <Link href={`/plein/${slug}`} className="facturen-btn facturen-btn--primary" target="_blank" rel="noopener noreferrer">
              Bekijk op site
            </Link>
          </div>
        </header>

        <main className="facturen-app__main">
          <PleinEditForm
            pleinSlug={slug}
            initial={{
              general_text: content?.general_text ?? "",
              program_data: content?.program_data ?? undefined,
              image_paths: content?.image_paths ?? [],
            }}
          />
        </main>
      </div>
    </div>
  );
}
