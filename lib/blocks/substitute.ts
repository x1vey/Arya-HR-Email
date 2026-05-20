/**
 * Variable substitution: replace {{path.to.value}} placeholders in a string
 * using a nested object as the source of values.
 *
 * Examples:
 *   substitute("Hi {{employee.first_name}}", { employee: { first_name: "Priya" } })
 *     -> "Hi Priya"
 *
 *   substitute("{{missing}}", {})  -> ""   (missing keys collapse to empty string)
 */
export function substitute(
  template: string,
  scope: Record<string, unknown>
): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, path: string) => {
    // Paths starting with `__` are reserved sentinels (e.g. `{{__blocks__}}`)
    // owned by the renderer/wrapper. Leave them untouched so downstream
    // splicing can find them.
    if (path.startsWith("__")) return match;
    const value = getPath(scope, path);
    return value === undefined || value === null ? "" : String(value);
  });
}

function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Extract all {{path}} placeholders from a string, returning the unique paths.
 * Useful for detecting which variables a template/block depends on.
 */
export function extractPlaceholders(template: string): string[] {
  const set = new Set<string>();
  const re = /\{\{\s*([\w.]+)\s*\}\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(template)) !== null) {
    set.add(m[1]);
  }
  return Array.from(set);
}
