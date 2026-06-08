"use client";

import { PublicSitePageEditor } from "@/app/components/temple-admin/PublicSitePageEditor";

export default function PublicSiteEventsPage() {
  return (
    <PublicSitePageEditor pageKey="events" defaultTitle="Events" description="Upcoming festivals and event listings." />
  );
}
