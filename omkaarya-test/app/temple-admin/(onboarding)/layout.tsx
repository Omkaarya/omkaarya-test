import TempleOnboardingShell from "../TempleOnboardingShell";

export default function TempleOnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <TempleOnboardingShell>{children}</TempleOnboardingShell>;
}
