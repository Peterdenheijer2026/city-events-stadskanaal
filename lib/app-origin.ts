/**
 * Basis-URL voor absolute links (logo in PDF, etc.).
 * Zet in productie: NEXT_PUBLIC_SITE_URL=https://jouwdomein.nl
 */
export function getAppOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;
  return "http://localhost:3000";
}
