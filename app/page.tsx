import Link from "next/link";
import PleinenDropdown from "./components/PleinenDropdown";
import Ticker from "./components/Ticker";

export default function HomePage() {
  const year = new Date().getFullYear();

  return (
    <>
      <header className="header">
        <Link
          href="#home"
          className="header__logo"
          aria-label="Stichting City Events Stadskanaal – naar home"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo.png" alt="Stichting City Events Stadskanaal" />
        </Link>
        <div className="header__brand">
          <span className="header__brand-main">city events</span>
          <span className="header__brand-sub">stadskanaal</span>
        </div>
        <PleinenDropdown />
      </header>

      <main>
        <section id="home" className="hero">
          <div className="hero__video">
            <video
              className="hero__video-el"
              autoPlay
              muted
              loop
              playsInline
              aria-hidden
              id="hero-video"
            >
              <source src="/video/hero.mp4" type="video/mp4" />
              <source src="/video/hero.webm" type="video/webm" />
            </video>
            <span className="hero__video-overlay" />
          </div>
          <div className="hero__content">
            <p className="hero__location">
              <span className="hero__location-text">
                Knoalsternacht/Koningsdag
              </span>
              <span className="hero__location-year">2026</span>
            </p>
            <div className="hero__buttons">
              <div className="hero__buttons-row">
                <Link href="#info" className="btn btn--primary">
                  City Events
                </Link>
                <Link href="#plattegrond" className="btn btn--secondary">
                  Plattegrond
                </Link>
              </div>
              <Link href="/knoalsternacht-dienstregeling" className="btn btn--tertiary">
                Knoalsternacht dienstregeling
              </Link>
            </div>
          </div>
          <div className="hero__ticker" aria-hidden="true">
            <Ticker />
          </div>
        </section>

        <section id="info" className="info-block">
          <Ticker alt />
          <h2 className="section-title">Stichting City Event</h2>
          <div className="info-block__inner">
            <p className="info-block__lead">
              Stichting City Event is een betrokken en actieve stichting die zich
              al jarenlang inzet voor de organisatie van Knoalsternacht en
              Koningsdag in Stadskanaal. Met veel enthousiasme en toewijding
              zorgen wij ieder jaar voor een feestelijk en gevarieerd programma
              voor jong en oud.
            </p>
            <p>
              Sinds vorig jaar is ook de vooravond aan het programma toegevoegd,
              waardoor het evenement nog uitgebreider en veelzijdiger is
              geworden.
            </p>
            <p>
              Ook dit jaar worden er verspreid door heel Stadskanaal op
              verschillende pleinen diverse activiteiten georganiseerd. Van live
              muziek en optredens tot kinderactiviteiten en gezellig samenzijn —
              er is voor iedereen iets te beleven.
            </p>
            <p className="info-block__closing">
              Samen maken we er opnieuw een prachtig feest van voor de hele
              regio.
            </p>
          </div>
        </section>

        <section id="plattegrond" className="plattegrond">
          <Ticker alt />
          <h2 className="section-title">Evenementenplattegrond</h2>
          <div className="plattegrond__image-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/plattegrond.png"
              alt="Plattegrond evenementen Stadskanaal met pleinen A t/m F, Vrijmarkt en parkeerzones P1–P4"
              className="plattegrond__image"
              loading="lazy"
            />
          </div>
        </section>

        <section id="contact" className="contact">
          <Ticker alt />
          <h2 className="section-title">Contact opnemen</h2>
          <p className="contact__text">
            Heeft u een vraag of wilt u meer informatie? Neem gerust contact
            met ons op.
          </p>
          <a
            href="mailto:info@cityeventsstadskanaal.nl"
            className="contact__email"
          >
            info@cityeventsstadskanaal.nl
          </a>
        </section>
      </main>

      <footer className="footer">
        <nav className="footer__nav">
          <ul>
            <li>
              <Link href="#home">Home</Link>
            </li>
            <li>
              <Link href="#info">Info</Link>
            </li>
            <li>
              <Link href="#plattegrond">Plattegrond</Link>
            </li>
            <li>
              <Link href="#contact">Contact</Link>
            </li>
          </ul>
        </nav>
        <div className="footer__social">
          <a
            href="https://www.facebook.com/profile.php?id=61586517177054"
            target="_blank"
            rel="noopener noreferrer"
          >
            Volg ons
          </a>
        </div>
        <p className="footer__copy">
          &copy; {year} Stichting City Events Stadskanaal
        </p>
        <p className="footer__legal">
          <Link href="/algemene-voorwaarden">Algemene voorwaarden</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/beheer/login" className="footer__beheer">Beheerders login</Link>
        </p>
      </footer>
    </>
  );
}
