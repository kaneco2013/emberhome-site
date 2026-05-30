import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import Footer from "@/app/[lang]/Footer";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${inter.variable} ${lora.variable}`}>
      <body>{children}
      <Footer />
      </body>
    </html>
  );
}


