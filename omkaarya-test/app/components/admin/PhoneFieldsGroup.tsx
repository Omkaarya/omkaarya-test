import SelectInput from "@/app/components/admin/SelectInput";
import TextInput from "@/app/components/admin/TextInput";
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
};

function PhoneRow({
  idPrefix,
  label,
  value,
  onChange,
}: {
  idPrefix: string;
  label: string;
  value: PhoneRowValue;
  onChange: (next: PhoneRowValue) => void;
}) {
  return (
    <FormField id={`${idPrefix}-num`} label={label}>
      <div className="flex gap-2">
        <SelectInput
          id={`${idPrefix}-cc`}
          className="w-22 shrink-0 sm:w-24"
          value={value.countryCode}
          onChange={(e) => onChange({ ...value, countryCode: e.target.value })}
          aria-label={`${label} country code`}
        >
          {PHONE_COUNTRY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </SelectInput>
        <TextInput
          id={`${idPrefix}-num`}
          type="tel"
          placeholder="Number"
          className="min-w-0 flex-1"
          value={value.nationalNumber}
          onChange={(e) => onChange({ ...value, nationalNumber: e.target.value })}
        />
      </div>
    </FormField>
  );
}

export default function PhoneFieldsGroup({
  telephone,
  whatsapp,
  fax,
  onChange,
}: PhoneFieldsGroupProps) {
  return (
    <div className="space-y-4">
      <PhoneRow
        idPrefix="phone-tel"
        label="Telephone Number"
        value={telephone}
        onChange={(next) => onChange("telephone", next)}
      />
      <PhoneRow
        idPrefix="phone-wa"
        label="WhatsApp"
        value={whatsapp}
        onChange={(next) => onChange("whatsapp", next)}
      />
      <PhoneRow
        idPrefix="phone-fax"
        label="Fax"
        value={fax}
        onChange={(next) => onChange("fax", next)}
      />
    </div>
  );
}
