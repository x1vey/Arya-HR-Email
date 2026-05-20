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
  /** Inline edit committed on the canvas: set this block prop to this value. */
  onEditProp: (blockId: string, propKey: string, value: string) => void;
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
  onEditProp,
  dropActive
}: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  /** Ordered id + locked flag for every block, so the in-iframe toolbar can
   *  work out move-up/down availability and delete permission for any block
   *  it hovers — not just the selected one. */
  const blocksMeta = useMemo(
    () => template.blocks.map((b) => ({ id: b.id, locked: Boolean(b.locked) })),
    [template.blocks]
  );

  /** Raw (un-substituted) values for every inline-editable prop, keyed
   *  "blockId::propKey" — so editing shows merge tags, not filled-in text. */
  const editableValues = useMemo(() => {
    const map: Record<string, string> = {};
    for (const b of template.blocks) {
      for (const [k, type] of Object.entries(b.propTypes)) {
        if (type === "text" || type === "longtext") map[`${b.id}::${k}`] = b.props[k] ?? "";
      }
    }
    return map;
  }, [template.blocks]);

  const html = useMemo(() => {
    const base = renderTemplate(template, variables, true);
    return decorateForSelection(base, selectedBlockId, editableValues, blocksMeta);
  }, [template, variables, selectedBlockId, editableValues, blocksMeta]);

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
      } else if (d.type === "edit-prop") {
        const [blockId, propKey] = String(d.key).split("::");
        if (blockId && propKey) onEditProp(blockId, propKey, String(d.value ?? ""));
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onSelectBlock, onAction, onPaletteDrop, onCanvasKey, onEditProp]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 text-xs text-muted">
        <span>Click to select · double-click text to edit · drag elements in · ⌫ delete · ⌘Z undo</span>
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

interface BlockMeta {
  id: string;
  locked: boolean;
}

/**
 * Inject the in-iframe behaviour: click-to-select, a Canva-style action
 * toolbar that follows the hovered (or selected) block, double-click text
 * editing, drag-and-drop insertion with a drop indicator, and keyboard-
 * shortcut forwarding.
 */
function decorateForSelection(
  html: string,
  selectedId: string | null,
  editableValues: Record<string, string>,
  blocksMeta: BlockMeta[]
): string {
  const script = `
<script>
(function() {
  var selectedId = ${JSON.stringify(selectedId)};
  var META = ${JSON.stringify(blocksMeta)};
  var RAW = ${JSON.stringify(editableValues)};
  var editing = null;

  function indexOf(id) { for (var i=0;i<META.length;i++){ if(META[i].id===id) return i; } return -1; }

  function makeBtn(label, title, action, disabled) {
    return '<button data-act="' + action + '"' + (disabled ? ' data-disabled="1"' : '') +
      ' title="' + title + '" style="all:unset;cursor:' + (disabled ? 'default' : 'pointer') +
      ';display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:6px;font-size:14px;color:' +
      (disabled ? 'rgba(255,255,255,0.35)' : '#fff') + ';">' + label + '</button>';
  }

  // ── reusable action toolbar (follows hover / selection) ──
  var bar = document.createElement('div');
  bar.id = '__arya_toolbar';
  bar.style.cssText = 'position:absolute;z-index:2147483647;display:none;gap:2px;padding:3px;background:#15112B;border-radius:9px;box-shadow:0 4px 16px rgba(0,0,0,0.25);';
  var barFor = null, hideTimer = null;

  function showToolbarFor(id) {
    var el = document.querySelector('[data-block-id="' + id + '"]');
    if (!el) return;
    var i = indexOf(id);
    var m = META[i] || { locked: false };
    var h = '';
    h += makeBtn('↑', 'Move up', 'up', i <= 0);
    h += makeBtn('↓', 'Move down', 'down', i >= META.length - 1);
    h += makeBtn('⧉', 'Duplicate', 'duplicate', false);
    if (!m.locked) h += makeBtn('🗑', 'Delete', 'delete', false);
    bar.innerHTML = h;
    var rect = el.getBoundingClientRect();
    var top = rect.top + window.scrollY - 36;
    if (rect.top < 40) top = rect.top + window.scrollY + 6;
    bar.style.top = top + 'px';
    bar.style.left = (rect.right + window.scrollX - 6) + 'px';
    bar.style.transform = 'translateX(-100%)';
    bar.style.display = 'flex';
    barFor = id;
  }
  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function() {
      if (selectedId) showToolbarFor(selectedId);
      else { bar.style.display = 'none'; barFor = null; }
    }, 140);
  }
  bar.addEventListener('mouseenter', function() { clearTimeout(hideTimer); });
  bar.addEventListener('mouseleave', scheduleHide);
  bar.addEventListener('click', function(ev) {
    var b = ev.target.closest('button');
    if (!b || b.getAttribute('data-disabled') || !barFor) return;
    ev.preventDefault(); ev.stopPropagation();
    window.parent.postMessage({ type: 'block-action', action: b.getAttribute('data-act'), blockId: barFor }, '*');
  });

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

  // ── inline text editing (double-click to edit in place) ──
  function startEdit(span) {
    if (editing) return;
    editing = span;
    var key = span.getAttribute('data-arya-edit');
    span.setAttribute('data-orig', span.textContent);
    if (RAW[key] != null) span.textContent = RAW[key];
    span.setAttribute('contenteditable', 'true');
    span.focus();
    var r = document.createRange();
    r.selectNodeContents(span);
    var s = window.getSelection();
    s.removeAllRanges(); s.addRange(r);
  }
  function commitEdit(span) {
    if (editing !== span) return;
    editing = null;
    span.removeAttribute('contenteditable');
    window.parent.postMessage({ type: 'edit-prop', key: span.getAttribute('data-arya-edit'), value: span.textContent }, '*');
  }
  function cancelEdit(span) {
    editing = null;
    span.textContent = span.getAttribute('data-orig') || '';
    span.removeAttribute('contenteditable');
    span.blur();
  }
  function wireEditable(span) {
    span.addEventListener('dblclick', function(ev) { ev.preventDefault(); ev.stopPropagation(); startEdit(span); });
    span.addEventListener('blur', function() { commitEdit(span); });
    span.addEventListener('keydown', function(ev) {
      ev.stopPropagation();
      if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); span.blur(); }
      else if (ev.key === 'Escape') { ev.preventDefault(); cancelEdit(span); }
    });
  }

  // ── keyboard shortcut forwarding ──
  var SHORTCUT_KEYS = ['Delete','Backspace','ArrowUp','ArrowDown','Escape'];
  function onKeyDown(e) {
    if (document.activeElement && document.activeElement.isContentEditable) return;
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
      el.style.transition = 'outline 0.12s';
      if (blockId === selectedId) { el.style.outline = '2px solid #7C3AED'; el.style.outlineOffset = '-2px'; }
      el.addEventListener('mouseenter', function() {
        clearTimeout(hideTimer);
        if (blockId !== selectedId) { el.style.outline = '2px solid #C4B5FD'; el.style.outlineOffset = '-2px'; }
        showToolbarFor(blockId);
      });
      el.addEventListener('mouseleave', function() {
        if (blockId !== selectedId) el.style.outline = 'none';
        scheduleHide();
      });
      el.addEventListener('click', function(ev) {
        ev.preventDefault(); ev.stopPropagation();
        window.parent.postMessage({ type: 'block-click', blockId: blockId }, '*');
      });
    });

    var st = document.createElement('style');
    st.textContent = '[data-arya-edit]{cursor:text;border-radius:3px;transition:box-shadow .12s;} [data-arya-edit]:hover{box-shadow:inset 0 0 0 1px #C4B5FD;} [data-arya-edit][contenteditable="true"]{outline:2px solid #7C3AED;outline-offset:2px;background:rgba(124,58,237,0.06);cursor:text;}';
    document.head.appendChild(st);
    document.querySelectorAll('[data-arya-edit]').forEach(wireEditable);

    document.body.appendChild(bar);
    document.body.appendChild(line);
    if (selectedId) showToolbarFor(selectedId);

    document.addEventListener('dragover', onDragOver);
    document.addEventListener('drop', onDrop);
    document.addEventListener('dragleave', function(e) { if (!e.relatedTarget) hideLine(); });
    document.addEventListener('keydown', onKeyDown);
  }

  // Kill ALL link navigation in the editor canvas — clicks should select
  // blocks, never follow hrefs. Capture phase fires before any handler.
  document.addEventListener('click', function(e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (a && !a.closest('#__arya_toolbar')) { e.preventDefault(); }
  }, true);

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
