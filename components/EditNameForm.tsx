"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateNameAction } from "@/lib/actions";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { c, font } from "@/lib/theme";
import { Notice } from "@/components/ui";

export default function EditNameForm({ initialName }: { initialName: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setError(null);
    startTransition(async () => {
      const res = await updateNameAction(trimmed);
      if (res.ok) {
        setEditing(false);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setName(initialName);
          setError(null);
          setEditing(true);
        }}
        className="pressable"
        style={{ color: c.muted, fontSize: 12.5, fontWeight: 600, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}
      >
        ✏️ {t.profile.editName}
      </button>
    );
  }

  return (
    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          disabled={pending}
          autoFocus
          style={{ flex: 1, padding: "8px 12px", fontSize: 14 }}
        />
        <button
          type="button"
          onClick={save}
          disabled={pending || !name.trim()}
          className="pressable"
          style={{
            padding: "0 14px",
            borderRadius: 10,
            background: c.lime,
            color: c.limeInk,
            fontFamily: font.display,
            fontWeight: 700,
            fontSize: 13,
            opacity: pending || !name.trim() ? 0.5 : 1,
          }}
        >
          {pending ? t.profile.savingName : t.profile.saveName}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          disabled={pending}
          className="pressable"
          style={{
            padding: "0 14px",
            borderRadius: 10,
            background: c.surface,
            border: `1px solid ${c.border}`,
            color: c.muted,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {t.profile.cancelEditName}
        </button>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
    </div>
  );
}
