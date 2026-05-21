"use client";

import {
  ELEMENT_PALETTE,
  LAYOUT_PRESETS,
  type PaletteItem,
  type LayoutPreset
} from "@/lib/blocks/palette";

interface ElementsPanelProps {
  onAdd: (item: PaletteItem) => void;
  onAddLayout: (preset: LayoutPreset) => void;
  onDragStart: (item: PaletteItem) => void;
  onDragEnd: () => void;
}

export function ElementsPanel({ onAdd, onAddLayout, onDragStart, onDragEnd }: ElementsPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold text-ink">Elements</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Click to add, or drag onto the email.
        </p>
      </div>

      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">Layouts</div>
      <div className="grid grid-cols-2 gap-2">
        {LAYOUT_PRESETS.map((preset) => (
          <button
            key={preset.key}
            onClick={() => onAddLayout(preset)}
            className="group flex items-center gap-2 rounded-xl border border-brand-pale bg-white p-2.5 text-left transition hover:border-brand/40 hover:shadow-panel"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-light text-muted transition group-hover:bg-brand group-hover:text-white [&_svg]:h-4 [&_svg]:w-4"
              dangerouslySetInnerHTML={{ __html: preset.icon }}
            />
            <span className="min-w-0">
              <span className="block truncate text-xs font-medium text-ink">{preset.label}</span>
              <span className="block truncate text-[10px] text-muted">{preset.hint}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted">Basic blocks</div>
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
            className="group flex cursor-grab flex-col items-start gap-2 rounded-xl border border-brand-pale bg-white p-3 text-left transition hover:border-brand/40 hover:shadow-panel active:cursor-grabbing"
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

      <div className="mt-2 rounded-lg bg-brand-light px-3 py-2.5 text-[11px] leading-relaxed text-muted">
        <div className="mb-1 font-semibold text-brand-dark">Shortcuts</div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          <span>Del Delete</span>
          <span>Ctrl+D Duplicate</span>
          <span>Ctrl+Z Undo</span>
          <span>Ctrl+Shift+Z Redo</span>
          <span>Arrow Move</span>
          <span>Ctrl+C / V Copy</span>
        </div>
      </div>
    </div>
  );
}
