"use client";

import { useState, useTransition } from "react";
import { deleteInvoice } from "../actions";

export default function DeleteInvoiceButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem" }}>
      {error && (
        <span style={{ color: "#ef9a9a", fontSize: "0.875rem" }}>
          {error}
        </span>
      )}
      <button
        type="button"
        onClick={() => {
          setError(null);
          if (!confirm("Weet je zeker dat je deze factuur wilt verwijderen? Dit kan niet ongedaan worden gemaakt.")) return;
          startTransition(async () => {
            const res = await deleteInvoice(id);
            if (res.error) setError(res.error);
            else window.location.href = "/beheer/facturen";
          });
        }}
        disabled={pending}
        className="facturen-btn facturen-btn--danger invoice-delete"
      >
        {pending ? "Verwijderen…" : "Verwijderen"}
      </button>
    </div>
  );
}

