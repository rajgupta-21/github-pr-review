import { cn } from "@/lib/utils";

import { MobileBar, Rail, Sidebar } from "./sidebar";
import { type Crumb, Topbar } from "./topbar";

/*
  Three shells, matching the design:
  - "sidebar": 244px labelled sidebar (Dashboard)
  - "rail":    72px icon rail (Repositories table)
  - "topbar":  full-width ink top bar with breadcrumb (detail screens)
*/
export function SidebarShell({
  variant = "sidebar",
  header,
  children,
  className,
}: {
  variant?: "sidebar" | "rail";
  /** optional white 66px page header row (search, buttons) */
  header?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex min-h-screen bg-paper">
      {variant === "sidebar" ? <Sidebar /> : <Rail />}
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileBar />
        {header ? (
          <header className="flex min-h-[66px] shrink-0 flex-wrap items-center gap-3 border-b border-line bg-surface px-4 py-3 sm:px-8">
            {header}
          </header>
        ) : null}
        <main className={cn("min-w-0 flex-1 px-4 py-7 sm:px-8", className)}>{children}</main>
      </div>
    </div>
  );
}

export function TopbarShell({
  crumbs,
  actions,
  children,
  className,
}: {
  crumbs: Crumb[];
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Topbar crumbs={crumbs} actions={actions} />
      <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col", className)}>{children}</div>
    </div>
  );
}

/** Page title block: 30px display heading + one-line description. */
export function PageHeading({
  title,
  description,
  aside,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <h1 className="font-display text-[30px] leading-tight font-bold tracking-[-0.025em] text-fg">
          {title}
        </h1>
        {description ? (
          <p className="mt-[7px] text-[15px] text-fg-muted">{description}</p>
        ) : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  );
}

export type { Crumb };
