"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PostSaveSuccessBanner from "@/app/components/admin/PostSaveSuccessBanner";
import UnsavedChangesDialog from "@/app/components/admin/UnsavedChangesDialog";
import { formSnapshot } from "@/lib/form-snapshot";
import { usePostSaveSuccess } from "@/lib/use-post-save-success";
import { useUnsavedFormGuard } from "@/lib/use-unsaved-form-guard";
import { Save, Plus, Trash2, LayoutTemplate, Settings, Users, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { DashboardPageHeader } from "@/app/components/admin/DashboardPageHeader";
import FormField from "@/app/components/admin/FormField";
import TextareaInput from "@/app/components/admin/TextareaInput";
import TextInput from "@/app/components/admin/TextInput";
import type {
  CmsBundle,
  CmsHomeFeature,
  CmsHomePayload,
  CmsPageKey,
  CmsSettingsPayload,
  CmsSimplePagePayload,
} from "@/lib/website-cms-defaults";

function TabButton({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
          : "border-transparent text-[var(--text-muted)] hover:border-border hover:text-[var(--text-primary)]"
      }`}
    >
      {icon} {children}
    </button>
  );
}

export default function WebsiteCMS() {
  const [activeTab, setActiveTab] = useState<CmsPageKey>("home");
  const [bundle, setBundle] = useState<CmsBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const baselineRef = useRef("");
  const pendingTabRef = useRef<CmsPageKey | null>(null);
  const tabDialogRef = useRef<HTMLDialogElement>(null);

  const isDirty = useMemo(() => {
    if (!bundle || !baselineRef.current) return false;
    return formSnapshot(bundle) !== baselineRef.current;
  }, [bundle]);

  const postSave = usePostSaveSuccess();
  const formGuard = useUnsavedFormGuard({ isDirty, enabled: !postSave.isLocked });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/super-admin/cms", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? "Failed to load CMS");
        setBundle(null);
        return;
      }
      const pages = json.data.pages as CmsBundle;
      setBundle(pages);
      baselineRef.current = formSnapshot(pages);
    } catch {
      setError("Network error — could not load CMS.");
      setBundle(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveTab = useCallback(async () => {
    if (!bundle) return;
    setSaving(true);
    setError(null);
    const pageKey = activeTab;
    let payload: unknown;
    if (pageKey === "home") payload = bundle.home;
    else if (pageKey === "about") payload = bundle.about;
    else if (pageKey === "contact") payload = bundle.contact;
    else payload = bundle.settings;

    try {
      const res = await fetch("/api/super-admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageKey, payload }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? "Save failed");
        return;
      }
      const pages = json.data.pages as CmsBundle;
      setBundle(pages);
      baselineRef.current = formSnapshot(pages);
      formGuard.markClean();
      postSave.triggerSuccess({ message: "Changes saved for this tab." });
    } catch {
      setError("Network error — save not applied.");
    } finally {
      setSaving(false);
    }
  }, [activeTab, bundle, formGuard, postSave]);

  const requestTab = (tab: CmsPageKey) => {
    if (tab === activeTab) return;
    if (isDirty && !postSave.isLocked) {
      pendingTabRef.current = tab;
      tabDialogRef.current?.showModal();
      return;
    }
    setActiveTab(tab);
  };

  const confirmDiscardTab = () => {
    tabDialogRef.current?.close();
    if (bundle && baselineRef.current) {
      setBundle(JSON.parse(baselineRef.current) as CmsBundle);
    }
    const next = pendingTabRef.current;
    pendingTabRef.current = null;
    if (next) setActiveTab(next);
  };

  const stayOnTab = () => {
    tabDialogRef.current?.close();
    pendingTabRef.current = null;
  };

  if (loading && !bundle) {
    return (
      <div className="flex max-w-5xl flex-col items-center justify-center gap-3 py-24 text-[var(--text-muted)]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Loading website CMS…</p>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="max-w-5xl space-y-5">
        <DashboardPageHeader
          title="Website CMS"
          description={
            error ? (
              <span className="text-red-600 dark:text-red-400">{error}</span>
            ) : (
              "No content loaded."
            )
          }
          actions={
            <Button type="button" variant="outline" onClick={() => void load()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-5">
      <DashboardPageHeader
        title="Website CMS"
        description="Manage the public-facing Omkaarya website copy. Each tab saves independently to the database."
      />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}
      <PostSaveSuccessBanner text={postSave.bannerText} />

      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-px">
        <TabButton active={activeTab === "home"} onClick={() => requestTab("home")} icon={<LayoutTemplate className="h-4 w-4" />}>
          Home Page
        </TabButton>
        <TabButton active={activeTab === "about"} onClick={() => requestTab("about")} icon={<Users className="h-4 w-4" />}>
          About Page
        </TabButton>
        <TabButton active={activeTab === "contact"} onClick={() => requestTab("contact")} icon={<MessageSquare className="h-4 w-4" />}>
          Contact Page
        </TabButton>
        <TabButton active={activeTab === "settings"} onClick={() => requestTab("settings")} icon={<Settings className="h-4 w-4" />}>
          Global SEO & Settings
        </TabButton>
      </div>

      <fieldset disabled={postSave.isLocked} className="min-w-0 border-0 p-0 m-0">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        {activeTab === "home" && (
          <HomePageEditor
            value={bundle.home}
            onChange={(home) => setBundle((b) => (b ? { ...b, home } : b))}
            onSave={() => void saveTab()}
            saving={saving}
          />
        )}
        {activeTab === "about" && (
          <SimplePageEditor
            title="About Page"
            value={bundle.about}
            onChange={(about) => setBundle((b) => (b ? { ...b, about } : b))}
            onSave={() => void saveTab()}
            saving={saving}
          />
        )}
        {activeTab === "contact" && (
          <SimplePageEditor
            title="Contact Page"
            value={bundle.contact}
            onChange={(contact) => setBundle((b) => (b ? { ...b, contact } : b))}
            onSave={() => void saveTab()}
            saving={saving}
          />
        )}
        {activeTab === "settings" && (
          <SettingsEditor
            value={bundle.settings}
            onChange={(settings) => setBundle((b) => (b ? { ...b, settings } : b))}
            onSave={() => void saveTab()}
            saving={saving}
          />
        )}
      </div>
      </fieldset>

      <UnsavedChangesDialog
        dialogRef={formGuard.dialogRef}
        onStay={formGuard.closeDialog}
        onLeave={formGuard.confirmLeave}
      />

      <dialog
        ref={tabDialogRef}
        className="w-[min(100%-2rem,42rem)] max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-900 shadow-2xl backdrop:bg-black/40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      >
        <h3 className="text-lg font-semibold">Unsaved changes</h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          You have unsaved changes on this tab. Switch tabs without saving?
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={stayOnTab}>
            Stay
          </Button>
          <Button type="button" variant="primary" onClick={confirmDiscardTab}>
            Switch without saving
          </Button>
        </div>
      </dialog>
    </div>
  );
}

function HomePageEditor({
  value,
  onChange,
  onSave,
  saving,
}: {
  value: CmsHomePayload;
  onChange: (v: CmsHomePayload) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const setField = <K extends keyof CmsHomePayload>(key: K, v: CmsHomePayload[K]) => {
    onChange({ ...value, [key]: v });
  };

  const setFeature = (index: number, patch: Partial<CmsHomeFeature>) => {
    const features = value.features.map((f, i) => (i === index ? { ...f, ...patch } : f));
    onChange({ ...value, features });
  };

  const addFeature = () => {
    onChange({
      ...value,
      features: [...value.features, { title: "New feature", desc: "Short description." }],
    });
  };

  const removeFeature = (index: number) => {
    onChange({
      ...value,
      features: value.features.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Home Page Content</h2>
          <p className="text-sm text-text-tertiary">Edit the hero section and features grid.</p>
        </div>
        <Button
          type="button"
          variant="primary"
          leadingIcon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          onClick={onSave}
          disabled={saving}
        >
          Publish changes
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="border-b border-border pb-2 font-medium text-text-primary">Hero Section</h3>

          <div className="space-y-4 pt-2">
            <FormField id="cms-headline" label="Headline">
              <TextInput
                id="cms-headline"
                value={value.headline}
                onChange={(e) => setField("headline", e.target.value)}
              />
            </FormField>
            <FormField id="cms-subheadline" label="Subheadline">
              <TextareaInput
                id="cms-subheadline"
                className="min-h-[100px]"
                value={value.subheadline}
                onChange={(e) => setField("subheadline", e.target.value)}
              />
            </FormField>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField id="cms-cta-text" label="Primary CTA Text">
                <TextInput
                  id="cms-cta-text"
                  value={value.primaryCtaText}
                  onChange={(e) => setField("primaryCtaText", e.target.value)}
                />
              </FormField>
              <FormField id="cms-cta-link" label="Primary CTA Link">
                <TextInput
                  id="cms-cta-link"
                  value={value.primaryCtaLink}
                  onChange={(e) => setField("primaryCtaLink", e.target.value)}
                />
              </FormField>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="font-medium text-text-primary">Bento Grid Features</h3>
            <Button type="button" variant="outline" size="sm" leadingIcon={<Plus className="h-3 w-3" />} onClick={addFeature}>
              Add feature
            </Button>
          </div>

          <div className="space-y-3 pt-2">
            {value.features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-subtle p-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <TextInput
                    aria-label={`Feature ${i + 1} title`}
                    value={feature.title}
                    onChange={(e) => setFeature(i, { title: e.target.value })}
                  />
                  <TextareaInput
                    aria-label={`Feature ${i + 1} description`}
                    rows={2}
                    value={feature.desc}
                    onChange={(e) => setFeature(i, { desc: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  className="p-1 text-text-tertiary hover:text-red-500"
                  onClick={() => removeFeature(i)}
                  aria-label="Remove feature"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SimplePageEditor({
  title,
  value,
  onChange,
  onSave,
  saving,
}: {
  title: string;
  value: CmsSimplePagePayload;
  onChange: (v: CmsSimplePagePayload) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        <Button
          type="button"
          variant="primary"
          leadingIcon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          onClick={onSave}
          disabled={saving}
        >
          Publish changes
        </Button>
      </div>
      <FormField id="cms-page-title" label="Page title">
        <TextInput
          id="cms-page-title"
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
        />
      </FormField>
      <FormField id="cms-page-body" label="Body (plain text or HTML)">
        <TextareaInput
          id="cms-page-body"
          className="min-h-[200px]"
          value={value.body}
          onChange={(e) => onChange({ ...value, body: e.target.value })}
        />
      </FormField>
    </div>
  );
}

function SettingsEditor({
  value,
  onChange,
  onSave,
  saving,
}: {
  value: CmsSettingsPayload;
  onChange: (v: CmsSettingsPayload) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Global SEO & Settings</h2>
          <p className="text-sm text-text-tertiary">Site-wide defaults for metadata.</p>
        </div>
        <Button
          type="button"
          variant="primary"
          leadingIcon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          onClick={onSave}
          disabled={saving}
        >
          Publish changes
        </Button>
      </div>
      <FormField id="cms-site-title" label="Site title">
        <TextInput
          id="cms-site-title"
          value={value.siteTitle}
          onChange={(e) => onChange({ ...value, siteTitle: e.target.value })}
        />
      </FormField>
      <FormField id="cms-meta-description" label="Meta description">
        <TextareaInput
          id="cms-meta-description"
          className="min-h-[120px]"
          value={value.metaDescription}
          onChange={(e) => onChange({ ...value, metaDescription: e.target.value })}
        />
      </FormField>
    </div>
  );
}
