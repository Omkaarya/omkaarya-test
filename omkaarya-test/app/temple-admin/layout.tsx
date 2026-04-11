import TempleOnboardingShell from "./TempleOnboardingShell";

export default function TempleAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <TempleOnboardingShell>{children}</TempleOnboardingShell>;
}
