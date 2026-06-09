import { ChevronDown } from "lucide-react";
import FormField from "@/app/components/admin/FormField";
import { PHONE_COUNTRY_OPTIONS } from "@/app/components/admin/phoneCountryOptions";

export type PhoneRowValue = {
  countryCode: string;
  nationalNumber: string;
};

type PhoneFieldsGroupProps = {
  telephone: PhoneRowValue;
  whatsapp: PhoneRowValue;
  fax: PhoneRowValue;
  onChange: (which: "telephone" | "whatsapp" | "fax", next: PhoneRowValue) => void;
  errors?: Partial<{
    telephone: string;
    whatsapp: string;
    fax: string;
  }>;
  disabled?: boolean;
  /** When true, renders as a block (for wizard grids) instead of CSS `contents`. */
  embedded?: boolean;
};

export function PhoneRowField({
  idPrefix,
  label,
  value,
  onChange,
  error,
  required,
  onBlur,
  layout = "vertical",
  disabled = false,
}: {
  idPrefix: string;
  label: string;
  value: PhoneRowValue;
  onChange: (next: PhoneRowValue) => void;
  error?: string;
  required?: boolean;
  onBlur?: () => void;
  layout?: "vertical" | "horizontal";
  disabled?: boolean;
}) {
  const selectedOption = PHONE_COUNTRY_OPTIONS.find((o) => o.value === value.countryCode);
  const displayLabel = selectedOption ? selectedOption.label : value.countryCode;

  return (
    <FormField id={`${idPrefix}-num`} label={label} required={required} layout={layout}>
      <div>
        <div className="relative flex items-stretch overflow-hidden w-full rounded-lg border border-zinc-200 bg-white ring-[var(--brand-primary)] focus-within:ring-2 focus-within:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800/50 dark:focus-within:border-zinc-600">
          <div className="relative flex items-center shrink-0 border-r border-zinc-200 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/20 px-3">
            <div className="flex items-center gap-1.5 text-sm text-zinc-900 dark:text-zinc-100 pointer-events-none whitespace-nowrap">
              <span>{displayLabel}</span>
              <ChevronDown className="h-4 w-4 text-zinc-400 dark:text-zinc-500 shrink-0" aria-hidden />
            </div>
            <select
              id={`${idPrefix}-cc`}
              value={value.countryCode}
              onChange={(e) => onChange({ ...value, countryCode: e.target.value })}
              onBlur={onBlur}
              disabled={disabled}
              aria-label={`${label} country code`}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            >
              {PHONE_COUNTRY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <input
            id={`${idPrefix}-num`}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Number"
            className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            value={value.nationalNumber}
            onChange={(e) => onChange({ ...value, nationalNumber: e.target.value.replace(/\D/g, "") })}
            onBlur={onBlur}
            disabled={disabled}
          />
        </div>
        {error ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p> : null}
      </div>
    </FormField>
  );
}

export default function PhoneFieldsGroup({
  telephone,
  whatsapp,
  fax,
  onChange,
  errors,
  disabled = false,
  embedded = false,
}: PhoneFieldsGroupProps) {
  if (embedded) {
    return (
      <div className="contents">
        <PhoneRowField
          idPrefix="phone-tel"
          label="Telephone Number"
          value={telephone}
          onChange={(next) => onChange("telephone", next)}
          error={errors?.telephone}
          disabled={disabled}
        />
        <PhoneRowField
          idPrefix="phone-wa"
          label="Phone Number (WhatsApp)"
          value={whatsapp}
          onChange={(next) => onChange("whatsapp", next)}
          error={errors?.whatsapp}
          disabled={disabled}
        />
        <PhoneRowField
          idPrefix="phone-fax"
          label="Fax"
          value={fax}
          onChange={(next) => onChange("fax", next)}
          error={errors?.fax}
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <div className="contents">
      <PhoneRowField
        idPrefix="phone-tel"
        label="Telephone Number"
        value={telephone}
        onChange={(next) => onChange("telephone", next)}
        error={errors?.telephone}
        disabled={disabled}
      />
      <div className="col-span-full grid gap-4 md:grid-cols-2">
        <PhoneRowField
          idPrefix="phone-wa"
          label="Phone Number (WhatsApp)"
          value={whatsapp}
          onChange={(next) => onChange("whatsapp", next)}
          error={errors?.whatsapp}
          disabled={disabled}
        />
        <PhoneRowField
          idPrefix="phone-fax"
          label="Fax"
          value={fax}
          onChange={(next) => onChange("fax", next)}
          error={errors?.fax}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
