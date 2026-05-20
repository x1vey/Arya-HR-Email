"use client";

import type { Template } from "@/lib/blocks/types";

interface TemplateSwitcherProps {
  templates: Template[];
  activeId: string;
  onSwitch: (id: string) => void;
}

export function TemplateSwitcher({ templates, activeId, onSwitch }: TemplateSwitcherProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto max-w-[60vw] no-scrollbar">
      <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted mr-1">
        Template:
      </span>
      {templates.map((t) => (
        <button
          key={t.id}
          onClick={() => onSwitch(t.id)}
          className={`shrink-0 whitespace-nowrap rounded-md border px-3 py-1.5 text-sm transition ${
            t.id === activeId
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          }`}
        >
          {t.name}
        </button>
      ))}
    </div>
  );
}
