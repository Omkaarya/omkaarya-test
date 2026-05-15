import type { InputHTMLAttributes, ReactNode } from "react";
import { adminInputClassName } from "./inputStyles";

type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  className?: string;
  startIcon?: ReactNode;
};

export default function TextInput({ startIcon, className = "", id, ...props }: TextInputProps) {
  if (startIcon) {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
          {startIcon}
        </span>
        <input id={id} className={`${adminInputClassName} pl-10 pr-3 ${className}`.trim()} {...props} />
      </div>
    );
  }
  return <input id={id} className={`${adminInputClassName} px-3 ${className}`.trim()} {...props} />;
}
