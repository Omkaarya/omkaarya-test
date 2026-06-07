"use client";

import { useEffect, useState } from "react";
import type { ApiSuccessBody } from "@/lib/api-envelope";

type Profile = {
  email: string;
  fullName: string | null;
  roles: string[];
};

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function firstNameFrom(fullName: string | null, email: string): string {
  const base = (fullName || email).trim();
  const first = base.split(/\s+/).filter(Boolean)[0];
  return first ?? "there";
}

function formatAttentionDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function DashboardGreeting() {
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch("/api/super-admin/me", { cache: "no-store" });
        const j = (await res.json().catch(() => null)) as ApiSuccessBody<Profile> | null;
        if (cancel) return;
        if (j?.success === true && j.data) {
          setFirstName(firstNameFrom(j.data.fullName, j.data.email));
        }
      } catch {
        if (!cancel) setFirstName(null);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const now = new Date();
  const greeting = greetingForHour(now.getHours());
  const displayName = firstName ?? "there";

  return (
    <div>
      <h1 className="text-display-xs font-bold tracking-tight text-text-primary">
        {greeting}, {displayName}
      </h1>
      <p className="mt-1 text-sm font-medium text-text-tertiary">
        Here&apos;s what needs your attention today — {formatAttentionDate(now)}
      </p>
    </div>
  );
}
