import Link from "next/link";

export const metadata = {
  title: "Algemene voorwaarden – City Events Stadskanaal",
  description:
    "Algemene voorwaarden voor open evenementen van Stichting City Events Stadskanaal.",
};

export default function AlgemeneVoorwaardenPage() {
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
        <h1>Algemene voorwaarden</h1>
        <p className="legal-page__updated">
          Laatst bijgewerkt: februari 2026. Van toepassing op open evenementen
          georganiseerd door of namens Stichting City Events Stadskanaal.
        </p>

        <section>
          <h2>1. Toepasselijkheid</h2>
          <p>
            Deze algemene voorwaarden gelden voor deelname aan en bezoek aan
            openbare evenementen (zoals Knoalsternacht, Koningsdag en overige
            door ons georganiseerde publieksevenementen). Door deel te nemen of
            het evenemententerrein te betreden, ga je akkoord met deze
            voorwaarden.
          </p>
        </section>

        <section>
          <h2>2. Toegang en gedrag</h2>
          <p>
            Toegang tot onze evenementen is in principe vrij en open, tenzij
            anders aangekondigd. Wij behouden ons het recht voor personen de
            toegang te weigeren of te verwijderen bij ontoelaatbaar gedrag,
            overlast, of wanneer de veiligheid of de goede gang van zaken dat
            vereist. Het is verboden om zonder toestemming professionele
            opnames (film, foto, geluid) te maken voor commerciële doeleinden.
          </p>
        </section>

        <section>
          <h2>3. Veiligheid en eigen verantwoordelijkheid</h2>
          <p>
            Bezoekers en deelnemers nemen deel op eigen risico. Wij doen ons
            best om een veilige omgeving te bieden, maar zijn niet aansprakelijk
            voor schade (letsel, diefstal, verlies van eigendommen) die
            bezoekers of deelnemers tijdens of in verband met het evenement
            ondervinden, voor zover de wet dat toelaat. Volg altijd aanwijzingen
            van beveiliging, hostesses en organisatie op.
          </p>
        </section>

        <section>
          <h2>4. Alcohol, drugs en voorwerpen</h2>
          <p>
            Het is niet toegestaan eigen alcohol of drugs mee te nemen naar
            evenementen waar wij dit verbieden. Gevaarlijke of verboden
            voorwerpen zijn niet toegestaan. Wij behouden ons het recht voor
            tassen en kleding te controleren en voorwerpen in beslag te nemen of
            toegang te weigeren.
          </p>
        </section>

        <section>
          <h2>5. Annulering en wijzigingen</h2>
          <p>
            Wij behouden ons het recht voor evenementen te annuleren, te
            verplaatsen of aan te passen in verband met weersomstandigheden,
            veiligheid, overmacht of andere zwaarwegende redenen. Hieraan kunnen
            geen rechten worden ontleend, tenzij bij betaalde toegang nadere
            afspraken zijn gemaakt.
          </p>
        </section>

        <section>
          <h2>6. Foto- en filmopnames</h2>
          <p>
            Tijdens onze evenementen kunnen foto- en filmopnames worden gemaakt
            voor promotie en verslaglegging. Door deel te nemen aan het
            evenement ga je ermee akkoord dat je mogelijk op beeld vastgelegd
            wordt en dat dit materiaal (online of anderszins) kan worden
            gebruikt. Zie ook onze{" "}
            <Link href="/privacy">privacyverklaring</Link>.
          </p>
        </section>

        <section>
          <h2>7. Overige</h2>
          <p>
            Op deze voorwaarden is Nederlands recht van toepassing. Eventuele
            geschillen worden voorgelegd aan de bevoegde rechter in Nederland.
            Wij kunnen deze algemene voorwaarden wijzigen; de actuele versie
            staat op deze pagina.
          </p>
        </section>

        <p className="legal-page__contact">
          Vragen? Neem contact met ons op via de{" "}
          <Link href="/#contact">contactgegevens</Link> op de website.
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
