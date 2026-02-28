import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { PLEINEN, PLEIN_SLUGS } from "@/lib/pleinen";
import PleinEditForm from "./PleinEditForm";

const SUPER_ADMIN_EMAIL = "admin@cityeventsstadskanaal.nl";

export default async function BeheerPleinPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  if (!PLEIN_SLUGS.includes(slug)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  const canEdit = isSuperAdmin || profile?.is_super_admin || perm;
  if (!canEdit) redirect("/beheer");

  const { data: content } = await supabase
    .from("plein_content")
    .select("general_text, program_data, image_paths")
    .eq("plein_slug", slug)
    .single();

  return (
    <div className="beheer-plein">
      <header className="beheer-plein__header">
        <Link href="/beheer">Terug naar beheer</Link>
        <h1>Bewerken: {plein.name}</h1>
      </header>
      <PleinEditForm
        pleinSlug={slug}
        pleinName={plein.name}
        initial={{
          general_text: content?.general_text ?? "",
          program_data: content?.program_data ?? undefined,
          image_paths: content?.image_paths ?? [],
        }}
      />
    </div>
  );
}
