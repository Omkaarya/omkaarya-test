"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Upload } from "lucide-react";

import { Button } from "@/app/components/ds/atoms/Button";
import { Input } from "@/app/components/ds/atoms/Input";
import { Select } from "@/app/components/ds/atoms/Select";
import { Label } from "@/app/components/ds/atoms/Label";

// ── Section wrapper ────────────────────────────────────────────────

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface rounded-xl border border-border shadow-xs p-6">
      <div className="mb-6 border-b border-border-secondary pb-4">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-text-tertiary">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full space-y-1.5">
      <Label required={required}>{label}</Label>
      {children}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────

export default function CreateProductPage() {
  const router = useRouter();
  const [sku, setSku] = useState("");

  const handleGenerateSku = () => {
    setSku("SKU-" + Math.floor(1000 + Math.random() * 9000));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="group flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface shadow-xs transition-all hover:bg-subtle"
          >
            <ChevronLeft className="h-5 w-5 text-fg-tertiary transition-transform group-hover:-translate-x-0.5" />
          </button>
          <div>
            <h1 className="text-display-xs font-bold tracking-tight text-text-primary">
              Add New Product
            </h1>
            <p className="mt-1 text-sm text-text-tertiary">
              Capture all necessary products details from one place.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button variant="primary">Create Product</Button>
        </div>
      </div>

      <form className="space-y-6">
        {/* Section 1: Product Information */}
        <Section
          title="Product Information"
          description="Basic information about the product you want to add."
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <Field label="Product Name" required>
                <Input placeholder="Enter product name" />
              </Field>

              <Field label="Category" required>
                <div className="flex gap-2">
                  <Select
                    placeholder="Select category"
                    options={[
                      { label: "Pooja Items", value: "pooja" },
                      { label: "Offerings", value: "offerings" },
                      { label: "Kitchen", value: "kitchen" },
                      { label: "Utensils", value: "utensils" },
                      { label: "Prashadham", value: "prashadham" },
                    ]}
                    className="flex-1"
                  />
                  <Button variant="outline" iconOnly size="md">
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </Field>

              <Field label="SKU" required>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter SKU"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    containerClassName="flex-1"
                  />
                  <Button variant="outline" onClick={handleGenerateSku} type="button">
                    Generate
                  </Button>
                </div>
              </Field>
            </div>

            <div className="space-y-6">
              <Field label="Description">
                <textarea
                  rows={8}
                  placeholder="Enter a description"
                  className="w-full rounded-lg border border-border bg-surface p-3 text-sm text-text-primary placeholder:text-text-placeholder outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-colors"
                />
              </Field>
            </div>
          </div>
        </Section>

        {/* Section 2: Pricing & Stock */}
        <Section title="Pricing & Stock">
          <div className="grid gap-6 md:grid-cols-3">
            <Field label="Price ($)" required>
              <Input type="number" placeholder="0.00" prefixText="$" />
            </Field>

            <Field label="Quantity" required>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0"
                  containerClassName="flex-1"
                />
                <Select
                  options={[
                    { label: "Set", value: "set" },
                    { label: "Box", value: "box" },
                    { label: "Unit", value: "unit" },
                  ]}
                  className="w-24"
                />
                <Button variant="outline" iconOnly size="md" type="button">
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </Field>

            <Field label="Min Unit">
              <Select
                placeholder="Select Min"
                options={[
                  { label: "1", value: "1" },
                  { label: "5", value: "5" },
                  { label: "10", value: "10" },
                ]}
              />
            </Field>

            <Field label="Reorder Level" required>
              <Input type="number" placeholder="Set reorder level" />
            </Field>
          </div>
        </Section>

        {/* Section 3: Images */}
        <Section
          title="Images"
          description="Upload product photos (Max 5MB)."
        >
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-secondary bg-subtle/50 p-10 transition-colors hover:border-brand/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-brand-secondary text-brand mb-4">
              <Upload className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-text-primary">
              Click to upload or drag and drop
            </p>
            <p className="mt-1 text-xs text-text-tertiary">
              SVG, PNG, JPG or GIF (max. 5MB)
            </p>
          </div>
        </Section>

        {/* Section 4: Supplier Info */}
        <Section title="Supplier Info">
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Temple Name" required>
              <div className="flex gap-2">
                <Select
                  placeholder="Select Temple"
                  options={[
                    { label: "Jagannath Temple", value: "jagannath" },
                    { label: "Swaminarayan Mandir", value: "swaminarayan" },
                  ]}
                  className="flex-1"
                />
                <Button variant="primary" type="button">
                  Create
                </Button>
              </div>
            </Field>

            <Field label="Supplier Name">
              <Input placeholder="Suppliers Name / Company name" />
            </Field>

            <Field label="Contact Person Name">
              <Input placeholder="Supplier persons name" />
            </Field>

            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Email">
                <Input type="email" placeholder="Email@example.com" />
              </Field>
              <Field label="Phone">
                <Input placeholder="+91 000 000 0000" />
              </Field>
            </div>
          </div>
        </Section>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 rounded-xl border border-border bg-surface p-6 shadow-xs">
          <Button variant="ghost" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Create Product
          </Button>
        </div>
      </form>
    </div>
  );
}
