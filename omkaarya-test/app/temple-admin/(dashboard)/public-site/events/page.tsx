"use client";

import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/components/ds/atoms/Button";

export default function PlaceholderPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand flex items-center justify-center shadow-inner shadow-brand/20">
        <Sparkles className="w-8 h-8" />
      </div>
      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Coming in Phase 2</h2>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          This module is part of the advanced multi-page CMS architecture planned for Phase 2. For Phase 1, you can toggle functional blocks directly via the Feature Manager.
        </p>
      </div>
      <Link href="/temple-admin/public-site/features">
        <Button variant="primary" leadingIcon={<ArrowLeft className="w-4 h-4" />}>
          Go to Feature Manager
        </Button>
      </Link>
    </div>
  );
}
