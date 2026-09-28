import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { severityTone } from "@/lib/review";
import { cn } from "@/lib/utils";

/*
  Pills. Severity tones are reserved for findings — a red badge always means a
  finding. Use `pass`/`neutral` for status (Active / Paused), `violet` for counts.
*/
const badgeVariants = cva(
  "inline-flex shrink-0 items-center gap-1.5 rounded-full font-semibold whitespace-nowrap",
  {
    variants: {
      tone: {
        critical: "bg-critical-fill text-critical",
        high: "bg-high-fill text-high",
        medium: "bg-medium-fill text-medium",
        low: "bg-low-fill text-low",
        pass: "bg-pass-fill text-pass",
        neutral: "bg-surface-muted text-fg-3",
        muted: "bg-surface-hover text-fg-3",
        violet: "bg-violet-100 text-violet-600",
        outline: "border border-line-strong bg-surface font-medium text-fg-muted",
      },
      size: {
        sm: "px-[9px] py-0.5 text-[11px]",
        md: "px-2.5 py-[3px] text-[11.5px]",
        lg: "px-2.5 py-1 text-[12.5px]",
      },
      caps: {
        true: "tracking-[0.04em] uppercase",
        false: "",
      },
    },
    defaultVariants: { tone: "neutral", size: "md", caps: false },
  },
);

const DOT: Record<string, string> = {
  critical: "bg-critical-solid",
  high: "bg-high-solid",
  medium: "bg-medium-solid",
  low: "bg-low-solid",
  pass: "bg-pass-solid",
  neutral: "bg-fg-faint",
  muted: "bg-fg-faint",
  violet: "bg-violet-500",
  outline: "bg-fg-faint",
};

type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { dot?: boolean };

function Badge({ className, tone, size, caps, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone, size, caps }), className)} {...props}>
      {dot ? (
        <span
          aria-hidden="true"
          className={cn("size-1.5 rounded-full", DOT[tone ?? "neutral"])}
        />
      ) : null}
      {children}
    </span>
  );
}

/** CRITICAL / HIGH / MEDIUM / LOW pill for a finding's severity string. */
function SeverityBadge({
  severity,
  count,
  size = "md",
  className,
}: {
  severity: string;
  count?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const tone = severityTone(severity);
  return (
    <Badge tone={tone} size={size} caps className={className}>
      {count !== undefined ? `${count} ` : ""}
      {tone}
    </Badge>
  );
}

export { Badge, badgeVariants, SeverityBadge };
