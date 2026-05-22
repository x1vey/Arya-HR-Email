"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Template } from "@/lib/blocks/types";
import { TEMPLATE_LIBRARY, blankTemplate } from "@/lib/templates";
import { cloneTemplate } from "@/lib/blocks/render";
import type { SavedEmail, Folder } from "@/lib/saved-templates/store";
import {
  loadEmails,
  loadFolders,
  createEmail,
  duplicateEmail,
  deleteEmail,
  moveEmail,
  updateEmail,
  createFolder,
  renameFolder,
  deleteFolder,
} from "@/lib/saved-templates/store";

/* ── Props ── */

interface DashboardProps {
  onOpenEmail: (email: SavedEmail) => void;
  onCreateNew: (template: Template) => void;
}

export function Dashboard({ onOpenEmail, onCreateNew }: DashboardProps) {
  const [emails, setEmails] = useState<SavedEmail[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showTemplateChooser, setShowTemplateChooser] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renameFolderValue, setRenameFolderValue] = useState("");
  const [moveMenuId, setMoveMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const reload = useCallback(() => {
    setEmails(loadEmails());
    setFolders(loadFolders());
  }, []);

  useEffect(reload, [reload]);

  // Close context menu on click-away
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [contextMenu]);

  // Filtered emails
  const visibleEmails = useMemo(() => {
    let list = emails.filter((e) =>
      activeFolderId === null
        ? true
        : activeFolderId === "__unfiled__"
        ? !e.folderId
        : e.folderId === activeFolderId
    );
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q));
    }
    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [emails, activeFolderId, searchQuery]);

  const unfiledCount = useMemo(() => emails.filter((e) => !e.folderId).length, [emails]);

  /* ── Actions ── */

  const handleCreateBlank = () => {
    onCreateNew(cloneTemplate(blankTemplate));
    setShowNewMenu(false);
  };

  const handleCreateFromTemplate = (t: Template) => {
    onCreateNew(cloneTemplate(t));
    setShowTemplateChooser(false);
    setShowNewMenu(false);
  };

  const handleDuplicate = (id: string) => {
    duplicateEmail(id);
    reload();
    setContextMenu(null);
  };

  const handleDelete = (id: string) => {
    deleteEmail(id);
    reload();
    setContextMenu(null);
  };

  const handleRenameStart = (email: SavedEmail) => {
    setRenamingId(email.id);
    setRenameValue(email.name);
    setContextMenu(null);
  };

  const handleRenameFinish = (id: string) => {
    if (renameValue.trim()) {
      updateEmail(id, { name: renameValue.trim() });
      reload();
    }
    setRenamingId(null);
  };

  const handleMove = (emailId: string, folderId: string | null) => {
    moveEmail(emailId, folderId);
    reload();
    setMoveMenuId(null);
    setContextMenu(null);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      reload();
    }
    setShowNewFolder(false);
    setNewFolderName("");
  };

  const handleRenameFolderStart = (folder: Folder) => {
    setRenamingFolderId(folder.id);
    setRenameFolderValue(folder.name);
  };

  const handleRenameFolderFinish = (id: string) => {
    if (renameFolderValue.trim()) {
      renameFolder(id, renameFolderValue.trim());
      reload();
    }
    setRenamingFolderId(null);
  };

  const handleDeleteFolder = (id: string) => {
    deleteFolder(id);
    if (activeFolderId === id) setActiveFolderId(null);
    reload();
  };

  return (
    <div className="flex h-screen flex-col bg-canvas">
      {/* ── Header ── */}
      <header className="flex items-center justify-between border-b border-brand-pale bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-sm font-bold text-white">
            A
          </div>
          <div>
            <h1 className="text-base font-semibold text-ink">Arya</h1>
            <p className="text-[11px] text-muted">Email Studio</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 rounded-lg border border-brand-pale bg-canvas py-1.5 pl-8 pr-3 text-sm placeholder:text-muted/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>

          {/* New email button */}
          <div className="relative">
            <button
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:opacity-90"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Create new
            </button>

            {showNewMenu && (
              <div className="absolute right-0 top-full z-30 mt-2 w-56 rounded-xl border border-brand-pale bg-white p-1.5 shadow-float">
                <button
                  onClick={handleCreateBlank}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-ink transition hover:bg-brand-light"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-canvas">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 text-muted">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">Blank email</div>
                    <div className="text-[11px] text-muted">Start from scratch</div>
                  </div>
                </button>
                <button
                  onClick={() => { setShowTemplateChooser(true); setShowNewMenu(false); }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-ink transition hover:bg-brand-light"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-canvas">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 text-muted">
                      <rect x="3" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="3" width="7" height="7" rx="1.5" />
                      <rect x="3" y="14" width="7" height="7" rx="1.5" />
                      <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">From template</div>
                    <div className="text-[11px] text-muted">Pick a starter design</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar — folders ── */}
        <aside className="flex w-56 flex-col border-r border-brand-pale bg-white">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Folders</span>
            <button
              onClick={() => setShowNewFolder(true)}
              className="rounded-md p-1 text-muted transition hover:bg-brand-light hover:text-brand"
              title="New folder"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 pb-4">
            {/* All emails */}
            <button
              onClick={() => setActiveFolderId(null)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                activeFolderId === null
                  ? "bg-brand-light font-medium text-brand-dark"
                  : "text-ink hover:bg-canvas"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
              </svg>
              All emails
              <span className="ml-auto text-[11px] text-muted">{emails.length}</span>
            </button>

            {/* Unfiled */}
            {folders.length > 0 && (
              <button
                onClick={() => setActiveFolderId("__unfiled__")}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                  activeFolderId === "__unfiled__"
                    ? "bg-brand-light font-medium text-brand-dark"
                    : "text-ink hover:bg-canvas"
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                  <path d="M4 20h16a2 2 0 002-2V8a2 2 0 00-2-2h-7.93a2 2 0 01-1.66-.9l-.82-1.2A2 2 0 007.93 3H4a2 2 0 00-2 2v13a2 2 0 002 2z" />
                </svg>
                Unfiled
                <span className="ml-auto text-[11px] text-muted">{unfiledCount}</span>
              </button>
            )}

            {/* User folders */}
            {folders.map((f) => {
              const count = emails.filter((e) => e.folderId === f.id).length;
              return (
                <div key={f.id} className="group relative">
                  {renamingFolderId === f.id ? (
                    <input
                      autoFocus
                      value={renameFolderValue}
                      onChange={(e) => setRenameFolderValue(e.target.value)}
                      onBlur={() => handleRenameFolderFinish(f.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameFolderFinish(f.id);
                        if (e.key === "Escape") setRenamingFolderId(null);
                      }}
                      className="w-full rounded-lg border border-brand px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                  ) : (
                    <button
                      onClick={() => setActiveFolderId(f.id)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                        activeFolderId === f.id
                          ? "bg-brand-light font-medium text-brand-dark"
                          : "text-ink hover:bg-canvas"
                      }`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                        <path d="M4 20h16a2 2 0 002-2V8a2 2 0 00-2-2h-7.93a2 2 0 01-1.66-.9l-.82-1.2A2 2 0 007.93 3H4a2 2 0 00-2 2v13a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">{f.name}</span>
                      <span className="ml-auto text-[11px] text-muted">{count}</span>
                    </button>
                  )}
                  {/* Folder actions */}
                  {renamingFolderId !== f.id && (
                    <div className="absolute right-1 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 group-hover:flex">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRenameFolderStart(f); }}
                        className="rounded p-1 text-muted hover:bg-brand-light hover:text-brand"
                        title="Rename"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                          <path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteFolder(f.id); }}
                        className="rounded p-1 text-muted hover:bg-red-50 hover:text-red-600"
                        title="Delete folder"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* New folder input */}
            {showNewFolder && (
              <div className="mt-1 flex items-center gap-1 px-1">
                <input
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onBlur={handleCreateFolder}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateFolder();
                    if (e.key === "Escape") { setShowNewFolder(false); setNewFolderName(""); }
                  }}
                  placeholder="Folder name"
                  className="flex-1 rounded-lg border border-brand px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
            )}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Section label */}
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">
              {activeFolderId === null
                ? "All emails"
                : activeFolderId === "__unfiled__"
                ? "Unfiled"
                : folders.find((f) => f.id === activeFolderId)?.name ?? "Folder"}
            </h2>
            <span className="text-xs text-muted">
              {visibleEmails.length} email{visibleEmails.length !== 1 ? "s" : ""}
            </span>
          </div>

          {visibleEmails.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-light">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7 text-brand">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 7l-10 6L2 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-semibold text-ink">
                {searchQuery ? "No results" : "No emails yet"}
              </h3>
              <p className="mt-1.5 max-w-sm text-sm text-muted">
                {searchQuery
                  ? `No emails matching "${searchQuery}"`
                  : "Create your first email from a template or start from scratch."}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowNewMenu(true)}
                  className="mt-5 rounded-xl bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:opacity-90"
                >
                  Create your first email
                </button>
              )}
            </div>
          ) : (
            /* Email cards grid */
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleEmails.map((email) => (
                <div
                  key={email.id}
                  className="group relative flex cursor-pointer flex-col rounded-xl border border-brand-pale bg-white transition hover:border-brand/30 hover:shadow-panel"
                  onClick={() => {
                    if (renamingId === email.id) return;
                    onOpenEmail(email);
                  }}
                >
                  {/* Preview thumbnail */}
                  <div className="flex h-36 items-center justify-center overflow-hidden rounded-t-xl bg-canvas p-3">
                    <div className="h-full w-full rounded-md border border-brand-pale bg-white shadow-sm" />
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-1 px-3.5 py-3">
                    {renamingId === email.id ? (
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={() => handleRenameFinish(email.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameFinish(email.id);
                          if (e.key === "Escape") setRenamingId(null);
                        }}
                        className="rounded border border-brand px-1.5 py-0.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand/20"
                      />
                    ) : (
                      <h4 className="truncate text-sm font-medium text-ink">{email.name}</h4>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-muted">
                      <span>{formatDate(email.updatedAt)}</span>
                      {email.folderId && (
                        <>
                          <span className="text-brand-pale">&middot;</span>
                          <span className="truncate">{folders.find((f) => f.id === email.folderId)?.name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Context menu trigger */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setContextMenu({ id: email.id, x: e.clientX, y: e.clientY });
                    }}
                    className="absolute right-2 top-2 hidden rounded-md bg-white/90 p-1 shadow-sm backdrop-blur-sm transition group-hover:flex hover:bg-brand-light"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-muted">
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── Context menu ── */}
      {contextMenu && (
        <div
          className="fixed z-50 w-44 rounded-xl border border-brand-pale bg-white p-1 shadow-float"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <CtxBtn
            label="Open"
            onClick={() => {
              const e = emails.find((em) => em.id === contextMenu.id);
              if (e) onOpenEmail(e);
              setContextMenu(null);
            }}
          />
          <CtxBtn
            label="Rename"
            onClick={() => {
              const e = emails.find((em) => em.id === contextMenu.id);
              if (e) handleRenameStart(e);
            }}
          />
          <CtxBtn
            label="Duplicate"
            onClick={() => handleDuplicate(contextMenu.id)}
          />
          {/* Move to folder */}
          <div className="relative">
            <CtxBtn
              label="Move to..."
              onClick={() => setMoveMenuId(moveMenuId === contextMenu.id ? null : contextMenu.id)}
            />
            {moveMenuId === contextMenu.id && (
              <div className="absolute left-full top-0 z-50 ml-1 w-40 rounded-lg border border-brand-pale bg-white p-1 shadow-float">
                <button
                  onClick={() => handleMove(contextMenu.id, null)}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-ink hover:bg-brand-light"
                >
                  Unfiled
                </button>
                {folders.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleMove(contextMenu.id, f.id)}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-ink hover:bg-brand-light"
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="my-1 h-px bg-brand-pale" />
          <CtxBtn
            label="Delete"
            danger
            onClick={() => handleDelete(contextMenu.id)}
          />
        </div>
      )}

      {/* ── Template chooser modal ── */}
      {showTemplateChooser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
          onClick={() => setShowTemplateChooser(false)}
        >
          <div
            className="flex max-h-[80vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-float"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-brand-pale px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-ink">Choose a template</h3>
                <p className="text-xs text-muted">{TEMPLATE_LIBRARY.length} templates available</p>
              </div>
              <button
                onClick={() => setShowTemplateChooser(false)}
                className="rounded-lg p-1.5 text-muted transition hover:bg-brand-light hover:text-ink"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {TEMPLATE_LIBRARY.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleCreateFromTemplate(t)}
                    className="flex flex-col rounded-xl border border-brand-pale bg-white p-3 text-left transition hover:border-brand/30 hover:shadow-panel"
                  >
                    <div className="mb-2 flex h-20 items-center justify-center rounded-lg bg-canvas">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 text-muted">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="M22 7l-10 6L2 7" />
                      </svg>
                    </div>
                    <div className="text-sm font-medium text-ink">{t.name}</div>
                    <div className="text-[11px] text-muted">{t.category} &middot; {t.blocks.length} blocks</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click-away for new menu */}
      {showNewMenu && (
        <div className="fixed inset-0 z-20" onClick={() => setShowNewMenu(false)} />
      )}
    </div>
  );
}

/* ── Sub-components ── */

function CtxBtn({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center rounded-md px-3 py-1.5 text-left text-xs font-medium transition ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-ink hover:bg-brand-light"
      }`}
    >
      {label}
    </button>
  );
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
