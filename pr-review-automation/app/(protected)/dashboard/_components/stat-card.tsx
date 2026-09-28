import type { LucideIcon } from "lucide-react";

/* Stat tile: label + icon, big display numeral with an optional note, then a detail line or visual. */
export function StatCard({
  label,
  icon: Icon,
  value,
  note,
  children,
}: {
  label: string;
  icon: LucideIcon;
  value: React.ReactNode;
  note?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-[13.5px] text-fg-muted">{label}</span>
        <Icon className="size-[17px] text-fg-faint" strokeWidth={1.9} aria-hidden="true" />
      </div>
      <div className="mt-2.5 flex items-baseline gap-2.5">
        <span className="font-display text-[34px] leading-none font-bold tracking-[-0.03em] text-fg">
          {value}
        </span>
        {note ? <span className="text-[13px] font-semibold text-fg-muted">{note}</span> : null}
      </div>
      {children ? <div className="mt-[18px]">{children}</div> : null}
    </div>
  );
}

/* Thin proportional bar split into segments (e.g. open vs draft, active vs paused). */
export function SplitBar({ parts }: { parts: Array<{ value: number; className: string }> }) {
  const total = parts.reduce((sum, part) => sum + part.value, 0);
  if (total === 0) {
    return <div className="h-2 rounded-full bg-surface-hover" aria-hidden="true" />;
  }
  return (
    <div className="flex h-2 gap-1" aria-hidden="true">
      {parts
        .filter((part) => part.value > 0)
        .map((part, index) => (
          <span
            key={index}
            className={`rounded-full ${part.className}`}
            style={{ width: `${(part.value / total) * 100}%` }}
          />
        ))}
    </div>
  );
}
