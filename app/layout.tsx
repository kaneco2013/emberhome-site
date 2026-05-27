import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500"],
  variable: "--font-lora",
});

const lora = Lora({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500"],
  variable: "--font-lora",
});


export const metadata: Metadata = {
  title: "Where embers of hope remain",
  description: "A dark PvE survival game. Gather resources, build your dream castle and prepare your defenses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.className} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
