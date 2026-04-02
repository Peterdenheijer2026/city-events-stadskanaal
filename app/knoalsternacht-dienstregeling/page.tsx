import Link from "next/link";

export const metadata = {
  title: "Knoalsternacht dienstregeling bus – City Events Stadskanaal",
  description:
    "Extra buslijnen en frequentie tijdens de Knoalsternacht in Stadskanaal. Informatie van Qbuzz / busgd.nl.",
};

/** Zet je PDF in `public/docs/` met exact deze bestandsnaam (of pas de constante hieronder aan). */
const PDF_PATH = "/docs/knoalsternacht-buslijnen-bussgd-2026.pdf";

export default function KnoalsternachtDienstregelingPage() {
  return (
    <div className="legal-page">
      <header className="legal-page__header">
        <Link href="/" className="legal-page__back">
          ← Terug naar home
        </Link>
        <Link href="/" className="legal-page__brand" aria-label="City Events Stadskanaal – home">
          city events stadskanaal
        </Link>
      </header>

      <main className="legal-page__main">
        <h1>Knoalsternacht dienstregeling (bus)</h1>
        <p className="legal-page__updated">
          Voor bezoekers van de Knoalsternacht rijden onderstaande lijnen in de avond en nacht extra vaak.
          Communicatie: Qbuzz / busgd.nl.
        </p>

        <p>
          <a className="bus-page__pdf-btn" href={PDF_PATH} target="_blank" rel="noopener noreferrer">
            Download overzicht (PDF)
          </a>
        </p>

        <section>
          <h2>Buslijnen</h2>
          <ul className="legal-page__list bus-page__lines">
            <li>
              <strong>Lijn 14</strong> Stadskanaal – Alteveer – Onstwedde – Vlagtwedde —{" "}
              <span className="bus-page__freq">ongeveer 1× per uur</span>
            </li>
            <li>
              <strong>Lijn 24</strong> Pekela&apos;s – Stadskanaal – Buinen – Borger —{" "}
              <span className="bus-page__freq">ongeveer 1 tot 2× per uur</span>
            </li>
            <li>
              <strong>Lijn 71 / 471</strong> Stadskanaal – Veendam —{" "}
              <span className="bus-page__freq">ongeveer 1× per uur</span>
            </li>
            <li>
              <strong>Lijn 73</strong> Stadskanaal – Musselkanaal – Ter Apel —{" "}
              <span className="bus-page__freq">ongeveer 2 tot 3× per uur</span>
            </li>
            <li>
              <strong>Lijn 74</strong> Stadskanaal – Musselkanaal – Valthermond – Valthe – Emmen —{" "}
              <span className="bus-page__freq">ongeveer 1× per uur</span>
            </li>
            <li>
              <strong>Qliner 312</strong> Stadskanaal – Gasselternijveen – Gasselte – Gieten – Groningen —{" "}
              <span className="bus-page__freq">ongeveer 1× per uur</span>
            </li>
          </ul>
        </section>

        <section>
          <h2>Vertrektijden en reisplanner</h2>
          <p>
            Vertrektijden worden binnenkort zichtbaar in de verschillende reisplanners, onder meer op{" "}
            <a href="https://www.busgd.nl" target="_blank" rel="noopener noreferrer">
              busgd.nl
            </a>
            .
          </p>
        </section>

        <section>
          <h2>Betalen in de bus</h2>
          <p>
            Reizen met de Knoalster(nacht)bussen kan bijvoorbeeld door in- en uit te checken met je bankpas in de bus.
          </p>
        </section>

        <p className="legal-page__contact">
          Vragen? Zie ook{" "}
          <Link href="/#contact">contact</Link> op de homepage.
        </p>
      </main>

      <footer className="legal-page__footer">
        <Link href="/">Home</Link>
        <Link href="/privacy">Privacy</Link>
        <p className="legal-page__copy">
          &copy; {new Date().getFullYear()} Stichting City Events Stadskanaal
        </p>
      </footer>
    </div>
  );
}
