"use client";

import { AlertTriangle, Check, GitPullRequest, Zap } from "lucide-react";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { timeAgo } from "@/lib/format";
import { type CachedReview, countBySeverity, readCachedReview, toPercent } from "@/lib/review";
import type { ConnectedRepo, PullRequest } from "@/lib/types";
import { cn } from "@/lib/utils";

export type OpenPull = { repo: ConnectedRepo; pr: PullRequest };

const LIMIT = 6;

const subscribeNever = () => () => {};

function worstFinding(entry: CachedReview | null) {
  if (!entry) return null;
  const counts = countBySeverity(entry.review.findings);
  if (counts.critical) return { tone: "critical" as const, count: counts.critical };
  if (counts.high) return { tone: "high" as const, count: counts.high };
  if (counts.medium) return { tone: "medium" as const, count: counts.medium };
  if (counts.low) return { tone: "low" as const, count: counts.low };
  return { tone: "pass" as const, count: 0 };
}

const TILE = {
  critical: { className: "bg-critical-fill text-[#B3253C]", Icon: AlertTriangle },
  high: { className: "bg-high-fill text-[#9A5A0B]", Icon: Zap },
  medium: { className: "bg-medium-fill text-medium", Icon: AlertTriangle },
  low: { className: "bg-low-fill text-low", Icon: AlertTriangle },
  pass: { className: "bg-pass-fill text-pass-solid", Icon: Check },
  none: { className: "bg-surface-hover text-fg-muted", Icon: GitPullRequest },
};

/** "Needs your attention": open PRs across connected repos, newest first. */
export function AttentionList({ pulls }: { pulls: OpenPull[] }) {
  // Cached reviews live in sessionStorage — only read on the client so SSR and hydration agree.
  const isClient = useSyncExternalStore(subscribeNever, () => true, () => false);
  const reviews = useMemo(() => {
    const next: Record<string, CachedReview | null> = {};
    if (!isClient) return next;
    for (const { repo, pr } of pulls) {
      next[`${repo.repoId}:${pr.githubPrNumber}`] = readCachedReview(repo.repoId, pr.githubPrNumber);
    }
    return next;
  }, [isClient, pulls]);

  const shown = pulls.slice(0, LIMIT);
  const hidden = pulls.length - shown.length;

  return (
    <Card>
      <CardHeader
        title="Needs your attention"
        action={<Link href="/repos">All repositories →</Link>}
      >
        <Badge tone={pulls.length ? "violet" : "neutral"} size="lg" className="py-0.5 text-xs">
          {pulls.length}
        </Badge>
      </CardHeader>

      {pulls.length === 0 ? (
        <EmptyState
          icon={<Check />}
          title="Nothing is waiting on you"
          description="There are no open pull requests on your connected repositories."
        />
      ) : (
        <div className="px-2 pt-2 pb-3">
          {shown.map(({ repo, pr }, index) => {
            const cached = reviews[`${repo.repoId}:${pr.githubPrNumber}`] ?? null;
            const worst = worstFinding(cached);
            const tile = TILE[worst?.tone ?? "none"];
            const score = cached ? toPercent(cached.review.overallScore) : null;

            return (
              <div key={pr._id}>
                {index > 0 ? <div className="mx-3 h-px bg-line-soft" /> : null}
                <Link
                  href={`/repos/${repo.repoId}/pulls/${pr.githubPrNumber}`}
                  className="flex flex-wrap items-center gap-3.5 rounded-[12px] px-3 py-3.5 text-inherit no-underline transition-colors hover:bg-surface-sunken hover:text-inherit sm:flex-nowrap"
                >
                  <span
                    className={cn(
                      "inline-flex size-[38px] shrink-0 items-center justify-center rounded-[11px]",
                      tile.className,
                    )}
                  >
                    <tile.Icon className="size-[19px]" strokeWidth={2} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-[9px]">
                      <span className="shrink-0 font-mono text-[12.5px] text-fg-subtle">
                        #{pr.githubPrNumber}
                      </span>
                      <span className="truncate text-[15px] font-semibold text-fg">{pr.title}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] text-[#6B6880]">
                      <span className="font-mono">{repo.fullName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Avatar
                          name={pr.author?.login}
                          src={pr.author?.avatarUrl}
                          size={18}
                          className="sm:hidden"
                        />
                        {pr.author?.login}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{timeAgo(pr.createdAtGithub)}</span>
                    </div>
                  </div>
                  <div className="ml-[52px] flex shrink-0 items-center gap-2 sm:ml-0">
                    {pr.draft ? (
                      <Badge tone="outline" size="lg">
                        Draft
                      </Badge>
                    ) : null}
                    {cached && worst ? (
                      <>
                        {worst.tone !== "pass" ? (
                          <Badge tone={worst.tone} size="lg">
                            {worst.count} {worst.tone}
                          </Badge>
                        ) : (
                          <Badge tone="pass" size="lg">
                            Clean
                          </Badge>
                        )}
                        <Badge tone="neutral" size="lg">
                          Score {score ?? "—"}
                        </Badge>
                      </>
                    ) : (
                      <Badge tone="neutral" size="lg">
                        Not reviewed
                      </Badge>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}

          {hidden > 0 ? (
            <>
              <div className="mx-3 h-px bg-line-soft" />
              <div className="flex items-center gap-3.5 px-3 py-3.5">
                <span className="inline-flex size-[38px] shrink-0 items-center justify-center rounded-[11px] bg-surface-hover text-fg-muted">
                  <GitPullRequest className="size-[19px]" aria-hidden="true" />
                </span>
                <div className="text-[14.5px] text-fg-3">
                  {hidden} more open pull {hidden === 1 ? "request" : "requests"} across your
                  repositories.
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </Card>
  );
}
