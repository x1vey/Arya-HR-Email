/**
 * Core block schema for the email template builder.
 *
 * A Template is a tree of Blocks. Each Block has:
 *   - a `type` (descriptive, e.g. "hero_banner", "checklist")
 *   - editable `props` (the knobs the user can change in the property panel)
 *   - `propTypes` declaring what UI to show for each prop
 *   - an `html_template` snippet with {{prop_name}} and {{variable.path}} placeholders
 *
 * Rendering = substitute props into html_template, then substitute workflow
 * variables (employee.first_name etc.), then concatenate inside the template
 * wrapper.
 */

export type PropType =
  | "text"
  | "longtext"
  | "color"
  | "image_url"
  | "link_url"
  | "alignment";

export type PropValue = string;

export interface Block {
  /** Stable id within the template — used as the dnd-kit key */
  id: string;
  /** Descriptive type (header_logo, hero_banner, checklist, signature, ...) */
  type: string;
  /** Human label shown in the block list */
  label: string;
  /** Editable values */
  props: Record<string, PropValue>;
  /** Declares which UI control to render for each prop */
  propTypes: Record<string, PropType>;
  /**
   * The block's HTML fragment. May reference its own props via {{prop_name}}
   * and template-level variables via {{variable.path}}. Email-safe HTML
   * (tables, inline styles).
   */
  html_template: string;
  /** Prevent deletion (e.g., header, footer, unsubscribe) */
  locked?: boolean;
}

export interface VariableDef {
  /** Dot-path like "employee.first_name" */
  key: string;
  label: string;
  /** Sample value used in editor preview */
  sample: string;
  required?: boolean;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  /** The outer email shell. Must contain a literal `{{__blocks__}}` token
   *  where block HTML is concatenated. */
  wrapper_html: string;
  /** Top-level variables this template expects from the workflow */
  variables: VariableDef[];
  /** Ordered list of blocks */
  blocks: Block[];
}
