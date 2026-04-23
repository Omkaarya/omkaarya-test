"use client";

import { useState } from "react";
import { Save, Plus, Trash2, LayoutTemplate, Settings, Users, MessageSquare } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { Input } from "@/app/components/ds/atoms/Input";

export default function WebsiteCMS() {
  const [activeTab, setActiveTab] = useState<"home" | "about" | "contact" | "settings">("home");

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-display-xs font-bold text-text-primary tracking-tight">Website CMS</h1>
        <p className="mt-1 text-sm text-text-tertiary">
          Manage the public-facing Omkaarya website, landing pages, and SEO metadata.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-px">
        <TabButton active={activeTab === "home"} onClick={() => setActiveTab("home")} icon={<LayoutTemplate className="w-4 h-4" />}>Home Page</TabButton>
        <TabButton active={activeTab === "about"} onClick={() => setActiveTab("about")} icon={<Users className="w-4 h-4" />}>About Page</TabButton>
        <TabButton active={activeTab === "contact"} onClick={() => setActiveTab("contact")} icon={<MessageSquare className="w-4 h-4" />}>Contact Page</TabButton>
        <TabButton active={activeTab === "settings"} onClick={() => setActiveTab("settings")} icon={<Settings className="w-4 h-4" />}>Global SEO & Settings</TabButton>
      </div>

      {/* Tab Content */}
      <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
        {activeTab === "home" && <HomePageEditor />}
        {activeTab === "about" && <div className="text-sm text-text-tertiary">About Page editor coming soon.</div>}
        {activeTab === "contact" && <div className="text-sm text-text-tertiary">Contact Page editor coming soon.</div>}
        {activeTab === "settings" && <div className="text-sm text-text-tertiary">Global SEO settings coming soon.</div>}
      </div>
    </div>
  );
}

// ── Helpers ──

function TabButton({ active, onClick, children, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
        active 
          ? "border-brand-500 text-brand-600 dark:text-brand-400" 
          : "border-transparent text-text-secondary hover:text-text-primary hover:border-border"
      }`}
    >
      {icon} {children}
    </button>
  );
}

// ── Home Page Editor ──

function HomePageEditor() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Home Page Content</h2>
          <p className="text-sm text-text-tertiary">Edit the hero section and features grid.</p>
        </div>
        <Button variant="primary" leadingIcon={<Save className="w-4 h-4" />}>Publish Changes</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Hero Section Form */}
        <div className="space-y-4">
          <h3 className="font-medium text-text-primary border-b border-border pb-2">Hero Section</h3>
          
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Headline</label>
              <Input defaultValue="Temple operations unified, like never before." />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Subheadline</label>
              <textarea 
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-shadow min-h-[100px]"
                defaultValue="Powerful tools for your temple. Manage devotees, poojas, donations, and inventory from a single dashboard."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Primary CTA Text</label>
                <Input defaultValue="Start Free Trial" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Primary CTA Link</label>
                <Input defaultValue="/register" />
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid Form */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="font-medium text-text-primary">Bento Grid Features</h3>
            <Button variant="outline" size="sm" leadingIcon={<Plus className="w-3 h-3" />}>Add Feature</Button>
          </div>
          
          <div className="space-y-3 pt-2">
            {[
              { title: "Devotee Management", desc: "Maintain a comprehensive directory of devotees and their families." },
              { title: "Pooja Booking", desc: "Schedule and manage poojas with an integrated calendar system." }
            ].map((feature, i) => (
              <div key={i} className="flex gap-3 items-start p-3 rounded-lg border border-border bg-subtle">
                <div className="flex-1 space-y-2">
                  <Input defaultValue={feature.title} size="sm" />
                  <textarea 
                    className="w-full rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-primary outline-none focus:border-brand-500"
                    defaultValue={feature.desc}
                    rows={2}
                  />
                </div>
                <button className="text-text-tertiary hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
