"use client";

import { useEffect, useState } from "react";
import { Download, type LucideIcon } from "lucide-react";
import { useMinute } from "./minute-provider";

interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallButton({ icon: Icon = Download }: { icon?: LucideIcon }) {
  const { t, notify } = useMinute();
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallEvent);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);
    if (window.matchMedia("(display-mode: standalone)").matches) queueMicrotask(() => setInstalled(true));
    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);
  if (installed) return null;
  return (
    <button
      onClick={async () => {
        if (prompt) {
          await prompt.prompt();
          const choice = await prompt.userChoice;
          if (choice.outcome === "accepted") setInstalled(true);
          setPrompt(null);
        } else
          notify(
            t(
              "To install Minute, use your browser’s Install app option. On iPhone: Share → Add to Home Screen.",
              "Pro instalaci použijte v prohlížeči Nainstalovat aplikaci. Na iPhonu: Sdílet → Přidat na plochu.",
            ),
          );
      }}
    >
      <Icon size={18} />
      {t("Install Minute", "Nainstalovat Minute")}
    </button>
  );
}
