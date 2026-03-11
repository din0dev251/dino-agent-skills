"use client";

type LoadingProps = {
  /** Kích thước: mặc định 10 (40px), sm = 6 (24px) */
  size?: "default" | "sm";
  className?: string;
};

const sizeClass = {
  default: "h-10 w-10",
  sm: "h-6 w-6",
};

export function Loading({ size = "default", className = "" }: LoadingProps) {
  return (
    <div
      className={`rounded-full border-2 border-gray-600 border-t-accent animate-spin ${sizeClass[size]} ${className}`.trim()}
      aria-hidden
    />
  );
}
