// ./src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sıfır Karbon Okul Projesi",
  description: "Zero Carbon SP sürdürülebilirlik projesi: Haftalık karbon emisyonu liderlik tablosu ile öğrencileri ödüllendirerek çevre bilincini artırıyoruz. Atık takibi ve karbon ayak izi azaltma.",
  keywords: [
    "Sıfır Karbon Okul Projesi", 
    "İTÜ GVO İzmir Okulları", 
    "Karbon Ayak İzi", 
    "CO2 Emisyonu Takibi", 
    "Sürdürülebilirlik Projesi", 
    "Gıda Atığı Azaltma",
    "Öğrenci Liderlik Tablosu",
    "Çevre Bilinci",
    "Zero Carbon School Project" 
  ],
  openGraph: {
    title: "İTÜ GVO Sıfır Karbon Okul Projesi | Liderlik",
    description: "İTÜ GVO İzmir Okulları'nın sürdürülebilirlik projesi: Haftalık karbon emisyonu liderlik tablosu ile öğrencileri ödüllendirerek çevre bilincini artırıyoruz. Atık takibi ve karbon ayak izi azaltma.",
    url: 'www.zerocarbonsp.com', // Update with the actual URL
    siteName: 'Zero Carbon SP',
    images: [
        {
            url: '/logo.svg', // Using the logo as a fallback
            width: 800,
            height: 600,
            alt: 'Sıfır Karbon Okul Projesi Logosu',
        },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr"> {/* Changed language to Turkish for better SEO targeting */}
      <link rel="icon" href="/logo.svg" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        {children}
        <footer className="w-full mt-12 border-t border-border py-4 text-center text-xs text-muted-foreground bg-card">
          All rights reserved. &copy; 2025 Zero Carbon SP.
        </footer>
      </body>
    </html>
  );
}