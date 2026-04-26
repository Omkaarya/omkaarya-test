"use client";

import React from "react";
import Link from "next/link";
import { FormField } from "@/app/components/ds/molecules/FormField";
import { Button } from "@/app/components/ds/atoms/Button";
import { Select } from "@/app/components/ds/atoms/Select";
import { Label } from "@/app/components/ds/atoms/Label";
import { 
  Monitor, 
  ArrowLeft
} from "lucide-react";

export default function OpenPosSessionPage() {
  return (
    <div className="h-full flex items-center justify-center p-6 animate-in zoom-in-95 duration-500 bg-surface-page">
      <div className="w-full max-w-md bg-surface rounded-2xl border border-border shadow-lg p-8">
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center shadow-md">
            <Monitor className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Open Session</h1>
            <p className="text-sm font-medium text-text-tertiary">Configure your terminal</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label required>Select Register</Label>
            <Select 
              options={[
                { value: "main", label: "Main Counter - 01" },
                { value: "prasad", label: "Prasadam Counter - 02" }
              ]} 
              placeholder="Select..."
            />
          </div>

          <FormField 
            label="Opening Cash"
            placeholder="0.00"
            required
            type="number"
            prefixText="LKR"
          />

          <div className="space-y-2">
            <Label optional>Security PIN</Label>
            <div className="flex gap-2">
               {[1,2,3,4].map(i => (
                 <div key={i} className="flex-1 h-12 bg-subtle rounded-xl border border-border flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-border" />
                 </div>
               ))}
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <Link href="/temple-admin/pos/terminal" className="block w-full">
              <Button size="lg" className="w-full h-12 font-bold" leadingIcon={<Monitor className="w-4 h-4" />}>
                Launch Terminal
              </Button>
            </Link>

            <Link href="/temple-admin/pos" className="w-full">
              <Button variant="ghost" size="md" className="w-full text-text-tertiary" leadingIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
