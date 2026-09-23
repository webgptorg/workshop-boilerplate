import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
const INTER = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});
const OUTFIT = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
});
export const metadata: Metadata = {
  title: "Společný stůl · Týdenní jídelníček",
  description: "Školní jídelníček, výběr obědů a náměty pro jídelnu.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="cs">
      <body className={`${INTER.variable} ${OUTFIT.variable}`}>{children}</body>
    </html>
  );
}
