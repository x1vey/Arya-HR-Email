"use client";

import { ELEMENT_PALETTE, type PaletteItem } from "@/lib/blocks/palette";

interface ElementsPanelProps {
  onAdd: (item: PaletteItem) => void;
  onDragStart: (item: PaletteItem) => void;
  onDragEnd: () => void;
}

/**
 * Canva-style element library. Click a card to append the block, or drag it
 * onto the canvas to drop it exactly where you want.
 */
export function ElementsPanel({ onAdd, onDragStart, onDragEnd }: ElementsPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold text-ink">Elements</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Click to add, or drag onto the email.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ELEMENT_PALETTE.map((item) => (
          <button
            key={item.key}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "copy";
              e.dataTransfer.setData("text/plain", item.key);
              onDragStart(item);
            }}
            onDragEnd={onDragEnd}
            onClick={() => onAdd(item)}
            className="group flex cursor-grab flex-col items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-brand hover:shadow-panel active:cursor-grabbing"
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

      <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2.5 text-[11px] leading-relaxed text-muted">
        <div className="mb-1 font-semibold text-slate-500">Shortcuts</div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          <span>⌫ Delete</span>
          <span>⌘/Ctrl+D Duplicate</span>
          <span>⌘/Ctrl+Z Undo</span>
          <span>⌘/Ctrl+⇧Z Redo</span>
          <span>↑ / ↓ Move</span>
          <span>⌘/Ctrl+C / V Copy</span>
        </div>
      </div>
    </div>
  );
}
