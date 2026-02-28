const TICKER_TEXT = ["Eventnaam", "DD.MM.JJJJ", "Locatie"] as const;

type TickerProps = {
  alt?: boolean;
};

export default function Ticker({ alt = false }: TickerProps) {
  const track = (
    <>
      {TICKER_TEXT.map((item, i) => (
        <span key={`${item}-${i}`}>
          <span className="ticker__item">{item}</span>
          <span className="ticker__dot">•</span>
        </span>
      ))}
      {TICKER_TEXT.map((item, i) => (
        <span key={`dup-${item}-${i}`}>
          <span className="ticker__item">{item}</span>
          <span className="ticker__dot">•</span>
        </span>
      ))}
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
