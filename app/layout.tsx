import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#F5F0E8",
};

export const metadata: Metadata = {
  title: "Brickme — Bouw wat je niet kunt zeggen",
  description:
    "Een persoonlijke reflectiesessie waarbij je bouwt, fotografeert en een reflectie van Brickme ontvangt. Voor mensen op een kruispunt.",
  keywords: ["zelfreflectie", "coaching", "persoonlijke ontwikkeling", "burn-out", "relatie"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Brickme",
  },
  openGraph: {
    title: "Brickme — Bouw wat je niet kunt zeggen",
    description: "Een nieuwe manier van zelfreflectie. Bouw, fotografeer, begrijp.",
    type: "website",
    locale: "nl_NL",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
