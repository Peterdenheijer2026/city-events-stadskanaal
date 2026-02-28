import "./globals.css";

export const metadata = {
  title: "City Events Stadskanaal – Knoalsternacht & Koningsdag",
  description:
    "Stichting City Event organiseert Knoalsternacht en Koningsdag in Stadskanaal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
