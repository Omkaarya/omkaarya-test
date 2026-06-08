"use client";

import { PublicSitePageEditor } from "@/app/components/temple-admin/PublicSitePageEditor";

export default function PublicSiteStaffPage() {
  return (
    <PublicSitePageEditor pageKey="staff" defaultTitle="Staff & Priests" description="Public staff and priest profiles." />
  );
}
