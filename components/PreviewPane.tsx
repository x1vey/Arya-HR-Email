"use client";

import { useMemo, useRef, useEffect } from "react";
import type { Template } from "@/lib/blocks/types";
import { renderTemplate } from "@/lib/blocks/render";

interface PreviewPaneProps {
  template: Template;
  variables: Record<string, unknown>;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
}

/**
 * Renders the full email inside an isolated iframe so its CSS doesn't bleed
 * into the editor chrome. The renderer marks each block's outer element
 * with `data-block-id`, so click-to-select works for arbitrary HTML — both
 * table-based emails and modern div-based designs.
 */
export function PreviewPane({
  template,
  variables,
  selectedBlockId,
  onSelectBlock
}: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const html = useMemo(() => {
    const base = renderTemplate(template, variables);
    return decorateForSelection(base, selectedBlockId);
  }, [template, variables, selectedBlockId]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data && typeof e.data === "object" && e.data.type === "block-click") {
        onSelectBlock(e.data.blockId);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onSelectBlock]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 bg-white px-4 py-2 text-xs text-muted">
        Preview · variables substituted with sample values · click any section to edit
      </div>
      <div className="flex-1 overflow-auto bg-slate-100 p-6">
        <iframe
          ref={iframeRef}
          title="Email preview"
          srcDoc={html}
          className="mx-auto block h-[calc(100vh-180px)] w-full max-w-[760px] rounded-md border border-slate-200 bg-white shadow-sm"
        />
      </div>
    </div>
  );
}

/**
 * Inject a script that attaches click/hover listeners to every
 * [data-block-id] element, posting a message back to the parent on click
 * and highlighting the currently selected block.
 */
function decorateForSelection(html: string, selectedId: string | null): string {
  const selectedJson = JSON.stringify(selectedId);
  const script = `
<script>
(function() {
  var selected = ${selectedJson};
  function tag() {
    var blocks = document.querySelectorAll('[data-block-id]');
    blocks.forEach(function(el) {
      var blockId = el.getAttribute('data-block-id');
      el.style.cursor = 'pointer';
      el.style.transition = 'outline 0.15s';
      if (blockId === selected) {
        el.style.outline = '2px solid #3B82F6';
        el.style.outlineOffset = '-2px';
      } else {
        el.style.outline = 'none';
      }
      el.addEventListener('mouseenter', function() {
        if (blockId !== selected) {
          el.style.outline = '1px dashed #94A3B8';
          el.style.outlineOffset = '-1px';
        }
      });
      el.addEventListener('mouseleave', function() {
        if (blockId !== selected) {
          el.style.outline = 'none';
        }
      });
      el.addEventListener('click', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        window.parent.postMessage({ type: 'block-click', blockId: blockId }, '*');
      });
    });
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
