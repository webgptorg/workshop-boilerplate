import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voxel world",
  description: "A small first-person voxel world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <html lang="en"><body>{children}</body></html>;
}
