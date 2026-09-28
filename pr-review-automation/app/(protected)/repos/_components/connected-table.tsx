"use client";

import { BookMarked, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRepoPulls } from "@/lib/api";
import { pluralize, timeAgo } from "@/lib/format";
import { countBySeverity, readCachedReview } from "@/lib/review";
import type { ConnectedRepo } from "@/lib/types";
import { cn } from "@/lib/utils";

import { RepoMeta } from "./repo-meta";
import { hasWorkflow } from "./use-repositories";

const COLUMNS = "md:grid-cols-[minmax(0,1fr)_120px_130px_176px_130px_112px]";

type PullSummary =
  | { state: "loading" }
  | { state: "error" }
  | { state: "done"; open: number; critical: number; high: number };

/** Open PR count for one row, fetched lazily; cached AI reviews add the worst-severity pill. */
function useOpenPulls(repo: ConnectedRepo): PullSummary {
  const [summary, setSummary] = useState<PullSummary>({ state: "loading" });

  useEffect(() => {
    let cancelled = false;
    getRepoPulls(repo)
      .then((pulls) => {
        if (cancelled) return;
        const open = pulls.filter((pr) => pr.state === "open");
        let critical = 0;
        let high = 0;
        for (const pr of open) {
          const cached = readCachedReview(repo.repoId, pr.githubPrNumber);
          if (!cached) continue;
          const counts = countBySeverity(cached.review.findings);
          critical += counts.critical;
          high += counts.high;
        }
        setSummary({ state: "done", open: open.length, critical, high });
      })
      .catch(() => !cancelled && setSummary({ state: "error" }));
    return () => {
      cancelled = true;
    };
  }, [repo]);

  return summary;
}

function OpenPulls({ repo }: { repo: ConnectedRepo }) {
  const summary = useOpenPulls(repo);
  if (summary.state === "loading") {
    return <span className="inline-block h-4 w-6 animate-pulse rounded bg-surface-hover" aria-label="Loading" />;
  }
  if (summary.state === "error") {
    return <span className="text-[13.5px] text-fg-faint">Unavailable</span>;
  }
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[15px] text-fg">{summary.open}</span>
      {summary.critical > 0 ? (
        <Badge tone="critical" size="sm" className="text-[11.5px]">
          {summary.critical} crit
        </Badge>
      ) : summary.high > 0 ? (
        <Badge tone="high" size="sm" className="text-[11.5px]">
          {summary.high} high
        </Badge>
      ) : null}
    </div>
  );
}

function CellLabel({ children }: { children: React.ReactNode }) {
  return <span className="eyebrow w-28 shrink-0 md:hidden">{children}</span>;
}

function RepoRow({ repo, last }: { repo: ConnectedRepo; last: boolean }) {
  const configured = hasWorkflow(repo);
  const nodes = repo.workflow?.nodes?.length ?? 0;

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 px-5 py-4 md:items-center md:gap-4",
        COLUMNS,
        !last && "border-b border-line-soft",
        !configured && "bg-[#FDFCF8]",
      )}
    >
      <div className="flex min-w-0 items-center gap-[13px]">
        <span
          className={cn(
            "inline-flex size-[38px] shrink-0 items-center justify-center rounded-[11px]",
            configured ? "bg-violet-100 text-violet-600" : "bg-surface-hover text-fg-subtle",
          )}
        >
          <BookMarked className="size-[18px]" strokeWidth={1.9} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <Link
            href={`/repos/${repo.repoId}`}
            className="block truncate text-[15px] font-semibold text-fg hover:text-violet-600"
          >
            {repo.fullName}
          </Link>
          <RepoMeta
            language={repo.language}
            isPrivate={repo.visibility === "private"}
            branch={repo.defaultBranch}
          />
        </div>
      </div>

      <div className="flex items-center">
        <CellLabel>Open PRs</CellLabel>
        <OpenPulls repo={repo} />
      </div>

      <div className="flex items-center">
        <CellLabel>Webhook</CellLabel>
        {repo.webhookActive ? (
          <Badge tone="pass" size="lg" dot>
            Active
          </Badge>
        ) : (
          <Badge tone="muted" size="lg" dot>
            Not installed
          </Badge>
        )}
      </div>

      <div className="flex items-center">
        <CellLabel>Workflow</CellLabel>
        {configured ? (
          <Badge tone="pass" size="lg" dot className="px-[11px] py-[5px]">
            {repo.workflow?.definition?.status === "disabled"
              ? "Disabled"
              : pluralize(nodes, "node")}
          </Badge>
        ) : (
          <Badge tone="high" size="lg" dot className="px-[11px] py-[5px]">
            None assigned
          </Badge>
        )}
      </div>

      <div className="flex items-center md:block">
        <CellLabel>Connected</CellLabel>
        <div className="text-[13.5px] text-fg-3">
          {timeAgo(repo.createdAt)}
          {configured && repo.workflow?.updatedAt ? (
            <div className="mt-[3px] hidden text-[12.5px] text-fg-faint md:block">
              edited {timeAgo(repo.workflow.updatedAt)}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-1.5 md:justify-end">
        {configured ? (
          <Button asChild variant="tertiary" size="sm" className="h-[34px] px-[13px]">
            <Link href={`/repos/${repo.repoId}`}>Open</Link>
          </Button>
        ) : (
          <Button asChild variant="primary" size="sm" className="h-[34px] px-[13px]">
            <Link href={`/workflow?repoId=${repo.repoId}`}>Set up</Link>
          </Button>
        )}
        {repo.repoUrl ? (
          <Button asChild variant="tertiary" size="icon-sm">
            <a
              href={repo.repoUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${repo.fullName} on GitHub`}
              title="Open on GitHub"
            >
              <ExternalLink className="text-fg-muted" aria-hidden="true" />
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function ConnectedTable({ repos }: { repos: ConnectedRepo[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div
        className={cn(
          "hidden items-center gap-4 border-b border-line-soft bg-surface-sunken px-5 py-3 text-xs tracking-[0.07em] text-fg-subtle uppercase md:grid",
          COLUMNS,
        )}
      >
        <span>Repository</span>
        <span>Open PRs</span>
        <span>Webhook</span>
        <span>Workflow</span>
        <span>Connected</span>
        <span className="sr-only">Actions</span>
      </div>
      {repos.map((repo, index) => (
        <RepoRow key={repo._id} repo={repo} last={index === repos.length - 1} />
      ))}
    </div>
  );
}
