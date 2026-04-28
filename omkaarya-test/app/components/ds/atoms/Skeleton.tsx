import React from "react";

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  circle,
  className = "",
}) => {
  const style: React.CSSProperties = {
    width: width,
    height: height,
    borderRadius: circle ? "50%" : "var(--radius-sm, 6px)",
  };

  return (
    <div
      className={`animate-pulse bg-gray-100 dark:bg-gray-800 ${className}`}
      style={style}
    />
  );
};
