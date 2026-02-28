export const PROGRAMMA_DATUM_26 = "2026-04-26";
export const PROGRAMMA_DATUM_27 = "2026-04-27";

export type ProgrammaItem = { time: string; act: string };
export type ProgrammaDatum = { enabled: boolean; items: ProgrammaItem[] };
export type ProgrammaData = {
  [PROGRAMMA_DATUM_26]?: ProgrammaDatum;
  [PROGRAMMA_DATUM_27]?: ProgrammaDatum;
};

export type ProgrammaDatumKey = keyof ProgrammaData;

export const DEFAULT_PROGRAMMA: ProgrammaData = {
  [PROGRAMMA_DATUM_26]: { enabled: false, items: [{ time: "", act: "" }] },
  [PROGRAMMA_DATUM_27]: { enabled: false, items: [{ time: "", act: "" }] },
};

export function parseProgrammaData(raw: unknown): ProgrammaData {
  if (!raw || typeof raw !== "object") return DEFAULT_PROGRAMMA;
  const o = raw as Record<string, unknown>;
  const d26 = o[PROGRAMMA_DATUM_26];
  const d27 = o[PROGRAMMA_DATUM_27];
  return {
    [PROGRAMMA_DATUM_26]: parseDatum(d26) ?? DEFAULT_PROGRAMMA[PROGRAMMA_DATUM_26],
    [PROGRAMMA_DATUM_27]: parseDatum(d27) ?? DEFAULT_PROGRAMMA[PROGRAMMA_DATUM_27],
  };
}

function parseDatum(d: unknown): ProgrammaDatum | null {
  if (!d || typeof d !== "object") return null;
  const x = d as Record<string, unknown>;
  const enabled = Boolean(x.enabled);
  const items = Array.isArray(x.items)
    ? (x.items as unknown[]).map((it) => {
        const i = it && typeof it === "object" ? (it as Record<string, unknown>) : {};
        return { time: String(i.time ?? ""), act: String(i.act ?? "") };
      })
    : [];
  return { enabled, items: items.length ? items : [{ time: "", act: "" }] };
}

export const PROGRAMMA_LABELS: Record<string, string> = {
  [PROGRAMMA_DATUM_26]: "Programma 26-04-2026",
  [PROGRAMMA_DATUM_27]: "Programma 27-04-2026",
};
