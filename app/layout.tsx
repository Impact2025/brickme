import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import Script from "next/script";
import AssistentChat from "@/components/AssistentChat";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

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
    siteName: "Brickme",
    images: [{ url: "https://brickme.nl/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Brickme — Bouw wat je niet kunt zeggen",
    description: "Een nieuwe manier van zelfreflectie. Bouw, fotografeer, begrijp.",
    images: ["https://brickme.nl/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <SessionProvider>
          {children}
          <AssistentChat />
        </SessionProvider>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-647VHR1NK5"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-647VHR1NK5');
          `}
        </Script>
      </body>
    </html>
  );
}
