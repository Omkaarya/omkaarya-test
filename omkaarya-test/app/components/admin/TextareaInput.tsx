import type { TextareaHTMLAttributes } from "react";
import { adminTextareaClassName } from "./inputStyles";

type TextareaInputProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & {
  className?: string;
};

export default function TextareaInput({ className = "", id, ...props }: TextareaInputProps) {
  return <textarea id={id} className={`${adminTextareaClassName} ${className}`.trim()} {...props} />;
}
