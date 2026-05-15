"use client";

import { createElement } from "react";

type PostSaveSuccessBannerProps = {
  text: string | null;
  className?: string;
};

const baseClass =
  "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-300";

export default function PostSaveSuccessBanner({ text, className = "" }: PostSaveSuccessBannerProps) {
  if (!text) return null;
  const cls = className ? `${baseClass} ${className}` : baseClass;
  return createElement("div", { role: "status", className: cls }, text);
}
