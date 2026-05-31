import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import Footer from "@/app/(site)/[lang]/Footer";

const inter = Inter({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
});

const lora = Lora({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500"],
  variable: "--font-lora",
});

export const metadata: Metadata = {
  title: "Where embers of hope remain",
  description: "A dark PvE survival game. Gather resources, build your dream castle and prepare your defenses.",
};

// Исправление для мобильных (оставляем, оно не влияет на десктопный сдвиг)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: { lang: string } | any; 
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  // Безопасное получение lang
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || "ru";

  return (
    <html lang={lang} className={`${inter.variable} ${lora.variable}`}>
      <body className="bg-black text-white antialiased">
        {children}
        <Footer />
      </body>
    </html>
  );
}
