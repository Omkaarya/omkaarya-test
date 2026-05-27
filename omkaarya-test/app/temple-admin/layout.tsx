import { TempleAdminSessionGuard } from "@/app/components/temple-admin/TempleAdminSessionGuard";

export default function TempleAdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <TempleAdminSessionGuard>{children}</TempleAdminSessionGuard>;
}
