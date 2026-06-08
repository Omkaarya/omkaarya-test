"use client";

import { PublicSitePageEditor } from "@/app/components/temple-admin/PublicSitePageEditor";

export default function PublicSiteMediaPage() {
  return (
    <PublicSitePageEditor pageKey="media" defaultTitle="Media Gallery" description="Photos and media shown on your public site." />
  );
}
