"use client";

import type { Template } from "@/lib/blocks/types";

interface TemplateGalleryProps {
  templates: Template[];
  activeId: string;
  onSwitch: (id: string) => void;
}

/**
 * Visual template picker that replaces the plain dropdown — a scrollable
 * column of preview cards, each showing a miniature of the email built
 * from the template's own blocks.
 */
export function TemplateGallery({ templates, activeId, onSwitch }: TemplateGalleryProps) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold text-ink">Templates</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Pick a starting point. Switching replaces the current design.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {templates.map((t) => {
          const active = t.id === activeId;
          return (
            <button
              key={t.id}
              onClick={() => onSwitch(t.id)}
              className={`group overflow-hidden rounded-xl border text-left transition ${
                active
                  ? "border-brand ring-2 ring-brand/20"
                  : "border-slate-200 hover:border-brand/60 hover:shadow-panel"
              }`}
            >
              <div className="relative h-28 overflow-hidden bg-slate-50">
                <Thumbnail template={t} />
                {active && (
                  <span className="absolute right-2 top-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">
                    Active
                  </span>
                )}
              </div>
              <div className="border-t border-slate-100 bg-white px-3 py-2">
                <div className="truncate text-sm font-medium text-ink">{t.name}</div>
                <div className="text-[11px] capitalize text-muted">{t.category}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * A lightweight schematic thumbnail. Rather than rendering full email HTML
 * (heavy, and clipping is awkward in a small box), draw a stack of bars that
 * mirror the block sequence, color-keyed by block type.
 */
function Thumbnail({ template }: { template: Template }) {
  return (
    <div className="flex h-full flex-col gap-1.5 p-3">
      {template.blocks.slice(0, 6).map((b) => (
        <div
          key={b.id}
          className="rounded-sm"
          style={barStyle(b.type)}
        />
      ))}
    </div>
  );
}

function barStyle(type: string): React.CSSProperties {
  const t = type.toLowerCase();
  if (t.includes("header")) return { height: 14, background: "#7C3AED", borderRadius: 3 };
  if (t.includes("hero")) return { height: 22, background: "#C4B5FD", borderRadius: 3 };
  if (t.includes("image")) return { height: 26, background: "#DDD6FE", borderRadius: 3 };
  if (t.includes("button")) return { height: 10, width: "45%", background: "#A78BFA", borderRadius: 3 };
  if (t.includes("footer")) return { height: 8, background: "#E2E8F0", borderRadius: 3 };
  return { height: 8, background: "#EDE9FE", borderRadius: 3 };
}
