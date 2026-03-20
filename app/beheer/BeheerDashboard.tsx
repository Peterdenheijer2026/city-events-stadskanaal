"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { deleteUserAccount } from "./actions";
import type { PleinItem } from "@/lib/pleinen";

const SUPER_ADMIN_EMAIL = "admin@cityeventsstadskanaal.nl";

type Props = {
  isSuperAdmin: boolean;
  pleinen: readonly PleinItem[];
  myPermissions: string[];
  allProfiles: { id: string; email: string; is_super_admin: boolean }[];
  userPermissions: { user_id: string; plein_slug: string }[];
  currentUserId: string;
};

export default function BeheerDashboard({
  isSuperAdmin,
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
    if (!confirm(`Weet je zeker dat je het account van ${email} wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`))
      return;
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
    <main className="facturen-app__main beheer-dashboard beheer-dashboard--app">
      {error && (
        <p className="facturen-alert facturen-alert--error" role="alert">
          Fout bij opslaan: {error}
        </p>
      )}

      {isSuperAdmin && (
        <section className="facturen-panel">
          <h2 className="facturen-panel__h">Pleinrechten toewijzen</h2>
          <p className="facturen-panel__intro">
            Vink per gebruiker aan welke pleinpagina&apos;s zij mogen beheren. Hoofdbeheerders hebben automatisch
            toegang tot alle pleinen.
          </p>
          <div className="facturen-table-wrap">
            <table className="facturen-table beheer-dashboard__table">
              <thead>
                <tr>
                  <th>Gebruiker</th>
                  {pleinen.map((p) => (
                    <th key={p.slug} className="beheer-dashboard__th-plein">
                      {p.name}
                    </th>
                  ))}
                  <th className="facturen-table__right beheer-dashboard__th-acties">Acties</th>
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
                        <span className="beheer-dashboard__email">{prof.email}</span>
                        {prof.is_super_admin && (
                          <span className="beheer-dashboard__badge">Hoofdbeheerder</span>
                        )}
                      </td>
                      {pleinen.map((p) => {
                        const has =
                          prof.is_super_admin ||
                          userPermissions.some((up) => up.user_id === prof.id && up.plein_slug === p.slug);
                        const isSaving = saving === `${prof.id}-${p.slug}`;
                        return (
                          <td key={p.slug} className="beheer-dashboard__td-check">
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
                                {isSaving ? <span className="beheer-dashboard__saving">…</span> : null}
                              </label>
                            )}
                          </td>
                        );
                      })}
                      <td className="facturen-table__right beheer-dashboard__acties">
                        {canDelete ? (
                          <button
                            type="button"
                            className="facturen-btn facturen-btn--danger facturen-btn--tiny"
                            onClick={() => handleDelete(prof.id, prof.email)}
                            disabled={deleting === prof.id}
                          >
                            {deleting === prof.id ? "…" : "Verwijderen"}
                          </button>
                        ) : (
                          <span className="facturen-table__muted">—</span>
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

      <section className="facturen-panel">
        <h2 className="facturen-panel__h">Pleinen beheren</h2>
        <p className="facturen-panel__intro">
          Open een plein om teksten, programma en afbeeldingen aan te passen. Alleen pleinen waarvoor je rechten hebt
          zijn beschikbaar.
        </p>
        <ul className="beheer-dashboard__pleinen-grid">
          {pleinen.map((p) => (
            <li key={p.slug}>
              {myPermissions.includes(p.slug) ? (
                <Link href={`/beheer/plein/${p.slug}`} className="facturen-btn facturen-btn--ghost beheer-dashboard__plein-link">
                  <span className="beheer-dashboard__plein-name">{p.name}</span>
                  <span className="beheer-dashboard__plein-action">Bewerken →</span>
                </Link>
              ) : (
                <div className="beheer-dashboard__plein-locked">
                  <span className="beheer-dashboard__plein-name">{p.name}</span>
                  <span className="beheer-dashboard__plein-lock">Geen toegang</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
