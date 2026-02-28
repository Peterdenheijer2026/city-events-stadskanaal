/** Pleinen met slug voor URL en weergavenaam */
export const PLEINEN = [
  { slug: "bij-ferdy", name: "Bij Ferdy" },
  { slug: "cafe-de-2", name: "Cafe de 2" },
  { slug: "fox", name: "Fox" },
  { slug: "mamasthee", name: "Mamasthee" },
  { slug: "t-mingelmous", name: "'t Mingelmous" },
] as const;

export type PleinSlug = (typeof PLEINEN)[number]["slug"];
export type PleinItem = (typeof PLEINEN)[number];

export const PLEIN_SLUGS = PLEINEN.map((p) => p.slug);
