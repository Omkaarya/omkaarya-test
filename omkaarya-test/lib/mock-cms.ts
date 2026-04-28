// Mock Database for Headless CMS
// Since we are mocking Prisma/PG locally for UI development

export type CMSSection = "hero" | "features" | "testimonials" | "faq" | "cta";

export type CMSPageType = "home" | "about" | "contact" | "pricing" | "privacy";

export interface CMSPage {
  id: string;
  slug: string;
  type: CMSPageType;
  title: string;
  metaDescription: string;
  isPublished: boolean;
  content: Record<string, any>; // JSON structured content
  updatedAt: string;
}

export interface GlobalSettings {
  siteName: string;
  contactEmail: string;
  supportPhone: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
  };
  analyticsId?: string;
}

const mockPages: CMSPage[] = [
  {
    id: "page-home",
    slug: "/",
    type: "home",
    title: "Omkaarya — Temple Management Platform for Hindu Temples Worldwide",
    metaDescription: "Streamline your temple operations with Omkaarya. Manage devotees, poojas, donations, and inventory from a single dashboard.",
    isPublished: true,
    updatedAt: new Date().toISOString(),
    content: {
      hero: {
        headline: "Temple Management Workflow For You",
        subheadline: "Powerful tools for your temple. Your operations unified, like you've never seen before.",
        ctaPrimaryText: "Get Started",
        ctaPrimaryLink: "/register",
        ctaSecondaryText: "Contact Sales",
        ctaSecondaryLink: "/contact"
      },
      features: [
        { title: "Devotee Management", description: "Maintain a comprehensive directory of devotees and their families." },
        { title: "Pooja Booking", description: "Schedule and manage poojas with an integrated calendar system." },
        { title: "Finance & Billing", description: "Track donations, generate receipts, and manage your temple's accounting." }
      ]
    }
  },
  {
    id: "page-contact",
    slug: "/contact",
    type: "contact",
    title: "Contact Us — Omkaarya Support",
    metaDescription: "Get in touch with the Omkaarya team for support, sales, or partnership inquiries.",
    isPublished: true,
    updatedAt: new Date().toISOString(),
    content: {
      hero: {
        headline: "We're Here to Support You",
        subheadline: "Reach out to us for onboarding, support, or partnership opportunities. We're here to help you succeed."
      },
      supportOptions: [
        { type: "Sales", email: "sales@omkaarya.com", phone: "+1 800 123 4567" },
        { type: "Support", email: "support@omkaarya.com", phone: "+1 800 123 4568" }
      ],
      faqs: [
        { question: "What is Omkaarya?", answer: "Omkaarya is a comprehensive temple management platform designed specifically for Hindu temples worldwide." },
        { question: "How secure is my data?", answer: "We use enterprise-grade encryption and strict access controls to ensure your temple's data remains safe and private." },
        { question: "Is there a free trial?", answer: "Yes, we offer a 14-day free trial on our entry-level plans." }
      ]
    }
  }
];

let globalSettings: GlobalSettings = {
  siteName: "Omkaarya",
  contactEmail: "support@omkaarya.com",
  supportPhone: "+94 (0)77 208 2227 | +91 21 222 4948",
  socialLinks: {
    twitter: "https://twitter.com/omkaarya",
    linkedin: "https://linkedin.com/company/omkaarya"
  }
};

export const CMS_DB = {
  getPages: async () => mockPages,
  getPageBySlug: async (slug: string) => mockPages.find((p) => p.slug === slug),
  updatePage: async (id: string, updates: Partial<CMSPage>) => {
    const pageIndex = mockPages.findIndex((p) => p.id === id);
    if (pageIndex > -1) {
      mockPages[pageIndex] = { ...mockPages[pageIndex], ...updates, updatedAt: new Date().toISOString() };
      return mockPages[pageIndex];
    }
    throw new Error("Page not found");
  },
  getGlobalSettings: async () => globalSettings,
  updateGlobalSettings: async (updates: Partial<GlobalSettings>) => {
    globalSettings = { ...globalSettings, ...updates };
    return globalSettings;
  }
};
