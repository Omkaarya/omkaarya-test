"use client";

import { useId, useMemo } from "react";
import SelectInput from "@/app/components/admin/SelectInput";
import TextInput from "@/app/components/admin/TextInput";
import {
  getCityOptions,
  optionsWithFallback,
  shouldUseCitySelect,
} from "@/lib/location-data";

type Props = {
  id?: string;
  countryIso: string;
  stateIso?: string;
  value: string;
  onChange: (city: string) => void;
  disabled?: boolean;
  placeholder?: string;
  "aria-invalid"?: boolean;
};

/** City picker: select when the list is moderate; otherwise text + datalist (full world). */
export default function LocationCityField({
  id: idProp,
  countryIso,
  stateIso = "",
  value,
  onChange,
  disabled,
  placeholder = "City or town",
  "aria-invalid": ariaInvalid,
}: Props) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const listId = `${id}-city-datalist`;

  const cityOptions = useMemo(() => {
    const base = getCityOptions(countryIso, stateIso || undefined);
    return optionsWithFallback(base, value);
  }, [countryIso, stateIso, value]);

  const useSelect = shouldUseCitySelect(cityOptions.length);

  if (useSelect) {
    return (
      <SelectInput
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-invalid={ariaInvalid}
      >
        <option value="">Select city</option>
        {cityOptions.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </SelectInput>
    );
  }

  return (
    <>
      <TextInput
        id={id}
        list={cityOptions.length > 0 ? listId : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={ariaInvalid}
      />
      {cityOptions.length > 0 ? (
        <datalist id={listId}>
          {cityOptions.slice(0, 500).map((c) => (
            <option key={c.value} value={c.value} />
          ))}
        </datalist>
      ) : null}
    </>
  );
}
