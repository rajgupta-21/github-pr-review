import { AlertTriangle, Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

/** Inline loading line for a panel or page region. */
function LoadingState({ label = "Loading…", className }: { label?: string; className?: string }) {
  return (
    <div
      role="status"
      className={cn("flex items-center justify-center gap-2.5 py-12 text-sm text-fg-subtle", className)}
    >
      <Loader2 className="size-4 animate-spin text-violet-500" aria-hidden="true" />
      {label}
    </div>
  );
}

/** Empty region: an icon tile, one heading, one line, optional action. */
function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-12 text-center", className)}>
      {icon ? (
        <span className="mb-4 inline-flex size-11 items-center justify-center rounded-[12px] bg-violet-50 text-violet-600 [&_svg]:size-5">
          {icon}
        </span>
      ) : null}
      <h3 className="font-display text-[17px] font-bold text-fg">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-fg-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/** Red-tinted banner for errors. */
function ErrorBanner({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2.5 rounded-[13px] border border-critical-line bg-[#FDF4F5] px-4 py-3 text-[13.5px] leading-snug text-[#7D1428]",
        className,
      )}
    >
      <AlertTriangle className="mt-px size-4 shrink-0 text-[#B3253C]" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export { EmptyState, ErrorBanner, LoadingState };
