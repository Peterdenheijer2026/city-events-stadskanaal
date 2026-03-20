"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { deleteUserAccount } from "./actions";
import type { PleinItem } from "@/lib/pleinen";

const SUPER_ADMIN_EMAIL = "admin@cityeventsstadskanaal.nl";
const TREASURER_EMAIL = "penningmeester@cityeventsstadskanaal.nl";

type Props = {
  isSuperAdmin: boolean;
  isTreasurer: boolean;
  pleinen: readonly PleinItem[];
  myPermissions: string[];
  allProfiles: { id: string; email: string; is_super_admin: boolean }[];
  userPermissions: { user_id: string; plein_slug: string }[];
  currentUserId: string;
};

export default function BeheerDashboard({
  isSuperAdmin,
  isTreasurer,
  pleinen,
  myPermissions,
  allProfiles,
  userPermissions,
  currentUserId,
}: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function togglePermission(userId: string, pleinSlug: string, checked: boolean) {
    setSaving(`${userId}-${pleinSlug}`);
    setError(null);
    const supabase = createClient();
    if (checked) {
      const { error: err } = await supabase.from("plein_permissions").upsert({ user_id: userId, plein_slug: pleinSlug });
      if (err) {
        setError(err.message);
        setSaving(null);
        return;
      }
    } else {
      const { error: err } = await supabase.from("plein_permissions").delete().eq("user_id", userId).eq("plein_slug", pleinSlug);
      if (err) {
        setError(err.message);
        setSaving(null);
        return;
      }
    }
    setSaving(null);
    router.refresh();
  }

  async function handleDelete(userId: string, email: string) {
    if (!confirm(`Weet je zeker dat je het account van ${email} wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`)) return;
    setDeleting(userId);
    setError(null);
    const { error: err } = await deleteUserAccount(userId);
    if (err) {
      setError(err);
      setDeleting(null);
      return;
    }
    setDeleting(null);
    router.refresh();
  }

  return (
    <main className="beheer-dashboard">
      {error && (
        <p className="beheer-dashboard__error" role="alert">
          Fout bij opslaan: {error}
        </p>
      )}

      {isTreasurer && (
        <section className="beheer-dashboard__section">
          <h2>Boekhouding</h2>
          <p className="beheer-dashboard__hint">
            Debiteuren en crediteuren, PDF-upload, en overzicht geldstromen.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-start" }}>
            <Link href="/beheer/boekhouding" className="beheer-dashboard__link">
              Boekhoud-overzicht
            </Link>
            <Link href="/beheer/facturen" className="beheer-dashboard__link">
              Debiteuren
            </Link>
            <Link href="/beheer/boekhouding/crediteuren" className="beheer-dashboard__link">
              Crediteuren
            </Link>
          </div>
        </section>
      )}

      {isSuperAdmin && (
        <section className="beheer-dashboard__section">
          <h2>Pleinrechten toewijzen</h2>
          <p className="beheer-dashboard__hint">
            Vink per gebruiker aan welke pleinpagina&apos;s zij mogen beheren.
          </p>
          <div className="beheer-dashboard__table-wrap">
            <table className="beheer-dashboard__table">
              <thead>
                <tr>
                  <th>Gebruiker</th>
                  {pleinen.map((p) => (
                    <th key={p.slug}>{p.name}</th>
                  ))}
                  <th className="beheer-dashboard__th-acties">Acties</th>
                </tr>
              </thead>
              <tbody>
                {allProfiles.map((prof) => {
                  const isOwnAccount = prof.id === currentUserId;
                  const isMainAdmin = prof.email?.toLowerCase() === SUPER_ADMIN_EMAIL;
                  const canDelete = isSuperAdmin && !isOwnAccount && !isMainAdmin;
                  return (
                    <tr key={prof.id}>
                      <td>
                        {prof.email}
                        {prof.is_super_admin && " (hoofdbeheerder)"}
                      </td>
                      {pleinen.map((p) => {
                        const has = prof.is_super_admin || userPermissions.some((up) => up.user_id === prof.id && up.plein_slug === p.slug);
                        const isSaving = saving === `${prof.id}-${p.slug}`;
                        return (
                          <td key={p.slug}>
                            {prof.is_super_admin ? (
                              <span className="beheer-dashboard__all">alle</span>
                            ) : (
                              <label className="beheer-dashboard__check">
                                <input
                                  type="checkbox"
                                  checked={has}
                                  disabled={isSaving}
                                  onChange={(e) => togglePermission(prof.id, p.slug, e.target.checked)}
                                />
                                {isSaving ? "…" : ""}
                              </label>
                            )}
                          </td>
                        );
                      })}
                      <td className="beheer-dashboard__acties">
                        {canDelete ? (
                          <button
                            type="button"
                            className="beheer-dashboard__btn-delete"
                            onClick={() => handleDelete(prof.id, prof.email)}
                            disabled={deleting === prof.id}
                          >
                            {deleting === prof.id ? "…" : "Verwijderen"}
                          </button>
                        ) : (
                          <span className="beheer-dashboard__no-delete">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="beheer-dashboard__section">
        <h2>Pleinen beheren</h2>
        <ul className="beheer-dashboard__pleinen">
          {pleinen.map((p) => (
            <li key={p.slug}>
              {myPermissions.includes(p.slug) ? (
                <Link href={`/beheer/plein/${p.slug}`} className="beheer-dashboard__link">
                  {p.name} – bewerken
                </Link>
              ) : (
                <span className="beheer-dashboard__no-access">{p.name} (geen toegang)</span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
