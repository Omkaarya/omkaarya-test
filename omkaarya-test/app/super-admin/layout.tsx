import type { Metadata } from "next";

const superAdminTitle = "Omkaarya | Superadmin";

export const metadata: Metadata = {
  title: {
    default: superAdminTitle,
    template: "%s | Omkaarya | Superadmin",
  },
  openGraph: {
    title: superAdminTitle,
  },
  twitter: {
    title: superAdminTitle,
  },
};

export default function SuperAdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
