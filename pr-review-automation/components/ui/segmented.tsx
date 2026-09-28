"use client";

import { cn } from "@/lib/utils";

/* Pill-group filter: the active option is solid ink, the rest are quiet. */
function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: Array<{ value: T; label: React.ReactNode }>;
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex rounded-md border border-line-strong bg-surface p-[3px]",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-sm px-3.5 py-[7px] text-[13.5px] transition-colors",
              active ? "bg-fg font-medium text-white" : "text-fg-muted hover:text-fg",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/* Underline tabs used under page headers. */
function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: Array<{ value: T; label: React.ReactNode; count?: number }>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div role="tablist" className={cn("flex gap-7 border-b border-line", className)}>
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 pt-1 pb-3 text-sm transition-colors",
              active
                ? "border-violet-500 font-semibold text-fg"
                : "border-transparent text-fg-muted hover:text-fg",
            )}
          >
            {tab.label}
            {tab.count !== undefined ? (
              <span
                className={cn(
                  "rounded-full px-2 py-px font-mono text-[11.5px]",
                  active ? "bg-violet-100 text-violet-600" : "bg-surface-muted text-fg-subtle",
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export { Segmented, Tabs };
