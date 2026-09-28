"use client";

import { CheckCircle2, ChevronDown, ChevronUp, Download } from "lucide-react";
import Link from "next/link";
import { use, useMemo, useState } from "react";

import { TopbarShell } from "@/components/shell/app-shell";
import { Badge, SeverityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorBanner, LoadingState } from "@/components/ui/feedback";
import { formatDate, pluralize, timeAgo } from "@/lib/format";
import {
  type CachedReview,
  countBySeverity,
  gateHeld,
  scoreBarClass,
  scoreTextClass,
  type SeverityTone,
  severityTone,
  sortFindings,
} from "@/lib/review";
import type { ReviewFinding, ReviewResult } from "@/lib/types";
import { cn } from "@/lib/utils";

import { usePull, useRepo, useReview } from "../../../_components/hooks";
import {
  BotMark,
  formatDuration,
  RecommendationBadge,
  reviewScores,
  SEVERITY_DOT,
} from "../../../_components/review-bits";
import { RunReviewForm } from "../../../_components/review-rail";

type Filter = "all" | SeverityTone;
const TONES: SeverityTone[] = ["critical", "high", "medium", "low"];

export default function ReviewReportPage({
  params,
}: {
  params: Promise<{ repoId: string; prNumber: string }>;
}) {
  const { repoId, prNumber } = use(params);
  const { repo, error: repoError } = useRepo(repoId);
  const { pull } = usePull(repo, prNumber);
  const { entry, review, running, error, run } = useReview(repo, repoId, prNumber);
  const [filter, setFilter] = useState<Filter>("all");

  const prHref = `/repos/${repoId}/pulls/${prNumber}`;
  const crumbs = [
    { label: "Repositories", href: "/repos" },
    { label: repo?.fullName ?? "…", href: `/repos/${repoId}`, mono: true },
    { label: `#${prNumber}`, href: prHref, mono: true },
    { label: "AI review" },
  ];

  const exportReport = () => {
    if (!entry || !repo) return;
    const markdown = reviewToMarkdown(entry, repo.fullName, prNumber, pull?.title);
    const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${repo.name}-pr-${prNumber}-review.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (repoError) {
    return (
      <TopbarShell crumbs={crumbs}>
        <div className="p-7">
          <ErrorBanner>{repoError}</ErrorBanner>
        </div>
      </TopbarShell>
    );
  }

  if (!repo) {
    return (
      <TopbarShell crumbs={crumbs}>
        <LoadingState label="Loading…" />
      </TopbarShell>
    );
  }

  if (!review || !entry) {
    return (
      <TopbarShell crumbs={crumbs}>
        <div className="mx-auto w-full max-w-lg px-4 py-10">
          <div className="rounded-xl border border-line bg-surface p-6">
            <EmptyState
              icon={<BotMark size={44} className="rounded-[12px]" />}
              title={`No AI review for PR #${prNumber} yet`}
              description="Run one now — it reads every changed file and takes around half a minute."
              className="py-6"
            />
            {error ? <ErrorBanner className="mb-4">{error}</ErrorBanner> : null}
            <RunReviewForm running={running} onRun={run} />
            <Link href={prHref} className="mt-4 block text-center text-[13.5px]">
              Back to the pull request
            </Link>
          </div>
        </div>
      </TopbarShell>
    );
  }

  return (
    <TopbarShell
      crumbs={crumbs}
      actions={
        <Button variant="ink" size="sm" onClick={exportReport} className="hidden sm:inline-flex">
          <Download aria-hidden="true" />
          Export report
        </Button>
      }
    >
      <ReportHeader
        entry={entry}
        prNumber={prNumber}
        changedFiles={pull?.changedFiles}
        running={running}
        onRerun={() => run()}
      />
      {error ? (
        <div className="px-4 pt-4 sm:px-7">
          <ErrorBanner>{error}</ErrorBanner>
        </div>
      ) : null}

      <div className="flex flex-col gap-[18px] px-4 py-5 sm:px-7 lg:flex-row lg:items-start">
        <Findings review={review} filter={filter} onFilter={setFilter} prHref={prHref} />
        <ReportRail entry={entry} repoId={repoId} />
      </div>
    </TopbarShell>
  );
}

function ReportHeader({
  entry,
  prNumber,
  changedFiles,
  running,
  onRerun,
}: {
  entry: CachedReview;
  prNumber: string;
  changedFiles?: number;
  running: boolean;
  onRerun: () => void;
}) {
  const { review } = entry;
  const scores = reviewScores(review);
  const tiles = [
    { label: "Overall", value: scores.overall },
    { label: "Security", value: scores.security },
    { label: "Performance", value: scores.performance },
    { label: "Quality", value: scores.quality },
  ];

  return (
    <div className="flex shrink-0 flex-col gap-6 border-b border-line bg-surface px-4 py-6 sm:px-7 xl:flex-row xl:items-center xl:gap-8">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-[11px]">
          <BotMark size={34} className="rounded-md" />
          <h1 className="font-display text-[26px] font-bold tracking-[-0.02em]">
            AI review of PR #{prNumber}
          </h1>
          <RecommendationBadge review={review} />
        </div>
        {review.summary ? (
          <p className="mt-3 max-w-[760px] text-[15px] leading-[1.62] text-fg-3">{review.summary}</p>
        ) : null}
        <div className="mt-3.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[13px] text-fg-subtle">
          <span>Ran {timeAgo(entry.ranAt)}</span>
          {entry.durationMs ? (
            <>
              <span aria-hidden="true">·</span>
              <span>took {formatDuration(entry.durationMs)}</span>
            </>
          ) : null}
          {changedFiles !== undefined ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{pluralize(changedFiles, "file")} read</span>
            </>
          ) : null}
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={onRerun}
            disabled={running}
            className="font-medium text-violet-600 hover:text-violet-700 disabled:text-fg-faint"
          >
            {running ? "Re-running…" : "Re-run review"}
          </button>
        </div>
      </div>
      <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((tile) => {
          const weak = tile.label === "Security" && (tile.value ?? 100) < 60;
          return (
            <div
              key={tile.label}
              className={cn(
                "rounded-[15px] border px-4 py-[18px] text-center xl:w-[148px]",
                weak ? "border-critical-line bg-[#FDF7F8]" : "border-line bg-surface-sunken",
              )}
            >
              <div
                className={cn(
                  "text-xs tracking-[0.07em] uppercase",
                  weak ? "text-[#9A6672]" : "text-fg-subtle",
                )}
              >
                {tile.label}
              </div>
              <div
                className={cn(
                  "mt-1.5 font-display text-[42px] leading-none font-bold tracking-[-0.03em]",
                  scoreTextClass(tile.value),
                )}
              >
                {tile.value ?? "—"}
              </div>
              <div
                className={cn(
                  "mt-2.5 h-1.5 overflow-hidden rounded-full",
                  weak ? "bg-[#F5DDE2]" : "bg-line-soft",
                )}
              >
                <div
                  className={cn("h-full rounded-full", scoreBarClass(tile.value))}
                  style={{ width: `${tile.value ?? 0}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Findings({
  review,
  filter,
  onFilter,
  prHref,
}: {
  review: ReviewResult;
  filter: Filter;
  onFilter: (filter: Filter) => void;
  prHref: string;
}) {
  const findings = sortFindings(review.findings);
  const counts = countBySeverity(findings);
  const visible =
    filter === "all" ? findings : findings.filter((f) => severityTone(f.severity) === filter);

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-[19px] font-bold">
          {pluralize(findings.length, "finding")}
        </h2>
        <div className="flex-1" />
        <div role="group" aria-label="Filter by severity" className="flex flex-wrap gap-2">
          <FilterPill active={filter === "all"} onClick={() => onFilter("all")}>
            All {findings.length}
          </FilterPill>
          {TONES.map((tone) => (
            <FilterPill key={tone} active={filter === tone} onClick={() => onFilter(tone)}>
              <span aria-hidden="true" className={cn("size-[7px] rounded-full", SEVERITY_DOT[tone])} />
              <span className="capitalize">{tone}</span> {counts[tone]}
            </FilterPill>
          ))}
        </div>
      </div>

      {findings.length === 0 ? (
        <div className="rounded-[15px] border border-[#C9E4D6] bg-[#F3FAF6] px-5 py-6 text-[14.5px] text-[#2C5344]">
          No findings — the review found nothing to flag in this pull request.
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-[15px] border border-line bg-surface px-5 py-6 text-sm text-fg-muted">
          No {filter} findings.
        </div>
      ) : (
        visible.map((finding, index) => (
          <FindingArticle
            key={`${finding.file}-${index}`}
            finding={finding}
            prHref={prHref}
            defaultOpen={["critical", "high"].includes(severityTone(finding.severity))}
          />
        ))
      )}
    </section>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-[7px] rounded-full px-[13px] py-[7px] text-[13px]",
        active
          ? "bg-fg font-medium text-white"
          : "border border-line-strong bg-surface text-fg-2 hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

const STRIPE: Record<SeverityTone, string> = SEVERITY_DOT as Record<SeverityTone, string>;

function FindingArticle({
  finding,
  prHref,
  defaultOpen,
}: {
  finding: ReviewFinding;
  prHref: string;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const tone = severityTone(finding.severity);
  const fileLink = finding.file ? (
    <Link
      href={`${prHref}#file-${finding.file.replace(/[^a-zA-Z0-9]+/g, "-")}`}
      className="font-mono text-[12.5px] break-all"
    >
      {finding.file}
    </Link>
  ) : null;

  if (!open) {
    return (
      <article className="flex overflow-hidden rounded-[15px] border border-line bg-surface">
        <span aria-hidden="true" className={cn("w-1 shrink-0", STRIPE[tone])} />
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 px-5 py-3.5">
          <SeverityBadge severity={finding.severity} />
          <span className="min-w-0 flex-1 text-[15px] font-medium text-fg">{finding.issue}</span>
          {fileLink}
          <button
            type="button"
            aria-label="Expand finding"
            aria-expanded={false}
            onClick={() => setOpen(true)}
            className="inline-flex size-7 items-center justify-center rounded-sm border border-line-strong bg-surface text-fg-muted hover:text-fg"
          >
            <ChevronDown className="size-4" aria-hidden="true" />
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="flex overflow-hidden rounded-[15px] border border-line bg-surface">
      <span aria-hidden="true" className={cn("w-1 shrink-0", STRIPE[tone])} />
      <div className="min-w-0 flex-1 px-5 py-[18px]">
        <div className="flex flex-wrap items-center gap-2.5">
          <SeverityBadge severity={finding.severity} />
          {fileLink}
          <div className="flex-1" />
          <button
            type="button"
            aria-label="Collapse finding"
            aria-expanded
            onClick={() => setOpen(false)}
            className="inline-flex size-7 items-center justify-center rounded-sm border border-line-strong bg-surface text-fg-muted hover:text-fg"
          >
            <ChevronUp className="size-4" aria-hidden="true" />
          </button>
        </div>
        <h3
          className={cn(
            "mt-3",
            tone === "critical"
              ? "font-display text-xl font-bold tracking-[-0.015em]"
              : "text-[16.5px] font-semibold",
          )}
        >
          {finding.issue}
        </h3>
        <div className="mt-3.5 grid gap-5 md:grid-cols-2">
          <div>
            <div className="eyebrow">Why it matters</div>
            <p className="mt-2 text-sm leading-[1.62] text-fg-3">{finding.reason || "—"}</p>
          </div>
          <div>
            <div className="eyebrow">Suggested fix</div>
            <p className="mt-2 text-sm leading-[1.62] text-fg-3">{finding.suggestion || "—"}</p>
          </div>
        </div>
        <div className="mt-4">
          <Button asChild variant={tone === "critical" ? "primary" : "tertiary"} size="sm">
            <Link
              href={`${prHref}${
                finding.file ? `#file-${finding.file.replace(/[^a-zA-Z0-9]+/g, "-")}` : ""
              }`}
            >
              Open in diff
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

function ReportRail({ entry, repoId }: { entry: CachedReview; repoId: string }) {
  const { review } = entry;

  const byFile = useMemo(() => {
    const map = new Map<string, ReviewFinding[]>();
    for (const finding of review.findings ?? []) {
      const key = finding.file || "(no file)";
      map.set(key, [...(map.get(key) ?? []), finding]);
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 6);
  }, [review]);

  const counts = countBySeverity(review.findings);

  return (
    <aside className="flex w-full shrink-0 flex-col gap-3.5 lg:w-[348px]">
      {review.strengths?.length ? (
        <div className="rounded-[15px] border border-[#C9E4D6] bg-[#F3FAF6] p-[18px]">
          <div className="flex items-center gap-[9px]">
            <CheckCircle2 className="size-[18px] text-pass-solid" aria-hidden="true" />
            <h2 className="text-[15px] font-semibold text-[#0B4A32]">What this PR gets right</h2>
          </div>
          <ul className="mt-3 flex list-disc flex-col gap-[9px] pl-[18px] text-[13.5px] leading-[1.55] text-[#2C5344]">
            {review.strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {byFile.length ? (
        <div className="overflow-hidden rounded-[15px] border border-line bg-surface">
          <div className="border-b border-line-soft px-4 py-3.5 text-[13.5px] font-semibold">
            Where the findings are
          </div>
          <div className="flex flex-col gap-[13px] px-4 py-3.5">
            {byFile.map(([file, findings]) => {
              const perTone = countBySeverity(findings);
              return (
                <div key={file}>
                  <div className="flex justify-between gap-3 text-[13px] text-fg-3">
                    <span className="min-w-0 truncate font-mono text-[12.5px]">{file}</span>
                    <span className="text-fg-subtle">{findings.length}</span>
                  </div>
                  <div className="mt-1.5 flex h-[7px] gap-[3px]">
                    {TONES.filter((tone) => perTone[tone] > 0).map((tone) => (
                      <span
                        key={tone}
                        className={cn("rounded-full", SEVERITY_DOT[tone])}
                        style={{ width: `${(perTone[tone] / findings.length) * 100}%` }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[15px] border border-line bg-surface">
        <div className="border-b border-line-soft px-4 py-3.5 text-[13.5px] font-semibold">
          Run
        </div>
        <dl className="px-4 pt-1 pb-3">
          <RunRow label="Ran">{formatDate(entry.ranAt)} · {timeAgo(entry.ranAt)}</RunRow>
          <RunRow label="Duration">{formatDuration(entry.durationMs) ?? "—"}</RunRow>
          <RunRow label="Findings">
            {TONES.filter((t) => counts[t] > 0)
              .map((t) => `${counts[t]} ${t}`)
              .join(", ") || "none"}
          </RunRow>
          <RunRow label="Merge gate" last>
            {gateHeld(review) ? (
              <Badge tone="critical">Held</Badge>
            ) : (
              <Badge tone="pass">Clear</Badge>
            )}
          </RunRow>
        </dl>
        <div className="px-4 pb-4">
          <Button asChild variant="tertiary" size="sm" className="w-full font-semibold">
            <Link href={`/workflow?repoId=${repoId}`}>Open in workflow builder</Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}

function RunRow({
  label,
  children,
  last = false,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 py-2.5 text-[13.5px]",
        !last && "border-b border-[#F3F1EC]",
      )}
    >
      <dt className="text-[#6B6880]">{label}</dt>
      <dd className="text-right text-fg">{children}</dd>
    </div>
  );
}

function reviewToMarkdown(
  entry: CachedReview,
  repoName: string,
  prNumber: string,
  title?: string,
) {
  const { review } = entry;
  const scores = reviewScores(review);
  const lines = [
    `# AI review — ${repoName}#${prNumber}${title ? `: ${title}` : ""}`,
    "",
    `**Recommendation:** ${review.recommendation}  `,
    `**Ran:** ${new Date(entry.ranAt).toLocaleString()}`,
    "",
    review.summary,
    "",
    "| Overall | Security | Performance | Quality |",
    "| --- | --- | --- | --- |",
    `| ${scores.overall ?? "—"} | ${scores.security ?? "—"} | ${scores.performance ?? "—"} | ${scores.quality ?? "—"} |`,
    "",
    `## Findings (${review.findings?.length ?? 0})`,
    "",
  ];
  for (const finding of sortFindings(review.findings)) {
    lines.push(`### [${finding.severity}] ${finding.issue}`);
    if (finding.file) lines.push(`\`${finding.file}\``);
    lines.push("", `**Why it matters:** ${finding.reason}`, "", `**Suggested fix:** ${finding.suggestion}`, "");
  }
  if (review.strengths?.length) {
    lines.push("## What this PR gets right", "", ...review.strengths.map((s) => `- ${s}`), "");
  }
  return lines.join("\n");
}

