"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";

export default function ApplicationsIntegrationPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-10 text-center">
      <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{title}</h1>
      <p className="text-sm text-zinc-500">{description}</p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Configure integrations from temple settings when your plan includes this capability.
      </p>
      <Link href="/temple-admin/settings/system/email">
        <Button variant="primary" leadingIcon={<Settings className="h-4 w-4" />}>
          Open integration settings
        </Button>
      </Link>
    </div>
  );
}
