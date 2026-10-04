// ./src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ForestProvider } from "@/components/forest/provider";
import Navigation from "@/components/navigation";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tabaktan Ormana | Yaşayan Okul Ormanı",
  description:
    "Zero Carbon SP sürdürülebilirlik projesi: Haftalık karbon emisyonu liderlik tablosu ile öğrencileri ödüllendirerek çevre bilincini artırıyoruz. Atık takibi ve karbon ayak izi azaltma.",
  keywords: [
    "Sıfır Karbon Okul Projesi",
    "İTÜ GVO İzmir Okulları",
    "Karbon Ayak İzi",
    "CO2 Emisyonu Takibi",
    "Sürdürülebilirlik Projesi",
    "Gıda Atığı Azaltma",
    "Öğrenci Liderlik Tablosu",
    "Çevre Bilinci",
    "Zero Carbon School Project",
  ],
  openGraph: {
    title: "Tabaktan Ormana | Yaşayan Okul Ormanı",
    description:
      "İTÜ GVO İzmir Okulları'nın sürdürülebilirlik projesi: Haftalık karbon emisyonu liderlik tablosu ile öğrencileri ödüllendirerek çevre bilincini artırıyoruz. Atık takibi ve karbon ayak izi azaltma.",
    url: "www.zerocarbonsp.com", // Update with the actual URL
    siteName: "Zero Carbon SP",
    images: [
      {
        url: "/logo.svg", // Using the logo as a fallback
        width: 800,
        height: 600,
        alt: "Sıfır Karbon Okul Projesi Logosu",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <link rel="icon" href="/logo.svg" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ForestProvider>
          <Navigation />
          {children}
          <footer className="forest-footer">
            <span>Tabaktan Ormana</span>
            <Link href="/about">Hakkımızda</Link>
          </footer>
        </ForestProvider>
      </body>
    </html>
  );
}
