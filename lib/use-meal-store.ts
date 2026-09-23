"use client";
import { useEffect, useState } from "react";
import {
  INITIAL_DATA,
  STORAGE_KEY,
  isAppData,
  type AppData,
} from "./meal-model";

export function useMealStore() {
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [storageMessage, setStorageMessage] = useState("");
  useEffect(() => {
    let nextData = INITIAL_DATA;
    let nextMessage = "";
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isAppData(parsed)) nextData = parsed;
        else
          nextMessage =
            "Uložená data nejsou kompatibilní. Zobrazuje se výchozí jídelníček.";
      }
    } catch {
      nextMessage =
        "Uložená data nelze načíst. Zkontrolujte dostupnost úložiště prohlížeče.";
    }
    // Hydrate browser-only data after the server's initial render.
    const timeout = window.setTimeout(() => {
      setData(nextData);
      setStorageMessage(nextMessage);
      setIsLoaded(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);
  function updateData(update: (current: AppData) => AppData) {
    const nextData = update(data);
    setData(nextData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
      setStorageMessage("");
    } catch {
      setStorageMessage(
        "Změna je pouze v paměti. Prohlížeč nepovolil uložení; po zavření stránky se ztratí.",
      );
    }
  }
  return { data, updateData, isLoaded, storageMessage };
}
