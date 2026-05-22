/**
 * Saved emails + folders — localStorage persistence.
 *
 * SavedEmail wraps a Template + EmailSettings into a named, folderable entity.
 * Folders are simple { id, name } objects.
 */

import type { Template, EmailSettings } from "@/lib/blocks/types";
import { DEFAULT_EMAIL_SETTINGS } from "@/lib/blocks/types";

/* ── Types ── */

export interface SavedEmail {
  id: string;
  name: string;
  folderId: string | null; // null = root / unfiled
  template: Template;
  settings: EmailSettings;
  createdAt: number; // epoch ms
  updatedAt: number;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: number;
}

/* ── Keys ── */

const EMAILS_KEY = "arya_saved_emails";
const FOLDERS_KEY = "arya_saved_folders";

/* ── Helpers ── */

export function uid(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/* ── Folders CRUD ── */

export function loadFolders(): Folder[] {
  try {
    return JSON.parse(localStorage.getItem(FOLDERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveFolders(folders: Folder[]): void {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

export function createFolder(name: string): Folder {
  const folder: Folder = { id: uid(), name, createdAt: Date.now() };
  const all = loadFolders();
  all.push(folder);
  saveFolders(all);
  return folder;
}

export function renameFolder(id: string, name: string): void {
  const all = loadFolders().map((f) => (f.id === id ? { ...f, name } : f));
  saveFolders(all);
}

export function deleteFolder(id: string): void {
  // Move emails in this folder to root
  const emails = loadEmails().map((e) =>
    e.folderId === id ? { ...e, folderId: null } : e
  );
  saveEmails(emails);
  saveFolders(loadFolders().filter((f) => f.id !== id));
}

/* ── Emails CRUD ── */

export function loadEmails(): SavedEmail[] {
  try {
    return JSON.parse(localStorage.getItem(EMAILS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveEmails(emails: SavedEmail[]): void {
  localStorage.setItem(EMAILS_KEY, JSON.stringify(emails));
}

export function createEmail(
  name: string,
  template: Template,
  settings?: EmailSettings,
  folderId?: string | null
): SavedEmail {
  const now = Date.now();
  const email: SavedEmail = {
    id: uid(),
    name,
    folderId: folderId ?? null,
    template,
    settings: settings ?? { ...DEFAULT_EMAIL_SETTINGS },
    createdAt: now,
    updatedAt: now,
  };
  const all = loadEmails();
  all.push(email);
  saveEmails(all);
  return email;
}

export function updateEmail(
  id: string,
  patch: Partial<Pick<SavedEmail, "name" | "folderId" | "template" | "settings">>
): void {
  const all = loadEmails().map((e) =>
    e.id === id ? { ...e, ...patch, updatedAt: Date.now() } : e
  );
  saveEmails(all);
}

export function duplicateEmail(id: string): SavedEmail | null {
  const all = loadEmails();
  const src = all.find((e) => e.id === id);
  if (!src) return null;
  const now = Date.now();
  const copy: SavedEmail = {
    ...structuredClone(src),
    id: uid(),
    name: `${src.name} (copy)`,
    createdAt: now,
    updatedAt: now,
  };
  all.push(copy);
  saveEmails(all);
  return copy;
}

export function deleteEmail(id: string): void {
  saveEmails(loadEmails().filter((e) => e.id !== id));
}

export function moveEmail(id: string, folderId: string | null): void {
  updateEmail(id, { folderId });
}
