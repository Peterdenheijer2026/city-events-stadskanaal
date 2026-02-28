import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PLEINEN, PLEIN_SLUGS } from "@/lib/pleinen";
import {
  PROGRAMMA_DATUM_26,
  PROGRAMMA_DATUM_27,
  PROGRAMMA_LABELS,
  parseProgrammaData,
} from "@/lib/programma-types";
import PleinenDropdown from "@/app/components/PleinenDropdown";

export default async function PleinPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  if (!PLEIN_SLUGS.includes(slug)) notFound();

  const plein = PLEINEN.find((p) => p.slug === slug);
  if (!plein) notFound();

  const supabase = await createClient();
  const { data: content } = await supabase
    .from("plein_content")
    .select("general_text, program_data, image_paths")
    .eq("plein_slug", slug)
    .single();

  const images = ((content?.image_paths ?? []) as string[]).filter(
    (url): url is string => typeof url === "string" && url.length > 0 && (url.startsWith("http://") || url.startsWith("https://"))
  );
  const programData = parseProgrammaData(content?.program_data);
  const hasProgramData =
    (programData[PROGRAMMA_DATUM_26]?.enabled && (programData[PROGRAMMA_DATUM_26]?.items?.length ?? 0) > 0) ||
    (programData[PROGRAMMA_DATUM_27]?.enabled && (programData[PROGRAMMA_DATUM_27]?.items?.length ?? 0) > 0);

  return (
    <div className="plein-page">
      <header className="header">
        <Link
          href="/"
          className="header__logo"
          aria-label="Naar hoofdpagina City Events Stadskanaal"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo.png" alt="City Events Stadskanaal" />
        </Link>
        <div className="header__brand">
          <span className="header__brand-main">{plein.name}</span>
        </div>
        <PleinenDropdown />
      </header>

      <main className="plein-page__main">
        {/* Tekst + alle foto's samen boven het programma; foto's speels naast de tekst, hoogte volgt tekst */}
        {(images.length > 0 || content?.general_text) && (
          <section className="plein-page__content">
            {content?.general_text && (
              <div
                className="plein-page__vak plein-page__vak--tekst plein-page__content-text"
                dangerouslySetInnerHTML={{ __html: content.general_text.replace(/\n/g, "<br />") }}
              />
            )}
            {images.length > 0 && (
              <div className="plein-page__content-photos" data-count={images.length}>
                {images.map((url, i) => (
                  <div key={i} className="plein-page__vak plein-page__vak--foto" data-index={i}>
                    <img src={url} alt={`${plein.name} ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Programma daaronder */}
        {hasProgramData && (
          <section className="plein-page__program-vak">
            <h2 className="plein-page__program-title">Programma</h2>
            {programData[PROGRAMMA_DATUM_26]?.enabled &&
              (programData[PROGRAMMA_DATUM_26]?.items?.length ?? 0) > 0 && (
                <div className="plein-page__program-datum">
                  <h3>{PROGRAMMA_LABELS[PROGRAMMA_DATUM_26]}</h3>
                  <ul className="plein-page__program-list">
                    {programData[PROGRAMMA_DATUM_26]!.items
                      .filter((it) => it.time || it.act)
                      .map((item, i) => (
                        <li key={i}>
                          {item.time && <span className="plein-page__program-time">{item.time}</span>}
                          {item.time && item.act && " — "}
                          {item.act}
                        </li>
                      ))}
                  </ul>
                </div>
            )}
            {programData[PROGRAMMA_DATUM_27]?.enabled &&
              (programData[PROGRAMMA_DATUM_27]?.items?.length ?? 0) > 0 && (
                <div className="plein-page__program-datum">
                  <h3>{PROGRAMMA_LABELS[PROGRAMMA_DATUM_27]}</h3>
                  <ul className="plein-page__program-list">
                    {programData[PROGRAMMA_DATUM_27]!.items
                      .filter((it) => it.time || it.act)
                      .map((item, i) => (
                        <li key={i}>
                          {item.time && <span className="plein-page__program-time">{item.time}</span>}
                          {item.time && item.act && " — "}
                          {item.act}
                        </li>
                      ))}
                  </ul>
                </div>
            )}
          </section>
        )}

        {!content?.general_text && !hasProgramData && images.length === 0 && (
          <p className="plein-page__empty">Nog geen content voor dit plein.</p>
        )}
      </main>

      <footer className="plein-page__footer">
        <Link href="/">City Events Stadskanaal</Link>
      </footer>
    </div>
  );
}
