"use client";

import { useMemo, useRef, useEffect } from "react";
import type { Template } from "@/lib/blocks/types";
import { renderTemplate } from "@/lib/blocks/render";

export type BlockAction = "up" | "down" | "duplicate" | "delete";
export interface CanvasKey {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
}

interface PreviewPaneProps {
  template: Template;
  variables: Record<string, unknown>;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onAction: (action: BlockAction, blockId: string) => void;
  /** A palette element was dropped on the canvas, before/after a block. */
  onPaletteDrop: (targetId: string | null, position: "before" | "after") => void;
  /** A keyboard shortcut fired while focus was inside the preview iframe. */
  onCanvasKey: (k: CanvasKey) => void;
  /** True while a palette element is being dragged (highlights the canvas). */
  dropActive: boolean;
}

/**
 * Renders the full email inside an isolated iframe so its CSS doesn't bleed
 * into the editor chrome. The renderer marks each block's outer element
 * with `data-block-id`, so click-to-select works for arbitrary HTML. The
 * selected block gets a floating toolbar; the iframe also reports drag-drop
 * of new elements and forwards keyboard shortcuts to the parent (key events
 * inside an iframe don't reach the parent window otherwise).
 */
export function PreviewPane({
  template,
  variables,
  selectedBlockId,
  onSelectBlock,
  onAction,
  onPaletteDrop,
  onCanvasKey,
  dropActive
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
      } else if (d.type === "palette-drop") {
        onPaletteDrop(d.targetId ?? null, d.position === "before" ? "before" : "after");
      } else if (d.type === "key") {
        onCanvasKey({
          key: d.key,
          metaKey: !!d.metaKey,
          ctrlKey: !!d.ctrlKey,
          shiftKey: !!d.shiftKey
        });
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onSelectBlock, onAction, onPaletteDrop, onCanvasKey]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 text-xs text-muted">
        <span>Click to select · drag elements in · ⌫ delete · ⌘Z undo · ↑↓ move</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500">600px · email-safe</span>
      </div>
      <div className="flex-1 overflow-auto bg-[#E9E6F5] p-8">
        <iframe
          ref={iframeRef}
          title="Email preview"
          srcDoc={html}
          className={`mx-auto block h-[calc(100vh-180px)] w-full max-w-[680px] rounded-xl2 border bg-white shadow-float transition ${
            dropActive ? "border-brand ring-2 ring-brand" : "border-slate-200"
          }`}
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
 * Inject the in-iframe behaviour: click-to-select, hover outlines, the
 * floating action toolbar on the selected block, drag-and-drop insertion of
 * new elements (with a drop indicator), and keyboard-shortcut forwarding.
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

  function blockFrom(node) {
    while (node && node !== document.body) {
      if (node.getAttribute && node.getAttribute('data-block-id')) return node;
      node = node.parentNode;
    }
    return null;
  }

  // ── drop indicator for drag-to-add ──
  var line = document.createElement('div');
  line.style.cssText = 'position:absolute;height:3px;background:#7C3AED;border-radius:2px;z-index:2147483646;display:none;pointer-events:none;';
  var dropTarget = null, dropPos = 'after';

  function showLine(rect, before) {
    line.style.display = 'block';
    line.style.left = (rect.left + window.scrollX) + 'px';
    line.style.width = rect.width + 'px';
    line.style.top = ((before ? rect.top : rect.bottom) + window.scrollY - 1) + 'px';
  }
  function hideLine() { line.style.display = 'none'; }

  function onDragOver(e) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    var el = blockFrom(e.target);
    if (!el) { hideLine(); dropTarget = null; dropPos = 'after'; return; }
    var rect = el.getBoundingClientRect();
    var before = (e.clientY - rect.top) < rect.height / 2;
    dropTarget = el.getAttribute('data-block-id');
    dropPos = before ? 'before' : 'after';
    showLine(rect, before);
  }
  function onDrop(e) {
    e.preventDefault();
    hideLine();
    window.parent.postMessage({ type: 'palette-drop', targetId: dropTarget, position: dropPos }, '*');
    dropTarget = null;
  }

  // ── keyboard shortcut forwarding ──
  var SHORTCUT_KEYS = ['Delete','Backspace','ArrowUp','ArrowDown','Escape'];
  function onKeyDown(e) {
    var mod = e.metaKey || e.ctrlKey;
    var k = e.key.toLowerCase();
    var isModShortcut = mod && (k==='z'||k==='y'||k==='d'||k==='c'||k==='v');
    if (SHORTCUT_KEYS.indexOf(e.key) !== -1 || isModShortcut) {
      e.preventDefault();
      window.parent.postMessage({ type: 'key', key: e.key, metaKey: e.metaKey, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey }, '*');
    }
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

    document.body.appendChild(line);
    document.addEventListener('dragover', onDragOver);
    document.addEventListener('drop', onDrop);
    document.addEventListener('dragleave', function(e) { if (!e.relatedTarget) hideLine(); });
    document.addEventListener('keydown', onKeyDown);
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
