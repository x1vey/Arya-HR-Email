"use client";

import { useCallback, useState } from "react";
import type { Template, EmailSettings } from "@/lib/blocks/types";
import { DEFAULT_EMAIL_SETTINGS } from "@/lib/blocks/types";
import type { SavedEmail } from "@/lib/saved-templates/store";
import { createEmail, updateEmail } from "@/lib/saved-templates/store";
import { Dashboard } from "@/components/Dashboard";
import { BlockEditor } from "@/components/BlockEditor";

type View =
  | { mode: "dashboard" }
  | { mode: "editor"; template: Template; settings: EmailSettings; savedEmailId: string | null };

export default function EditorPage() {
  const [view, setView] = useState<View>({ mode: "dashboard" });

  const openEmail = useCallback((email: SavedEmail) => {
    setView({
      mode: "editor",
      template: email.template,
      settings: email.settings,
      savedEmailId: email.id,
    });
  }, []);

  const createNew = useCallback((template: Template) => {
    // Create a saved email immediately so we can save in place later
    const email = createEmail(template.name || "Untitled email", template);
    setView({
      mode: "editor",
      template: email.template,
      settings: email.settings,
      savedEmailId: email.id,
    });
  }, []);

  const goBack = useCallback(() => {
    setView({ mode: "dashboard" });
  }, []);

  const handleSave = useCallback(
    (name: string, template: Template, settings: EmailSettings) => {
      if (view.mode === "editor" && view.savedEmailId) {
        updateEmail(view.savedEmailId, { name, template, settings });
      } else {
        const email = createEmail(name, template, settings);
        if (view.mode === "editor") {
          setView((v) =>
            v.mode === "editor" ? { ...v, savedEmailId: email.id } : v
          );
        }
      }
    },
    [view]
  );

  if (view.mode === "dashboard") {
    return <Dashboard onOpenEmail={openEmail} onCreateNew={createNew} />;
  }

  return (
    <BlockEditor
      key={view.savedEmailId ?? "new"}
      initialTemplate={view.template}
      initialSettings={view.settings}
      savedEmailId={view.savedEmailId}
      onBack={goBack}
      onSave={handleSave}
    />
  );
}
