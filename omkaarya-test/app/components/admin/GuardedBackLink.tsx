"use client";

type GuardedBackLinkProps = {
  href: string;
  onNavigate: (href: string) => void;
  className?: string;
  children: React.ReactNode;
};

/** Breadcrumb/back control that runs through unsaved-form guard before navigating. */
export default function GuardedBackLink({ href, onNavigate, className, children }: GuardedBackLinkProps) {
  return (
    <button type="button" onClick={() => onNavigate(href)} className={className}>
      {children}
    </button>
  );
}
