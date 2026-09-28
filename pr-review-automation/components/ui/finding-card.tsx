import { severityTone } from "@/lib/review";
import type { ReviewFinding } from "@/lib/types";
import { cn } from "@/lib/utils";

import { SeverityBadge } from "./badge";

const STRIPE: Record<string, string> = {
  critical: "bg-critical-solid",
  high: "bg-high-solid",
  medium: "bg-medium-solid",
  low: "bg-low-solid",
};

/*
  Finding card anatomy: severity stripe, badge + file, one sentence naming the
  defect, then why it matters and the concrete change. `children` renders under
  the body (e.g. actions).
*/
function FindingCard({
  finding,
  compact = false,
  className,
  children,
}: {
  finding: ReviewFinding;
  compact?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const tone = severityTone(finding.severity);

  return (
    <article
      className={cn(
        "flex overflow-hidden rounded-[13px] border border-line bg-surface",
        className,
      )}
    >
      <span aria-hidden="true" className={cn("w-1 shrink-0", STRIPE[tone])} />
      <div className={cn("min-w-0 flex-1", compact ? "px-[15px] py-[13px]" : "px-5 py-[18px]")}>
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={finding.severity} size="sm" />
          {finding.file ? (
            <span className="truncate font-mono text-[11.5px] text-violet-600">
              {finding.file}
            </span>
          ) : null}
        </div>
        <h3
          className={cn(
            "mt-2 font-semibold text-fg",
            compact ? "text-sm" : "text-[15.5px] leading-snug",
          )}
        >
          {finding.issue}
        </h3>
        {finding.reason ? (
          <p
            className={cn(
              "mt-1.5 text-fg-muted",
              compact ? "text-[12.5px] leading-[1.55]" : "text-sm leading-relaxed",
            )}
          >
            {finding.reason}
          </p>
        ) : null}
        {!compact && finding.suggestion ? (
          <div className="mt-3 rounded-[11px] border border-line bg-surface-sunken px-3.5 py-3">
            <div className="eyebrow">Suggested change</div>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-fg-2">
              {finding.suggestion}
            </p>
          </div>
        ) : null}
        {children}
      </div>
    </article>
  );
}

export { FindingCard };
