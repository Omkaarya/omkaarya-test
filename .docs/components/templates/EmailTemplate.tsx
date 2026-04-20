import React from "react";
import { Button } from "@/components/atoms/Button";
import { BrandLogoIcon } from "@/icons/duotone"; // Pseudo icon - ideally replace with actual brand logo or image.

// ─── Templates/EmailTemplate ──────────────────────────────────────
export const EmailLayout: React.FC<{ children: React.ReactNode; previewText?: string }> = ({ children, previewText }) => (
  <div className="bg-subtle min-h-screen py-10 px-4 font-sans text-sm text-text-primary">
    {/* Hidden preview text for email clients */}
    {previewText && (
      <div className="hidden max-h-0 overflow-hidden text-[0px] leading-[0px] text-transparent">
        {previewText}
      </div>
    )}
    <div className="max-w-2xl mx-auto rounded-2xl bg-surface border border-border shadow-md overflow-hidden">
      {children}
    </div>
  </div>
);

export const EmailHeader: React.FC<{
  logoUrl?: string;
  links?: { label: string; href: string }[];
}> = ({ logoUrl, links }) => (
  <div className="px-8 py-6 border-b border-border flex items-center justify-between">
    <div className="flex items-center gap-2">
      {logoUrl ? (
        <img src={logoUrl} alt="Omkaarya Logo" className="h-8" />
      ) : (
        <span className="font-bold text-xl text-brand tracking-tight">Omkaarya</span>
      )}
    </div>
    {links && (
      <div className="hidden sm:flex items-center gap-6 text-xs font-semibold text-text-secondary">
        {links.map((link, idx) => (
          <a key={idx} href={link.href} className="hover:text-brand transition-colors">
            {link.label}
          </a>
        ))}
      </div>
    )}
  </div>
);

export const EmailContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div className={`px-8 py-8 ${className}`}>
    {children}
  </div>
);

export const EmailHeroImage: React.FC<{ src: string; alt?: string }> = ({ src, alt = "Hero image" }) => (
  <div className="w-full aspect-video bg-bg-muted relative overflow-hidden">
    <img src={src} alt={alt} className="w-full h-full object-cover" />
  </div>
);

export const EmailFooter: React.FC<{
  companyName?: string;
  companyAddress?: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
}> = ({
  companyName = "Omkaarya",
  companyAddress = "123 Temple Ave, Tech City, 10001",
  appStoreUrl,
  playStoreUrl,
}) => (
  <div className="px-8 py-8 bg-subtle border-t border-border flex flex-col items-center text-center">
    
    {(appStoreUrl || playStoreUrl) && (
      <div className="mb-6 flex items-center gap-4">
        {/* Replace with actual store button images in prod */}
        {appStoreUrl && (
          <a href={appStoreUrl} className="h-10 w-32 bg-gray-900 rounded-lg flex items-center justify-center text-white text-xs font-semibold hover:bg-gray-800 transition">
            App Store
          </a>
        )}
        {playStoreUrl && (
          <a href={playStoreUrl} className="h-10 w-32 bg-gray-900 rounded-lg flex items-center justify-center text-white text-xs font-semibold hover:bg-gray-800 transition">
            Google Play
          </a>
        )}
      </div>
    )}

    <p className="text-xs text-text-tertiary mb-4 leading-relaxed">
      You are receiving this email because you opted in via our website.<br />
      If you'd like to stop receiving these emails, you can <a href="#" className="font-semibold underline hover:text-text-primary">unsubscribe here</a>.
    </p>

    <div className="h-px w-12 bg-border my-4" />

    <p className="text-xs font-semibold text-text-secondary">© {new Date().getFullYear()} {companyName}</p>
    <p className="text-xs text-text-tertiary mt-1">{companyAddress}</p>
  </div>
);
