/** Default CMS payloads merged with `website_cms_pages` rows. */

export type CmsHomeFeature = { title: string; desc: string };

export type CmsHomePayload = {
  headline: string;
  subheadline: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  features: CmsHomeFeature[];
};

export type CmsSimplePagePayload = {
  title: string;
  body: string;
};

export type CmsSettingsPayload = {
  siteTitle: string;
  metaDescription: string;
};

export type CmsPageKey = "home" | "about" | "contact" | "settings";

export const DEFAULT_CMS_HOME: CmsHomePayload = {
  headline: "Temple operations unified, like never before.",
  subheadline:
    "Powerful tools for your temple. Manage devotees, poojas, donations, and inventory from a single dashboard.",
  primaryCtaText: "Start Free Trial",
  primaryCtaLink: "/register",
  features: [
    {
      title: "Devotee Management",
      desc: "Maintain a comprehensive directory of devotees and their families.",
    },
    {
      title: "Pooja Booking",
      desc: "Schedule and manage poojas with an integrated calendar system.",
    },
  ],
};

export const DEFAULT_CMS_ABOUT: CmsSimplePagePayload = {
  title: "About Omkaarya",
  body: "",
};

export const DEFAULT_CMS_CONTACT: CmsSimplePagePayload = {
  title: "Contact",
  body: "",
};

export const DEFAULT_CMS_SETTINGS: CmsSettingsPayload = {
  siteTitle: "Omkaarya",
  metaDescription: "",
};

export type CmsBundle = {
  home: CmsHomePayload;
  about: CmsSimplePagePayload;
  contact: CmsSimplePagePayload;
  settings: CmsSettingsPayload;
};

export function mergeHomePayload(raw: unknown): CmsHomePayload {
  const d = DEFAULT_CMS_HOME;
  if (!raw || typeof raw !== "object") return { ...d, features: [...d.features] };
  const o = raw as Record<string, unknown>;
  const featuresRaw = o.features;
  let features = d.features;
  if (Array.isArray(featuresRaw)) {
    const parsed = featuresRaw
      .map((x) => {
        if (!x || typeof x !== "object") return null;
        const f = x as Record<string, unknown>;
        const title = typeof f.title === "string" ? f.title : "";
        const desc = typeof f.desc === "string" ? f.desc : "";
        if (!title && !desc) return null;
        return { title, desc };
      })
      .filter((x): x is CmsHomeFeature => x !== null);
    if (parsed.length > 0) features = parsed;
  }
  return {
    headline: typeof o.headline === "string" ? o.headline : d.headline,
    subheadline: typeof o.subheadline === "string" ? o.subheadline : d.subheadline,
    primaryCtaText: typeof o.primaryCtaText === "string" ? o.primaryCtaText : d.primaryCtaText,
    primaryCtaLink: typeof o.primaryCtaLink === "string" ? o.primaryCtaLink : d.primaryCtaLink,
    features,
  };
}

export function mergeSimplePayload(raw: unknown, defaults: CmsSimplePagePayload): CmsSimplePagePayload {
  if (!raw || typeof raw !== "object") return { ...defaults };
  const o = raw as Record<string, unknown>;
  return {
    title: typeof o.title === "string" ? o.title : defaults.title,
    body: typeof o.body === "string" ? o.body : defaults.body,
  };
}

export function mergeSettingsPayload(raw: unknown): CmsSettingsPayload {
  const d = DEFAULT_CMS_SETTINGS;
  if (!raw || typeof raw !== "object") return { ...d };
  const o = raw as Record<string, unknown>;
  return {
    siteTitle: typeof o.siteTitle === "string" ? o.siteTitle : d.siteTitle,
    metaDescription: typeof o.metaDescription === "string" ? o.metaDescription : d.metaDescription,
  };
}

export function buildCmsBundle(rows: Record<CmsPageKey, unknown | undefined>): CmsBundle {
  return {
    home: mergeHomePayload(rows.home),
    about: mergeSimplePayload(rows.about, DEFAULT_CMS_ABOUT),
    contact: mergeSimplePayload(rows.contact, DEFAULT_CMS_CONTACT),
    settings: mergeSettingsPayload(rows.settings),
  };
}
