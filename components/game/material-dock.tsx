"use client";

import { useRef } from "react";
import { blocks } from "@/lib/game/blocks";

interface MaterialDockProps {
  selected: number;
  onSelect(index: number, focusCanvas?: boolean): void;
}

export function MaterialDock({ selected, onSelect }: MaterialDockProps) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const materials = blocks.buildable;

  return (
    <div className="material-dock" role="toolbar" aria-label="Building materials" aria-orientation="horizontal">
      {materials.map((material, index) => (
        <button
          key={material.id}
          ref={(element) => { buttons.current[index] = element; }}
          className="material-slot"
          type="button"
          aria-label={material.name}
          aria-pressed={index === selected}
          aria-keyshortcuts={`${index + 1}`}
          tabIndex={selected === index ? 0 : -1}
          onClick={(event) => onSelect(index, event.detail > 0)}
          onKeyDown={(event) => {
            let next = index;
            if (event.key === "ArrowRight") next = (index + 1) % materials.length;
            else if (event.key === "ArrowLeft") next = (index - 1 + materials.length) % materials.length;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = materials.length - 1;
            else return;
            event.preventDefault();
            onSelect(next);
            buttons.current[next]?.focus();
          }}
        >
          <svg className="material-swatch" viewBox="0 0 64 64" aria-hidden="true">
            <rect x="15" y="20" width="38" height="35" rx="9" fill="#24382c" opacity=".16" />
            <rect x="11" y="9" width="40" height="41" rx="10" fill={material.icon[0]} />
            <rect x="11" y="19" width="40" height="31" rx="9" fill={material.icon[2]} />
            <rect x="16" y="18" width="35" height="27" rx="7" fill={material.icon[1]} />
          </svg>
        </button>
      ))}
    </div>
  );
}
