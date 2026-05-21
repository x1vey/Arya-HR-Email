"use client";

import type { Template } from "@/lib/blocks/types";
import { BLANK_TEMPLATE_ID } from "@/lib/templates";

interface TemplateGalleryProps {
  templates: Template[];
  activeId: string;
  onSwitch: (id: string) => void;
  onOpenAi?: () => void;
}

export function TemplateGallery({ templates, activeId, onSwitch, onOpenAi }: TemplateGalleryProps) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold text-ink">Templates</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Pick a starting point. Switching replaces the current design.
        </p>
      </div>

      {/* Generate with AI */}
      {onOpenAi && (
        <button
          onClick={onOpenAi}
          className="flex items-center gap-3 rounded-xl border-2 border-dashed border-brand/30 bg-brand-light/40 p-3 text-left transition hover:border-brand hover:bg-brand-light/60"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-gradient">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink">Generate with AI</span>
            <span className="block text-[11px] text-muted">Describe your email, get a ready-to-edit template</span>
          </span>
        </button>
      )}

      {/* Start from scratch */}
      <button
        onClick={() => onSwitch(BLANK_TEMPLATE_ID)}
        className={`flex items-center gap-3 rounded-xl border-2 border-dashed p-3 text-left transition ${
          activeId === BLANK_TEMPLATE_ID
            ? "border-brand bg-brand-light/50"
            : "border-brand-pale hover:border-brand/40 hover:bg-brand-light/30"
        }`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-xl font-bold text-white">
          +
        </span>
        <span>
          <span className="block text-sm font-semibold text-ink">Start from scratch</span>
          <span className="block text-[11px] text-muted">Blank canvas — add your own elements</span>
        </span>
      </button>

      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">Or pick a template</div>

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
                  : "border-brand-pale hover:border-brand/40 hover:shadow-panel"
              }`}
            >
              <div className="relative h-28 overflow-hidden bg-brand-light/30">
                <Thumbnail template={t} />
                {active && (
                  <span className="absolute right-2 top-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">
                    Active
                  </span>
                )}
              </div>
              <div className="border-t border-brand-pale bg-white px-3 py-2">
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
  if (t.includes("header")) return { height: 14, background: "#4F6B4A", borderRadius: 3 };
  if (t.includes("hero")) return { height: 22, background: "#5D7B5D", borderRadius: 3 };
  if (t.includes("image")) return { height: 26, background: "#CFDCC4", borderRadius: 3 };
  if (t.includes("button")) return { height: 10, width: "45%", background: "#7A8474", borderRadius: 3 };
  if (t.includes("footer")) return { height: 8, background: "#DDE3D2", borderRadius: 3 };
  return { height: 8, background: "#EAEEE2", borderRadius: 3 };
}
