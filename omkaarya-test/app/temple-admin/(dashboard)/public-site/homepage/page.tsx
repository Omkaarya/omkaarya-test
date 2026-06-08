"use client";

import { PublicSitePageEditor } from "@/app/components/temple-admin/PublicSitePageEditor";

export default function PublicSiteHomepagePage() {
  return (
    <PublicSitePageEditor
      pageKey="homepage"
      defaultTitle="Homepage"
      description="Edit the main landing content for your public temple site."
    />
  );
}
