export const metadata = {
  title: "Beheer – City Events Stadskanaal",
  description: "Beheerdersomgeving voor pleinpagina's.",
};

export default function BeheerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="beheer-layout">
      {children}
    </div>
  );
}
