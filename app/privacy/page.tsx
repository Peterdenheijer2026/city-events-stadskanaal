import Link from "next/link";

export const metadata = {
  title: "Privacy – City Events Stadskanaal",
  description:
    "Privacyverklaring van Stichting City Events Stadskanaal.",
};

export default function PrivacyPage() {
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
        <h1>Privacyverklaring</h1>
        <p className="legal-page__updated">
          Laatst bijgewerkt: februari 2026. Stichting City Events Stadskanaal
          hecht waarde aan uw privacy en gaat zorgvuldig om met persoonsgegevens.
        </p>

        <section>
          <h2>1. Wie wij zijn</h2>
          <p>
            Stichting City Events Stadskanaal is verantwoordelijk voor de
            verwerking van persoonsgegevens zoals in deze verklaring
            beschreven. Voor vragen kunt u contact met ons opnemen via de
            contactgegevens op de website.
          </p>
        </section>

        <section>
          <h2>2. Welke gegevens wij verwerken</h2>
          <p>
            Wij verwerken alleen persoonsgegevens die nodig zijn voor onze
            activiteiten en diensten, zoals:
          </p>
          <ul className="legal-page__list">
            <li>
              <strong>Contact:</strong> naam en e-mailadres (of andere
              contactgegevens) wanneer u contact met ons opneemt via het
              contactformulier of e-mail.
            </li>
            <li>
              <strong>Website:</strong> technische gegevens (zoals IP-adres,
              type browser) via cookies of vergelijkbare technieken, voor
              zover wij deze inzetten voor het functioneren van de site of
              analyse.
            </li>
            <li>
              <strong>Evenementen:</strong> indien u zich inschrijft voor
              activiteiten of nieuwsbrieven, verwerken wij de gegevens die u
              daarbij verstrekt.
            </li>
          </ul>
        </section>

        <section>
          <h2>3. Doel en grondslag</h2>
          <p>
            Wij verwerken persoonsgegevens op basis van uw toestemming,
            uitvoering van een overeenkomst, of een gerechtvaardigd belang
            (zoals communicatie, organisatie van evenementen en verbetering van
            onze website). Wij gebruiken uw gegevens niet voor andere doelen
            dan beschreven, tenzij u daar toestemming voor geeft of de wet dat
            toestaat.
          </p>
        </section>

        <section>
          <h2>4. Bewaartermijn</h2>
          <p>
            Wij bewaren persoonsgegevens niet langer dan nodig voor het doel
            waarvoor ze zijn verstrekt of dan de wet vereist. Contact- en
            inschrijvingsgegevens worden na afloop van de relevante
            communicatie of evenement in principe verwijderd of geanonimiseerd,
            tenzij wij ze met uw toestemming langer bewaren (bijv. voor
            nieuwsbrieven).
          </p>
        </section>

        <section>
          <h2>5. Delen met derden</h2>
          <p>
            Wij verkopen uw gegevens niet. Gegevens kunnen worden gedeeld met
            partijen die ons ondersteunen bij de organisatie (bijv. hosting,
            e-mail, ticketing), binnen de grenzen van wat daarvoor nodig is.
            Wij sluiten met zulke partijen afspraken over beveiliging en
            vertrouwelijkheid. Gegevens worden niet naar landen buiten de
            Europese Economische Ruimte overgedragen, tenzij met passende
            waarborgen.
          </p>
        </section>

        <section>
          <h2>6. Cookies en vergelijkbare technieken</h2>
          <p>
            Onze website kan cookies of vergelijkbare technieken gebruiken voor
            het goed laten functioneren van de site, voorkeuren onthouden of
            (anonieme) statistieken. U kunt cookies uitzetten via uw
            browserinstellingen; dit kan de werking van de site beperken.
          </p>
        </section>

        <section>
          <h2>7. Uw rechten</h2>
          <p>
            U heeft het recht om uw persoonsgegevens in te zien, te laten
            corrigeren of te laten verwijderen, en om bezwaar te maken of de
            verwerking te beperken. U kunt een verzoek sturen naar het
            contactadres op de website. Wij reageren binnen de termijn die de
            wet stelt. Heeft u een klacht over de verwerking van uw gegevens,
            dan kunt u zich wenden tot de Autoriteit Persoonsgegevens (AP).
          </p>
        </section>

        <section>
          <h2>8. Wijzigingen</h2>
          <p>
            Wij kunnen deze privacyverklaring wijzigen. De actuele versie staat
            op deze pagina; bij ingrijpende wijzigingen vermelden we dat op de
            website of via e-mail waar mogelijk.
          </p>
        </section>

        <p className="legal-page__contact">
          Vragen over privacy? Neem contact met ons op via de{" "}
          <Link href="/#contact">contactgegevens</Link> op de website.
        </p>
      </main>

      <footer className="legal-page__footer">
        <Link href="/">Home</Link>
        <Link href="/algemene-voorwaarden">Algemene voorwaarden</Link>
        <p className="legal-page__copy">
          &copy; {new Date().getFullYear()} Stichting City Events Stadskanaal
        </p>
      </footer>
    </div>
  );
}
