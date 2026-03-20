/** Samenvatting voor boekhouding-overzicht en CSV-export (geen server action). */
export type BookkeepingSummary = {
  debiteurenOpen: number;
  crediteurenOpen: number;
  nettoLiquide: number;
  debiteurenBetaaldYtd: number;
  crediteurenBetaaldYtd: number;
  openDebiteurenAantal: number;
  openCrediteurenAantal: number;
  btwVerkopenYtd: number;
  btwInkoopYtd: number;
  btwSaldoIndicatief: number;
  maandOverzicht: {
    maandKey: string;
    maandLabel: string;
    debiteurenBetaald: number;
    crediteurenBetaald: number;
    netto: number;
  }[];
};

/** CSV-export voor Excel (NL: puntkomma, UTF-8 met BOM). */
export function buildBookkeepingCsv(summary: BookkeepingSummary): string {
  const lines: string[] = [];
  const esc = (n: number) => String(n).replace(".", ",");
  lines.push("Boekhouding City Events Stadskanaal — export");
  lines.push(`Samenvatting;${new Date().toLocaleString("nl-NL")}`);
  lines.push(`Te ontvangen debiteuren;${esc(summary.debiteurenOpen)}`);
  lines.push(`Te betalen crediteuren;${esc(summary.crediteurenOpen)}`);
  lines.push(`Netto openstaand;${esc(summary.nettoLiquide)}`);
  lines.push(`Openstaande facturen (aantal);${summary.openDebiteurenAantal}`);
  lines.push(`Openstaande crediteuren (aantal);${summary.openCrediteurenAantal}`);
  lines.push(`Ontvangen debiteuren YTD;${esc(summary.debiteurenBetaaldYtd)}`);
  lines.push(`Betaalde crediteuren YTD;${esc(summary.crediteurenBetaaldYtd)}`);
  lines.push(`BTW verkopen YTD (indicatief);${esc(summary.btwVerkopenYtd)}`);
  lines.push(`BTW inkoop / voorbelasting YTD (indicatief);${esc(summary.btwInkoopYtd)}`);
  lines.push(`BTW-saldo indicatief;${esc(summary.btwSaldoIndicatief)}`);
  lines.push("");
  lines.push("Mutaties per maand (betaald)");
  lines.push("Periode;Debiteuren ontvangen;Crediteuren betaald;Netto");
  for (const m of summary.maandOverzicht) {
    lines.push(`${m.maandLabel};${esc(m.debiteurenBetaald)};${esc(m.crediteurenBetaald)};${esc(m.netto)}`);
  }
  return "\uFEFF" + lines.join("\r\n");
}
