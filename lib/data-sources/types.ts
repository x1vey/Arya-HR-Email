/**
 * Data source definitions — CSV, Airtable, or generic CRM.
 * A DataSource feeds variable values into email templates at send time.
 */

export type DataSourceType = "csv" | "airtable" | "crm";

export interface DataSourceField {
  /** Raw column/field name from source */
  key: string;
  /** Human label */
  label: string;
  /** Sample value for editor preview */
  sample: string;
}

export interface FieldMapping {
  /** The merge-tag key in the template, e.g. "employee.first_name" */
  variableKey: string;
  /** The data-source field key it maps to */
  sourceField: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  fields: DataSourceField[];
  mappings: FieldMapping[];
  /** ISO timestamp */
  connectedAt: string;
  /** For CSV: row count; for Airtable/CRM: record count */
  recordCount: number;
  /** Connection-specific config */
  config: CsvConfig | AirtableConfig | CrmConfig;
}

export interface CsvConfig {
  type: "csv";
  fileName: string;
  /** The raw CSV text (stored for re-parse) */
  rawCsv: string;
}

export interface AirtableConfig {
  type: "airtable";
  baseId: string;
  tableId: string;
  apiKey: string;
}

export interface CrmConfig {
  type: "crm";
  provider: string;
  apiUrl: string;
  apiKey: string;
}

/** Parse a CSV string into headers + rows */
export function parseCsv(raw: string): { headers: string[]; rows: string[][] } {
  const lines = raw.trim().split(/\r?\n/);
  if (lines.length === 0) return { headers: [], rows: [] };

  const parse = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parse(lines[0]);
  const rows = lines.slice(1).filter((l) => l.trim()).map(parse);
  return { headers, rows };
}

/** Convert a header string to a merge-tag-safe key */
export function headerToKey(header: string): string {
  return header
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/** Auto-detect variable mappings based on common field names */
export function autoMapFields(
  sourceFields: DataSourceField[],
  templateVars: { key: string; label: string }[]
): FieldMapping[] {
  const mappings: FieldMapping[] = [];
  for (const tv of templateVars) {
    const tvKey = tv.key.toLowerCase().replace(/\./g, "_");
    const tvLabel = tv.label.toLowerCase();
    const match = sourceFields.find((sf) => {
      const sfKey = sf.key.toLowerCase();
      return (
        sfKey === tvKey ||
        sfKey === tvLabel ||
        sfKey.includes(tvKey) ||
        tvKey.includes(sfKey)
      );
    });
    if (match) {
      mappings.push({ variableKey: tv.key, sourceField: match.key });
    }
  }
  return mappings;
}

const STORAGE_KEY = "arya_data_sources";

export function loadDataSources(): DataSource[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveDataSources(sources: DataSource[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
}
