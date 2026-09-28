"use client";

import { ChevronDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";

/* Native select dressed as a toolbar button: "Language: All". Highlights violet when filtering. */
export function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  allValue,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  /** the value that means "no filter" — anything else is shown as active */
  allValue?: T;
}) {
  const active = allValue !== undefined && value !== allValue;
  return (
    <div className="relative inline-flex">
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className={cn(
          "h-[38px] appearance-none rounded-md border py-0 pr-8 pl-[13px] font-sans text-[13.5px] outline-none focus-visible:ring-3 focus-visible:ring-violet-500/25",
          active
            ? "border-violet-200 bg-violet-50 font-medium text-violet-700"
            : "border-line-strong bg-surface text-fg-2",
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {label}: {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2",
          active ? "text-violet-700" : "text-fg-subtle",
        )}
      />
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <div className="relative w-full sm:w-80">
      <label htmlFor="repo-search" className="sr-only">
        {label}
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#8B8798]"
      />
      <input
        id="repo-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-[38px] w-full rounded-md border border-line-strong bg-surface pr-3 pl-9 font-sans text-sm text-fg outline-none placeholder:text-fg-faint focus:border-violet-500 focus:shadow-[0_0_0_3px_rgba(91,54,232,0.14)]"
      />
    </div>
  );
}
