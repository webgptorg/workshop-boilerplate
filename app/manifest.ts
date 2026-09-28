import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Minute — Meetings & todos",
    short_name: "Minute",
    description: "Good conversations. Clear next steps. Record, transcribe, and turn meetings into action.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f9fb",
    theme_color: "#181e2b",
    orientation: "any",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
