import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kies jouw thema — Brickme",
  description:
    "Welk levensthema speelt er bij jou? Kies een van de 6 thema's en start je persoonlijke reflectiesessie met LEGO en AI.",
  alternates: { canonical: "https://brickme.nl/start" },
  openGraph: {
    title: "Kies jouw thema — Brickme",
    description:
      "Welk levensthema speelt er bij jou? Kies een van de 6 thema's en start je persoonlijke reflectiesessie met LEGO en AI.",
    url: "https://brickme.nl/start",
    type: "website",
  },
};

export default function StartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
