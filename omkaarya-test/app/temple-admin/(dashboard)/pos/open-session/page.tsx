"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormField } from "@/app/components/ds/molecules/FormField";
import { Button } from "@/app/components/ds/atoms/Button";
import { Select } from "@/app/components/ds/atoms/Select";
import { Label } from "@/app/components/ds/atoms/Label";
import { Monitor, ArrowLeft, AlertCircle } from "lucide-react";
import { fetchTempleAdminJson, type PosRegister, type PosSession } from "@/lib/temple-admin-api";

export default function OpenPosSessionPage() {
  const router = useRouter();
  const [registers, setRegisters] = useState<PosRegister[]>([]);
  const [sessions, setSessions] = useState<PosSession[]>([]);
  const [registerId, setRegisterId] = useState("");
  const [openedBy, setOpenedBy] = useState("");
  const [openingFloat, setOpeningFloat] = useState<string>("0");
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [regs, sess] = await Promise.all([
          fetchTempleAdminJson<{ items: PosRegister[] }>("/api/temple-admin/pos/registers"),
          fetchTempleAdminJson<{ items: PosSession[] }>("/api/temple-admin/pos/sessions"),
        ]);
        if (!cancelled) {
          setRegisters(regs.items ?? []);
          setSessions(sess.items ?? []);
          const firstActive = (regs.items ?? []).find((r) => r.is_active);
          if (firstActive) setRegisterId(firstActive.id);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load registers.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openSessions = sessions.filter((s) => s.status === "open");
  const existingOpen = openSessions.find((s) => s.register_id === registerId);

  const handleLaunch = async () => {
    if (!registerId) {
      setError("Select a register to open a session.");
      return;
    }
    if (existingOpen) {
      router.push(`/temple-admin/pos/terminal?session=${existingOpen.id}&register=${registerId}`);
      return;
    }
    setOpening(true);
    setError(null);
    try {
      const res = await fetchTempleAdminJson<{ id: string }>("/api/temple-admin/pos/sessions/open", {
        method: "POST",
        body: JSON.stringify({
          registerId,
          openedBy: openedBy.trim() || null,
          openingFloat: Number(openingFloat) || 0,
        }),
      });
      router.push(`/temple-admin/pos/terminal?session=${res.id}&register=${registerId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open session.");
    } finally {
      setOpening(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-6 animate-in zoom-in-95 duration-500 bg-surface-page">
      <div className="w-full max-w-md bg-surface rounded-2xl border border-border shadow-lg p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center shadow-md">
            <Monitor className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Open Session</h1>
            <p className="text-sm font-medium text-text-tertiary">Configure your terminal</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <Label required>Select Register</Label>
            <Select
              value={registerId}
              onChange={(e) => setRegisterId(e.target.value)}
              options={registers
                .filter((r) => r.is_active)
                .map((r) => ({ value: r.id, label: `${r.name} (${r.code})` }))}
              placeholder={loading ? "Loading…" : "Select a register"}
            />
            {existingOpen && (
              <p className="text-[11px] text-emerald-600">
                A session is already open for this register — you can rejoin it.
              </p>
            )}
          </div>

          <FormField
            label="Opening cash"
            placeholder="0.00"
            required
            type="number"
            value={openingFloat}
            onChange={(e) => setOpeningFloat((e.target as HTMLInputElement).value)}
          />

          <FormField
            label="Opened by"
            placeholder="Cashier name"
            value={openedBy}
            onChange={(e) => setOpenedBy((e.target as HTMLInputElement).value)}
          />

          <div className="pt-4 flex flex-col gap-3">
            <Button
              size="lg"
              className="w-full h-12 font-bold"
              leadingIcon={<Monitor className="w-4 h-4" />}
              onClick={handleLaunch}
              disabled={opening || loading || !registerId}
            >
              {opening ? "Opening session…" : existingOpen ? "Rejoin Terminal" : "Launch Terminal"}
            </Button>
            <Link href="/temple-admin/pos" className="w-full">
              <Button
                variant="ghost"
                size="md"
                className="w-full text-text-tertiary"
                leadingIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
