"use client";

import { useMemo, useRef, useEffect } from "react";
import type { Template } from "@/lib/blocks/types";
import { renderTemplate } from "@/lib/blocks/render";

export type BlockAction = "up" | "down" | "duplicate" | "delete";

interface PreviewPaneProps {
  template: Template;
  variables: Record<string, unknown>;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onAction: (action: BlockAction, blockId: string) => void;
}

/**
 * Renders the full email inside an isolated iframe so its CSS doesn't bleed
 * into the editor chrome. The renderer marks each block's outer element
 * with `data-block-id`, so click-to-select works for arbitrary HTML — both
 * table-based emails and modern div-based designs. The selected block gets a
 * Canva-style floating toolbar (move/duplicate/delete) drawn over it inside
 * the iframe.
 */
export function PreviewPane({
  template,
  variables,
  selectedBlockId,
  onSelectBlock,
  onAction
}: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const selectedMeta = useMemo(() => {
    const idx = template.blocks.findIndex((b) => b.id === selectedBlockId);
    if (idx === -1) return null;
    const b = template.blocks[idx];
    return {
      id: b.id,
      locked: Boolean(b.locked),
      isFirst: idx === 0,
      isLast: idx === template.blocks.length - 1
    };
  }, [template.blocks, selectedBlockId]);

  const html = useMemo(() => {
    const base = renderTemplate(template, variables);
    return decorateForSelection(base, selectedMeta);
  }, [template, variables, selectedMeta]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const d = e.data;
      if (!d || typeof d !== "object") return;
      if (d.type === "block-click") {
        onSelectBlock(d.blockId);
      } else if (d.type === "block-action") {
        onAction(d.action as BlockAction, d.blockId);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onSelectBlock, onAction]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 text-xs text-muted">
        <span>Click any section to select · use the floating toolbar to reorder, duplicate or remove</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500">
          600px · email-safe
        </span>
      </div>
      <div className="flex-1 overflow-auto bg-[#E9E6F5] p-8">
        <iframe
          ref={iframeRef}
          title="Email preview"
          srcDoc={html}
          className="mx-auto block h-[calc(100vh-180px)] w-full max-w-[680px] rounded-xl2 border border-slate-200 bg-white shadow-float"
        />
      </div>
    </div>
  );
}

interface SelectedMeta {
  id: string;
  locked: boolean;
  isFirst: boolean;
  isLast: boolean;
}

/**
 * Inject a script that attaches click/hover listeners to every
 * [data-block-id] element, posting a message back to the parent on click,
 * highlighting the selected block, and rendering a floating action toolbar
 * (move up/down, duplicate, delete) anchored to the selected block.
 */
function decorateForSelection(html: string, selected: SelectedMeta | null): string {
  const selJson = JSON.stringify(selected);
  const script = `
<script>
(function() {
  var sel = ${selJson};
  var selectedId = sel ? sel.id : null;

  function makeBtn(label, title, action, disabled) {
    return '<button data-act="' + action + '"' + (disabled ? ' data-disabled="1"' : '') +
      ' title="' + title + '" style="all:unset;cursor:' + (disabled ? 'default' : 'pointer') +
      ';display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:6px;font-size:14px;color:' +
      (disabled ? 'rgba(255,255,255,0.35)' : '#fff') + ';">' + label + '</button>';
  }

  function buildToolbar(el) {
    var bar = document.createElement('div');
    bar.id = '__arya_toolbar';
    var btns = '';
    btns += makeBtn('↑', 'Move up', 'up', sel.isFirst);
    btns += makeBtn('↓', 'Move down', 'down', sel.isLast);
    btns += makeBtn('⧉', 'Duplicate', 'duplicate', false);
    if (!sel.locked) {
      btns += makeBtn('🗑', 'Delete', 'delete', false);
    }
    bar.innerHTML = btns;
    bar.style.cssText = 'position:absolute;z-index:2147483647;display:flex;gap:2px;padding:3px;background:#15112B;border-radius:9px;box-shadow:0 4px 16px rgba(0,0,0,0.25);';
    var rect = el.getBoundingClientRect();
    var top = rect.top + window.scrollY - 38;
    if (top < 4) top = rect.top + window.scrollY + 4;
    bar.style.top = top + 'px';
    bar.style.left = (rect.right + window.scrollX - 8) + 'px';
    bar.style.transform = 'translateX(-100%)';
    bar.addEventListener('click', function(ev) {
      var b = ev.target.closest('button');
      if (!b || b.getAttribute('data-disabled')) return;
      ev.preventDefault();
      ev.stopPropagation();
      window.parent.postMessage({ type: 'block-action', action: b.getAttribute('data-act'), blockId: selectedId }, '*');
    });
    document.body.appendChild(bar);
  }

  function tag() {
    var blocks = document.querySelectorAll('[data-block-id]');
    blocks.forEach(function(el) {
      var blockId = el.getAttribute('data-block-id');
      el.style.cursor = 'pointer';
      el.style.transition = 'outline 0.15s';
      if (blockId === selectedId) {
        el.style.outline = '2px solid #7C3AED';
        el.style.outlineOffset = '-2px';
      } else {
        el.style.outline = 'none';
      }
      el.addEventListener('mouseenter', function() {
        if (blockId !== selectedId) {
          el.style.outline = '1px dashed #A78BFA';
          el.style.outlineOffset = '-1px';
        }
      });
      el.addEventListener('mouseleave', function() {
        if (blockId !== selectedId) {
          el.style.outline = 'none';
        }
      });
      el.addEventListener('click', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        window.parent.postMessage({ type: 'block-click', blockId: blockId }, '*');
      });
    });

    if (selectedId) {
      var selEl = document.querySelector('[data-block-id="' + selectedId + '"]');
      if (selEl) buildToolbar(selEl);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tag);
  } else {
    tag();
  }
})();
</script>`;
  if (html.includes("</body>")) {
    return html.replace("</body>", script + "</body>");
  }
  return html + script;
}
