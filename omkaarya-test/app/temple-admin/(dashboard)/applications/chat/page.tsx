"use client";

import { MessageSquare, Settings } from "lucide-react";
import Link from "next/link";

export default function ChatApplicationPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Unified Chat</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">
            Communicate with temple staff internally and devotees via WhatsApp.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 text-center shadow-sm">
        <MessageSquare className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Chat Module Under Construction</h3>
        <p className="text-zinc-500 mt-2 max-w-md mx-auto">
          The chat module will feature internal 1:1 messaging, group channels, and an official WhatsApp Business integration to chat directly with devotees based on your active plan.
        </p>
      </div>
    </div>
  );
}
