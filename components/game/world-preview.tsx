"use client";

import { useEffect, useRef } from "react";
import type { WorldSave } from "@/lib/game/world";

export function WorldPreview({ state, name }: { state: WorldSave; name: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let cancelled = false;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      void import("@/lib/game/preview").then(({ drawWorldPreview }) => {
        if (!cancelled) drawWorldPreview(canvas, state);
      });
    }, { rootMargin: "100px" });
    observer.observe(canvas);
    return () => { cancelled = true; observer.disconnect(); };
  }, [state]);
  return <canvas ref={ref} width={760} height={470} className="world-preview" role="img" aria-label={`Isometric terrain preview of ${name}, including nearby saved builds`} />;
}
