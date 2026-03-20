"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  PROGRAMMA_DATUM_26,
  PROGRAMMA_DATUM_27,
  PROGRAMMA_LABELS,
  parseProgrammaData,
  type ProgrammaData,
  type ProgrammaDatumKey,
  type ProgrammaItem,
} from "@/lib/programma-types";

const MAX_IMAGES = 4;
const BUCKET_IMAGES = "plein-images";

type ImageSlot = { url?: string; file?: File | null };

function getStoragePathFromPublicUrl(url: string): string | null {
  const match = url.match(/plein-images\/(.+?)(?:\?|$)/);
  return match ? match[1] : null;
}

// Tijden per kwartier van 12:00 t/m 03:00 (volgende dag)
function getTijdOpties(): string[] {
  const opts: string[] = [];
  for (let h = 12; h <= 23; h++) {
    for (let m = 0; m < 60; m += 15) {
      opts.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    }
  }
  for (let h = 0; h <= 2; h++) {
    for (let m = 0; m < 60; m += 15) {
      opts.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    }
  }
  opts.push("03:00");
  return opts;
}
const TIJD_OPTIES = getTijdOpties();

type Props = {
  pleinSlug: string;
  initial: {
    general_text: string;
    program_data?: unknown;
    image_paths: string[];
  };
};

export default function PleinEditForm({ pleinSlug, initial }: Props) {
  const router = useRouter();
  const [generalText, setGeneralText] = useState(initial.general_text);
  const [programData, setProgramData] = useState<ProgrammaData>(() =>
    parseProgrammaData(initial.program_data)
  );
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>(() =>
    (initial.image_paths ?? []).map((url) => ({ url, file: null }))
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const supabase = createClient();

  function setDatumEnabled(datum: ProgrammaDatumKey, enabled: boolean) {
    setProgramData((prev) => ({
      ...prev,
      [datum]: { ...prev[datum], enabled, items: prev[datum]?.items ?? [{ time: "", act: "" }] },
    }));
  }

  function setDatumItems(datum: ProgrammaDatumKey, items: ProgrammaItem[]) {
    setProgramData((prev) => ({
      ...prev,
      [datum]: { ...prev[datum], items: items.length ? items : [{ time: "", act: "" }] },
    }));
  }

  function addProgrammaRow(datum: ProgrammaDatumKey) {
    const items = programData[datum]?.items ?? [{ time: "", act: "" }];
    setDatumItems(datum, [...items, { time: TIJD_OPTIES[0], act: "" }]);
  }

  function removeProgrammaRow(datum: ProgrammaDatumKey, index: number) {
    const items = [...(programData[datum]?.items ?? [])];
    items.splice(index, 1);
    setDatumItems(datum, items);
  }

  function updateProgrammaRow(datum: ProgrammaDatumKey, index: number, field: "time" | "act", value: string) {
    const items = [...(programData[datum]?.items ?? [])];
    if (items[index]) items[index] = { ...items[index], [field]: value };
    setDatumItems(datum, items);
  }

  function addImageSlot() {
    if (imageSlots.length >= MAX_IMAGES) return;
    setImageSlots((prev) => [...prev, { file: null }]);
  }

  function removeImageSlot(index: number) {
    setImageSlots((prev) => prev.filter((_, i) => i !== index));
  }

  function swapImageSlots(i: number, j: number) {
    if (i < 0 || j < 0 || i >= imageSlots.length || j >= imageSlots.length || i === j) return;
    setImageSlots((prev) => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function setSlotFile(index: number, file: File | null) {
    setImageSlots((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], file: file ?? undefined };
      return next;
    });
  }

  async function deleteFromStorage(url: string): Promise<void> {
    const path = getStoragePathFromPublicUrl(url);
    if (!path) return;
    await supabase.storage.from(BUCKET_IMAGES).remove([path]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const newPaths: string[] = [];
      const timestamp = Date.now();
      for (let i = 0; i < imageSlots.length; i++) {
        const slot = imageSlots[i];
        if (slot?.file) {
          const ext = slot.file.name.split(".").pop()?.toLowerCase() || "jpg";
          const path = `${pleinSlug}/${i}-${timestamp}.${ext}`;
          const { error } = await supabase.storage.from(BUCKET_IMAGES).upload(path, slot.file, { upsert: true });
          if (error) {
            setMessage({ type: "err", text: `Afbeelding ${i + 1}: ${error.message}` });
            setSaving(false);
            return;
          }
          const { data } = supabase.storage.from(BUCKET_IMAGES).getPublicUrl(path);
          newPaths.push(data.publicUrl);
        } else if (slot?.url) {
          newPaths.push(slot.url);
        }
      }

      const previousUrls = initial.image_paths ?? [];
      const toDelete = previousUrls.filter((url) => !newPaths.includes(url));
      for (const url of toDelete) {
        await deleteFromStorage(url);
      }

      const { error } = await supabase
        .from("plein_content")
        .upsert({
          plein_slug: pleinSlug,
          general_text: generalText,
          program_data: programData,
          image_paths: newPaths,
          updated_at: new Date().toISOString(),
        });
      if (error) {
        setMessage({ type: "err", text: `Opslaan mislukt: ${error.message}` });
        setSaving(false);
        return;
      }
      setMessage({ type: "ok", text: "Opgeslagen." });
      setImageSlots(newPaths.map((url) => ({ url, file: null })));
      router.refresh();
    } catch (err: unknown) {
      setMessage({
        type: "err",
        text: err instanceof Error ? err.message : "Opslaan mislukt.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="plein-edit plein-edit--app facturen-form">
      {message && (
        <p
          className={`facturen-alert plein-edit__alert ${message.type === "ok" ? "facturen-alert--success" : "facturen-alert--error"}`}
          role={message.type === "ok" ? "status" : "alert"}
        >
          {message.text}
        </p>
      )}

      <section className="invoice-form__section">
        <h2>Algemene tekst</h2>
        <p className="facturen-panel__intro plein-edit__section-intro">Deze tekst verschijnt op de openbare pleinpagina.</p>
        <label className="plein-edit__label" htmlFor="general_text">
          Inhoud
        </label>
        <textarea
          id="general_text"
          className="plein-edit__textarea"
          rows={6}
          value={generalText}
          onChange={(e) => setGeneralText(e.target.value)}
          placeholder="Tekst voor op de pleinpagina…"
        />
      </section>

      <section className="invoice-form__section">
        <h2>Programma</h2>
        <p className="facturen-panel__intro plein-edit__section-intro">Per dag inschakelen en tijden + acts invullen.</p>
        {([PROGRAMMA_DATUM_26, PROGRAMMA_DATUM_27] as const).map((datum) => (
          <fieldset key={datum} className="plein-edit__programma-datum">
            <legend className="plein-edit__programma-legend">
              <label className="plein-edit__programma-check">
                <input
                  type="checkbox"
                  checked={programData[datum]?.enabled ?? false}
                  onChange={(e) => setDatumEnabled(datum, e.target.checked)}
                />
                <span>{PROGRAMMA_LABELS[datum]}</span>
              </label>
            </legend>
            {programData[datum]?.enabled && (
              <div className="plein-edit__programma-rows">
                {(programData[datum]?.items ?? []).map((item, index) => (
                  <div key={index} className="plein-edit__programma-row">
                    <select
                      value={item.time}
                      onChange={(e) => updateProgrammaRow(datum, index, "time", e.target.value)}
                      className="plein-edit__programma-time"
                    >
                      <option value="">— Tijd —</option>
                      {TIJD_OPTIES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={item.act}
                      onChange={(e) => updateProgrammaRow(datum, index, "act", e.target.value)}
                      placeholder="Band / DJ / act"
                      className="plein-edit__programma-act"
                    />
                    <button
                      type="button"
                      onClick={() => removeProgrammaRow(datum, index)}
                      className="facturen-btn facturen-btn--ghost facturen-btn--tiny plein-edit__programma-remove"
                      disabled={(programData[datum]?.items?.length ?? 0) <= 1}
                    >
                      Verwijder
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addProgrammaRow(datum)} className="facturen-btn facturen-btn--ghost facturen-btn--tiny plein-edit__programma-add">
                  + Rij toevoegen
                </button>
              </div>
            )}
          </fieldset>
        ))}
      </section>

      <section className="invoice-form__section">
        <h2>Afbeeldingen</h2>
        <p className="facturen-panel__intro plein-edit__section-intro">
          Maximaal {MAX_IMAGES} afbeeldingen. Volgorde kun je met de pijlen aanpassen; wijzigingen worden na opslaan zichtbaar op de site.
        </p>
        <div className="plein-edit__images">
          {imageSlots.map((slot, i) => (
            <div key={i} className="plein-edit__image-slot">
              {(slot.url || slot.file) && (
                <div className="plein-edit__preview">
                  {slot.file ? (
                    <span>Nieuw: {slot.file.name}</span>
                  ) : (
                    <img src={slot.url} alt={`Plein ${i + 1}`} />
                  )}
                </div>
              )}
              <div className="plein-edit__file-row">
                <label className="plein-edit__file-label facturen-btn facturen-btn--ghost facturen-btn--tiny">
                  <input
                    type="file"
                    accept="image/*"
                    className="plein-edit__file-input"
                    onChange={(e) => {
                      setSlotFile(i, e.currentTarget.files?.[0] ?? null);
                    }}
                  />
                  <span className="plein-edit__file-label-text">{slot.file ? "Ander bestand" : "Bestand kiezen"}</span>
                </label>
              </div>
              <div className="plein-edit__image-actions">
                <button
                  type="button"
                  onClick={() => swapImageSlots(i, i - 1)}
                  className="facturen-btn facturen-btn--ghost facturen-btn--tiny plein-edit__image-btn"
                  disabled={i === 0}
                  title="Wissel met vorige"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => swapImageSlots(i, i + 1)}
                  className="facturen-btn facturen-btn--ghost facturen-btn--tiny plein-edit__image-btn"
                  disabled={i === imageSlots.length - 1}
                  title="Wissel met volgende"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={() => removeImageSlot(i)}
                  className="facturen-btn facturen-btn--danger facturen-btn--tiny plein-edit__image-btn plein-edit__image-btn--remove"
                  title="Verwijderen (ook van server na opslaan)"
                >
                  Verwijder
                </button>
              </div>
            </div>
          ))}
        </div>
        {imageSlots.length < MAX_IMAGES && (
          <button type="button" onClick={addImageSlot} className="facturen-btn facturen-btn--ghost facturen-btn--tiny plein-edit__programma-add">
            + Afbeelding toevoegen
          </button>
        )}
      </section>

      <div className="invoice-form__footer plein-edit__footer">
        <button type="submit" className="facturen-btn facturen-btn--primary plein-edit__submit" disabled={saving}>
          {saving ? "Opslaan…" : "Opslaan"}
        </button>
      </div>
    </form>
  );
}
