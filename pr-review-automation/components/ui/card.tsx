import * as React from "react";

import { cn } from "@/lib/utils";

/* White panel on paper: 16px radius, 1px warm line. */
function Card({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="card"
      className={cn("overflow-hidden rounded-xl border border-line bg-surface", className)}
      {...props}
    />
  );
}

/* Header row: 18px card heading on the left, a link or control on the right. */
function CardHeader({
  title,
  action,
  children,
  className,
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-b border-line-soft px-5 py-[18px]",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <h2 className="font-display text-lg font-bold text-fg">{title}</h2>
        {children}
      </div>
      {action ? <div className="shrink-0 text-[13.5px] font-medium">{action}</div> : null}
    </div>
  );
}

function CardBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-5 py-[18px]", className)} {...props} />;
}

export { Card, CardBody, CardHeader };
