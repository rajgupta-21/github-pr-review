"use client";

import Link from "next/link";
import { Fragment } from "react";

import { Avatar } from "@/components/ui/avatar";
import { LogoMark } from "@/components/ui/brand";
import { cn } from "@/lib/utils";

import { displayName, useUser } from "./user-context";

export type Crumb = {
  label: string;
  href?: string;
  /** render as a literal value (repo names, PR numbers) */
  mono?: boolean;
};

/*
  56px ink top bar with breadcrumb, used by the detail screens (repository,
  PR review, AI report, workflow builder). `actions` sits on the right.
*/
export function Topbar({
  crumbs,
  actions,
  className,
}: {
  crumbs: Crumb[];
  actions?: React.ReactNode;
  className?: string;
}) {
  const user = useUser();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3.5 bg-ink-900 px-4 sm:px-6",
        className,
      )}
    >
      <Link href="/dashboard" aria-label="Mergegate home" className="inline-flex text-violet-400">
        <LogoMark size={22} />
      </Link>

      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 items-center gap-[9px] overflow-hidden text-[13.5px] text-ink-subtle"
      >
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1;
          const text = (
            <span className={cn("truncate", crumb.mono && "font-mono text-[13px]")}>
              {crumb.label}
            </span>
          );
          return (
            <Fragment key={`${crumb.label}-${index}`}>
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {last || !crumb.href ? (
                <span
                  aria-current={last ? "page" : undefined}
                  className={cn("min-w-0", last ? "text-ink-fg" : "text-ink-muted")}
                >
                  {text}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="min-w-0 text-ink-muted no-underline hover:text-ink-fg"
                >
                  {text}
                </Link>
              )}
            </Fragment>
          );
        })}
      </nav>

      <div className="flex-1" />
      {actions ? <div className="flex shrink-0 items-center gap-2.5">{actions}</div> : null}
      <Avatar name={displayName(user)} src={user?.githubAvatarUrl} tone="ink" size={30} />
    </header>
  );
}
