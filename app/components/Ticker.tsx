/* Elk woord/datum apart, met puntje ertussen */
const TICKER_PARTS = [
  "Knoalsternacht",
  "26-04-2026",
  "Stadskanaal",
  "Koningsdag",
  "27-04-2026",
  "Stadskanaal",
] as const;

const REPEAT = 12; /* vul de ticker en zorg voor naadloze loop */

type TickerProps = {
  alt?: boolean;
};

export default function Ticker({ alt = false }: TickerProps) {
  /* Woord en puntje als aparte track-items → puntje precies midden tussen woorden (gelijke gap) */
  const track = (
    <>
      {Array.from({ length: REPEAT }, (_, repIdx) =>
        TICKER_PARTS.flatMap((part, i) => [
          <span key={`${repIdx}-${i}-t`} className="ticker__item">{part}</span>,
          <span key={`${repIdx}-${i}-d`} className="ticker__dot" aria-hidden>•</span>,
        ])
      )}
    </>
  );

  return (
    <div
      className={`ticker ${alt ? "ticker--alt" : ""}`}
      aria-hidden="true"
    >
      <div className="ticker__wrap">
        <div className="ticker__track">{track}</div>
      </div>
    </div>
  );
}
