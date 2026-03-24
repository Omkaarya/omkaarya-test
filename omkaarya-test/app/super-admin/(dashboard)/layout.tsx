import AdminDashboardLayout from "@/app/components/admin/AdminDashboardLayout";

export default function SuperAdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
