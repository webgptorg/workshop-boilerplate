import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Společný stůl · Týdenní jídelníček",
  description: "Školní jídelníček, výběr obědů a náměty pro jídelnu.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
