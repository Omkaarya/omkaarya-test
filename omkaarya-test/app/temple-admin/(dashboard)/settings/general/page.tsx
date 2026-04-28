"use client";

import SelectInput from "@/app/components/admin/SelectInput";
import {
  Save,
  UploadCloud,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Languages,
  Clock,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { Input } from "@/app/components/ds/atoms/Input";

export default function GeneralSettingsPage() {
  return (
    <div className="space-y-10 max-w-4xl animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-10">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">
            General Settings
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">
            Configure your temple's core identity, localization, and contact
            details.
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          leadingIcon={<Save className="w-4 h-4" />}
        >
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Branding & Media */}
        <div className="space-y-6">
          <div>
            <h3 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em] mb-4">
              Branding
            </h3>
            <div className="group relative w-full aspect-square rounded-[40px] border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col items-center justify-center transition-all hover:border-brand hover:bg-brand-50/30 cursor-pointer overflow-hidden">
              <div className="flex flex-col items-center text-zinc-400 group-hover:text-brand transition-colors">
                <UploadCloud className="w-10 h-10 mb-2 stroke-[1.5px]" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Upload Logo
                </span>
                <span className="text-[9px] mt-1 font-medium text-zinc-400">
                  SVG, PNG, JPG (Max 2MB)
                </span>
              </div>
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-zinc-400 mt-5 leading-relaxed font-medium text-center italic">
              This logo will appear on all printed receipts and official
              documents.
            </p>
          </div>
        </div>

        {/* Right Column: Information & Localization */}
        <div className="lg:col-span-2 space-y-12">
          {/* Temple Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-brand">
              <Building2 className="w-5 h-5" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">
                Temple Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">
                  Official Temple Name
                </label>
                <Input
                  defaultValue="Omkaarya Main Temple"
                  placeholder="Enter temple name..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">
                  Contact Email
                </label>
                <Input
                  defaultValue="admin@omkaaryatemple.lk"
                  placeholder="admin@temple.com"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">
                  Primary Phone
                </label>
                <Input defaultValue="+94 77 123 4567" placeholder="+94 ..." />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">
                  Physical Address
                </label>
                <Input
                  defaultValue="123 Temple Road, Colombo 06"
                  placeholder="Street, City, Zip..."
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

          {/* Localization */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-brand">
              <Globe className="w-5 h-5" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">
                Localization
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">
                  System Language
                </label>
                <div className="relative">
                  <select className="w-full h-11 pl-4 pr-10 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-bold text-zinc-900 dark:text-white outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all appearance-none cursor-pointer">
                    <option>English (Universal)</option>
                    <option>Tamil (Thamizh)</option>
                    <option>Sinhala (Sihala)</option>
                    <option>Hindi (Bharatiya)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">
                  Primary Timezone
                </label>
                <div className="relative">
                  <select className="w-full h-11 pl-4 pr-10 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-bold text-zinc-900 dark:text-white outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all appearance-none cursor-pointer">
                    <option>Asia/Colombo (IST)</option>
                    <option>Asia/Kolkata (IST)</option>
                    <option>UTC (GMT)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Localization */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Timezone
              </label>
              <SelectInput className="!rounded-xl !py-2.5 !pl-4 !text-sm !font-semibold !text-[var(--text-secondary)]">
                <option>Asia/Colombo (IST)</option>
                <option>Asia/Kolkata (IST)</option>
              </SelectInput>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                System Language
              </label>
              <SelectInput className="!rounded-xl !py-2.5 !pl-4 !text-sm !font-semibold !text-[var(--text-secondary)]">
                <option>English</option>
                <option>Tamil</option>
                <option>Sinhala</option>
              </SelectInput>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-10 border-t border-zinc-100 dark:border-zinc-800">
          <Button
            variant="primary"
            size="lg"
            leadingIcon={<Save className="w-4 h-4" />}
          >
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
