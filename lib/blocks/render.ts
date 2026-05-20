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
  variables: Record<string, unknown>
): string {
  const withProps = substitute(block.html_template, block.props);
  const withVars = substitute(withProps, variables);
  return injectBlockId(withVars, block.id);
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
  variables: Record<string, unknown>
): string {
  const blocksHtml = template.blocks
    .map((b) => renderBlock(b, variables))
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
