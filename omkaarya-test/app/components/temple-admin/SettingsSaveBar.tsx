"use client";

import { Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";

export function SettingsSaveBar({
  saving,
  onSave,
  label = "Save Changes",
}: {
  saving: boolean;
  onSave: () => void;
  label?: string;
}) {
  return (
    <Button
      variant="primary"
      size="lg"
      leadingIcon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      onClick={onSave}
      disabled={saving}
    >
      {saving ? "Saving…" : label}
    </Button>
  );
}

export function SettingsAlerts({ error, savedAt }: { error: string | null; savedAt: number | null }) {
  return (
    <>
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="font-medium">{error}</p>
        </div>
      )}
      {savedAt && !error && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="font-medium">Saved successfully.</p>
        </div>
      )}
    </>
  );
}
