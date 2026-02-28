import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  title: "City Events Stadskanaal – Knoalsternacht & Koningsdag",
  description:
    "Stichting City Event organiseert Knoalsternacht en Koningsdag in Stadskanaal.",
  icons: {
    icon: "/assets/logo.png",
  },
  openGraph: {
    title: "City Events Stadskanaal – Knoalsternacht & Koningsdag",
    description:
      "Stichting City Event organiseert Knoalsternacht en Koningsdag in Stadskanaal.",
    type: "website",
  },
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
