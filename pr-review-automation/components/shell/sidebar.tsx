"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo, LogoMark } from "@/components/ui/brand";
import { getConnectedRepos } from "@/lib/api";
import { cn } from "@/lib/utils";

import { AccountMenu } from "./account-menu";
import { isActive, WORKSPACE_NAV } from "./nav";

function useConnectedCount() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    getConnectedRepos()
      .then((repos) => !cancelled && setCount(repos.length))
      .catch(() => !cancelled && setCount(null));
    return () => {
      cancelled = true;
    };
  }, []);
  return count;
}

/** 244px ink sidebar with labelled navigation (Dashboard). */
export function Sidebar() {
  const pathname = usePathname();
  const repoCount = useConnectedCount();

  return (
    <aside className="sticky top-0 hidden h-screen w-[244px] shrink-0 flex-col bg-ink-900 px-4 py-[22px] lg:flex">
      <Logo href="/dashboard" className="px-2 pb-[22px]" />

      <div className="px-2 pb-2.5 text-[11.5px] tracking-[0.12em] text-ink-faint uppercase">
        Workspace
      </div>
      <nav aria-label="Workspace" className="flex flex-col gap-[3px]">
        {WORKSPACE_NAV.map((item) => {
          const active = isActive(pathname, item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-[11px] rounded-md px-3 py-[11px] text-[14.5px] no-underline transition-colors",
                active
                  ? "bg-ink-700 font-semibold text-white hover:text-white"
                  : "text-ink-muted hover:bg-ink-800 hover:text-ink-fg",
              )}
            >
              <Icon
                className={cn("size-[18px]", active ? "text-violet-300" : "text-ink-subtle")}
                strokeWidth={1.9}
                aria-hidden="true"
              />
              {item.label}
              {item.href === "/repos" && repoCount !== null ? (
                <span className="ml-auto rounded-full bg-ink-750 px-2 py-0.5 font-mono text-[11.5px] text-violet-300">
                  {repoCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div className="mt-4 border-t border-[#262246] pt-4">
        <AccountMenu />
      </div>
    </aside>
  );
}

/** 72px collapsed icon rail (dense screens like the repositories table). */
export function Rail() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[72px] shrink-0 flex-col items-center gap-1.5 bg-ink-900 py-[22px] lg:flex">
      <Link href="/dashboard" aria-label="Mergegate home" className="mb-[18px] text-violet-400">
        <LogoMark />
      </Link>
      <nav aria-label="Workspace" className="flex flex-col items-center gap-1.5">
        {WORKSPACE_NAV.map((item) => {
          const active = isActive(pathname, item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              title={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex size-[42px] items-center justify-center rounded-[11px] transition-colors",
                active ? "bg-ink-700" : "hover:bg-ink-800",
              )}
            >
              <Icon
                className={cn("size-[19px]", active ? "text-violet-300" : "text-ink-subtle")}
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </nav>
      <div className="flex-1" />
      <AccountMenu compact />
    </aside>
  );
}

/** Top bar for small screens, where the sidebar and rail are hidden. */
export function MobileBar() {
  const pathname = usePathname();
  return (
    <div className="sticky top-0 z-40 flex items-center gap-3 bg-ink-900 px-4 py-3 lg:hidden">
      <Logo href="/dashboard" size={22} />
      <nav aria-label="Workspace" className="ml-auto flex items-center gap-1">
        {WORKSPACE_NAV.map((item) => {
          const active = isActive(pathname, item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-[11px]",
                active ? "bg-ink-700" : "",
              )}
            >
              <Icon
                className={cn("size-[18px]", active ? "text-violet-300" : "text-ink-subtle")}
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
