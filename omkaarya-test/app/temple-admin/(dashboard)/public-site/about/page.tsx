"use client";

import { PublicSitePageEditor } from "@/app/components/temple-admin/PublicSitePageEditor";

export default function PublicSiteAboutPage() {
  return (
    <PublicSitePageEditor pageKey="about" defaultTitle="About" description="Temple history, mission, and about content." />
  );
}
