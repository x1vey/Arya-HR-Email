"use client";

import { ELEMENT_PALETTE, type PaletteItem } from "@/lib/blocks/palette";

interface ElementsPanelProps {
  onAdd: (item: PaletteItem) => void;
}

/**
 * Canva-style element library. Click a card to drop that block into the
 * email (inserted after the current selection).
 */
export function ElementsPanel({ onAdd }: ElementsPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold text-ink">Elements</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Click any element to add it to your email.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ELEMENT_PALETTE.map((item) => (
          <button
            key={item.key}
            onClick={() => onAdd(item)}
            className="group flex flex-col items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-brand hover:shadow-panel"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-light text-brand transition group-hover:bg-brand group-hover:text-white [&_svg]:h-5 [&_svg]:w-5"
              dangerouslySetInnerHTML={{ __html: item.icon }}
            />
            <span>
              <span className="block text-sm font-medium text-ink">{item.label}</span>
              <span className="block text-[11px] text-muted">{item.hint}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
