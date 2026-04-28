"use client";

import { PhoneCall } from "lucide-react";

export default function CallsApplicationPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Calls & Meetings</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">
            Audio and video conferencing for temple staff.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 text-center shadow-sm">
        <PhoneCall className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Calls Module Under Construction</h3>
        <p className="text-zinc-500 mt-2 max-w-md mx-auto">
          This module will support 1:1 audio/video calls and group video conferencing for committee meetings based on your plan.
        </p>
      </div>
    </div>
  );
}
