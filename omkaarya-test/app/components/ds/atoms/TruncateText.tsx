import React from "react";

export interface TruncateTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Tooltip text; defaults to string children when children is plain text. */
  title?: string;
}

function defaultTitle(children: React.ReactNode): string | undefined {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  return undefined;
}

export const TruncateText: React.FC<TruncateTextProps> = ({
  children,
  className = "",
  title,
  ...props
}) => (
  <span
    className={`block min-w-0 truncate ${className}`.trim()}
    title={title ?? defaultTitle(children)}
    {...props}
  >
    {children}
  </span>
);
