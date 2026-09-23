import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { SessionProvider } from "@/auth/SessionProvider";
import { AppDataProvider } from "@/hooks/AppDataProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Společný stůl",
  description: "Jídelníček školní jídelny pro žáky, rodiče a kuchyni.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="cs">
      <body className={`${inter.variable} ${outfit.variable}`}>
        <SessionProvider>
          <AppDataProvider>{children}</AppDataProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
