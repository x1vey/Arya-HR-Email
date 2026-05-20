import type { Block, Template } from "./types";
import { substitute } from "./substitute";

/**
 * Render a single block to HTML by:
 *   1. Substituting the block's own props into html_template
 *   2. Substituting top-level variables (employee.first_name etc.)
 *   3. Injecting a `data-block-id` attribute on the outermost element so the
 *      preview iframe can map clicks back to the block
 *
 * Two passes (1+2) lets a prop value itself contain a variable, e.g.,
 *   title: "Welcome {{employee.first_name}}"
 */
export function renderBlock(
  block: Block,
  variables: Record<string, unknown>,
  editable = false
): string {
  const tpl = editable ? annotateEditableProps(block) : block.html_template;
  const withProps = substitute(tpl, block.props);
  const withVars = substitute(withProps, variables);
  return injectBlockId(withVars, block.id);
}

/**
 * Editor-only: wrap each text/longtext prop's placeholder (where it sits in
 * element-text position, not inside a tag/attribute) with a marker span so the
 * preview can offer click-to-edit-in-place and map the edit back to the prop.
 * Never used for the exported HTML.
 */
function annotateEditableProps(block: Block): string {
  let html = block.html_template;
  for (const [propKey, type] of Object.entries(block.propTypes)) {
    if (type !== "text" && type !== "longtext") continue;
    html = wrapTextPlaceholder(html, propKey, block.id);
  }
  return html;
}

function wrapTextPlaceholder(html: string, propKey: string, blockId: string): string {
  const token = `{{${propKey}}}`;
  let out = "";
  let i = 0;
  for (;;) {
    const idx = html.indexOf(token, i);
    if (idx === -1) {
      out += html.slice(i);
      break;
    }
    const before = html.slice(0, idx);
    // We're in text position (not inside a tag) when the most recent angle
    // bracket before the token is a closing '>'.
    const inText = before.lastIndexOf(">") >= before.lastIndexOf("<");
    out += html.slice(i, idx);
    out += inText
      ? `<span data-arya-edit="${blockId}::${propKey}">${token}</span>`
      : token;
    i = idx + token.length;
  }
  return out;
}

/**
 * Insert `data-block-id="..."` into the first opening tag of the block's
 * HTML so the preview iframe can detect clicks. Tolerates leading
 * whitespace and HTML comments.
 *
 * `<table align="center">` -> `<table data-block-id="blk_xxx" align="center">`
 * `<!-- header -->\n<div>` -> `<!-- header -->\n<div data-block-id="...">`
 */
function injectBlockId(html: string, id: string): string {
  const re = /^(\s*(?:<!--[\s\S]*?-->\s*)*)(<[a-zA-Z][a-zA-Z0-9]*)/;
  if (!re.test(html)) return html;
  return html.replace(re, (_match, prefix: string, openTag: string) => {
    return `${prefix}${openTag} data-block-id="${id}"`;
  });
}

/**
 * Render a full template: assemble all blocks into the wrapper.
 *
 * The wrapper must contain the literal token `{{__blocks__}}` where block
 * HTML is spliced in. We use a reserved name so it can't collide with a
 * legitimate variable path.
 */
export function renderTemplate(
  template: Template,
  variables: Record<string, unknown>,
  editable = false
): string {
  const blocksHtml = template.blocks
    .map((b) => renderBlock(b, variables, editable))
    .join("\n");
  // Build the wrapper. We substitute variables in the wrapper too (subject,
  // preheader, etc. may use variables), then splice the blocks in last so
  // the {{__blocks__}} token survives variable substitution.
  const wrapperWithVars = substitute(template.wrapper_html, variables);
  return wrapperWithVars.replace("{{__blocks__}}", blocksHtml);
}

/**
 * Build a scope object from a template's variable definitions, using the
 * sample values declared on each variable. This is what the editor uses for
 * live preview.
 */
export function buildSampleScope(template: Template): Record<string, unknown> {
  const scope: Record<string, unknown> = {};
  for (const v of template.variables) {
    setPath(scope, v.key, v.sample);
  }
  return scope;
}

function setPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split(".");
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!(key in cur) || typeof cur[key] !== "object" || cur[key] === null) {
      cur[key] = {};
    }
    cur = cur[key] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

/**
 * Helper: deep-clone a template so the editor can mutate state freely.
 */
export function cloneTemplate(template: Template): Template {
  return JSON.parse(JSON.stringify(template)) as Template;
}
