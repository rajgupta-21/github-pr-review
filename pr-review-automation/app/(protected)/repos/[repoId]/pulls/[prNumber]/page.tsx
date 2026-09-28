"use client";

import {
  AlertTriangle,
  ExternalLink,
  FileCode2,
  GitMerge,
  GitPullRequest,
  GitPullRequestClosed,
  GitPullRequestDraft,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";

import { TopbarShell } from "@/components/shell/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge, SeverityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorBanner, LoadingState } from "@/components/ui/feedback";
import { getPullFiles } from "@/lib/api";
import { pluralize, timeAgo } from "@/lib/format";
import { countBySeverity, gateHeld, sortFindings } from "@/lib/review";
import type { PullRequest, PullRequestFile, ReviewFinding } from "@/lib/types";
import { cn } from "@/lib/utils";

import { DiffView } from "../../_components/diff";
import { usePull, useRepo, useReview } from "../../_components/hooks";
import { BotMark, findingMatchesFile, SEVERITY_DOT, worstTone } from "../../_components/review-bits";
import { ReviewRail } from "../../_components/review-rail";

type FileFilter = "all" | "flagged" | "unviewed";

export default function PullRequestPage({
  params,
}: {
  params: Promise<{ repoId: string; prNumber: string }>;
}) {
  const { repoId, prNumber } = use(params);
  const { repo, error: repoError } = useRepo(repoId);
  const { pull, error: pullError } = usePull(repo, prNumber);
  const { entry, review, running, error: reviewError, run } = useReview(repo, repoId, prNumber);

  const [files, setFiles] = useState<PullRequestFile[] | null>(null);
  const [filesError, setFilesError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FileFilter>("all");
  const [viewed, setViewed] = useState<Set<string>>(new Set());
  const [activeFile, setActiveFile] = useState<string | null>(null);

  useEffect(() => {
    if (!repo) return;
    let cancelled = false;
    getPullFiles(repo, prNumber)
      .then((data) => !cancelled && setFiles(data))
      .catch((err: Error) => !cancelled && setFilesError(err.message));
    return () => {
      cancelled = true;
    };
  }, [repo, prNumber]);

  const findingsByFile = useMemo(() => {
    const map = new Map<string, ReviewFinding[]>();
    for (const file of files ?? []) {
      const matched = sortFindings(review?.findings).filter((f) =>
        findingMatchesFile(f, file.filename),
      );
      if (matched.length) map.set(file.filename, matched);
    }
    return map;
  }, [files, review]);

  const unmatchedFindings = useMemo(() => {
    if (!review || !files) return [];
    return sortFindings(review.findings).filter(
      (f) => !files.some((file) => findingMatchesFile(f, file.filename)),
    );
  }, [review, files]);

  const visibleFiles = (files ?? []).filter((file) =>
    filter === "flagged"
      ? findingsByFile.has(file.filename)
      : filter === "unviewed"
        ? !viewed.has(file.filename)
        : true,
  );

  const toggleViewed = (filename: string) =>
    setViewed((prev) => {
      const next = new Set(prev);
      if (next.has(filename)) next.delete(filename);
      else next.add(filename);
      return next;
    });

  const base = `/repos/${repoId}/pulls/${prNumber}`;
  const crumbs = [
    { label: "Repositories", href: "/repos" },
    { label: repo?.fullName ?? "…", href: `/repos/${repoId}`, mono: true },
    { label: `#${prNumber}`, mono: true },
  ];

  const fatal = repoError || pullError;
  if (fatal) {
    return (
      <TopbarShell crumbs={crumbs}>
        <div className="p-7">
          <ErrorBanner>{fatal}</ErrorBanner>
        </div>
      </TopbarShell>
    );
  }

  if (!repo || !pull) {
    return (
      <TopbarShell crumbs={crumbs}>
        <LoadingState label="Loading pull request…" />
      </TopbarShell>
    );
  }

  const totals = (files ?? []).reduce(
    (acc, f) => ({ add: acc.add + f.additions, del: acc.del + f.deletions }),
    { add: 0, del: 0 },
  );
  const held = gateHeld(review);
  const counts = review ? countBySeverity(review.findings) : null;

  return (
    <TopbarShell
      crumbs={crumbs}
      actions={
        pull.githubUrl ? (
          <Button asChild variant="ink" size="sm" className="hidden sm:inline-flex">
            <a href={pull.githubUrl} target="_blank" rel="noreferrer">
              <ExternalLink aria-hidden="true" />
              Open on GitHub
            </a>
          </Button>
        ) : null
      }
    >
      <PullHeader
        pull={pull}
        held={held}
        counts={counts}
        reportHref={`${base}/review`}
        findingTotal={review?.findings?.length}
        fileCount={files?.length}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-[18px] px-4 py-5 pb-24 sm:px-7 lg:flex-row lg:items-start lg:pb-5">
        {/* file tree */}
        <aside className="hidden w-[262px] shrink-0 flex-col overflow-hidden rounded-[14px] border border-line bg-surface lg:sticky lg:top-[76px] lg:flex lg:max-h-[calc(100vh-96px)]">
          <div className="border-b border-line-soft px-4 py-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[13.5px] font-semibold text-fg">
                {files ? pluralize(files.length, "file") + " changed" : "Files"}
              </h2>
              {files ? (
                <span className="font-mono text-[12.5px]">
                  <span className="text-pass-solid">+{totals.add}</span>{" "}
                  <span className="text-[#B3253C]">−{totals.del}</span>
                </span>
              ) : null}
            </div>
            <div className="mt-[11px] flex gap-1.5" role="group" aria-label="Filter files">
              {(["all", "flagged", "unviewed"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                  className={cn(
                    "flex-1 rounded-sm py-1.5 text-[12.5px] capitalize",
                    filter === value
                      ? "bg-fg font-medium text-white"
                      : "border border-line-strong bg-surface text-fg-muted hover:text-fg",
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <FileTree
            files={visibleFiles}
            findingsByFile={findingsByFile}
            viewed={viewed}
            active={activeFile}
            onSelect={setActiveFile}
          />
        </aside>

        {/* diffs */}
        <section className="flex min-w-0 flex-1 flex-col gap-3.5">
          {unmatchedFindings.length ? (
            <InlineFindings findings={unmatchedFindings} title="Findings not tied to a changed file" />
          ) : null}
          {filesError ? (
            <ErrorBanner>{filesError}</ErrorBanner>
          ) : files === null ? (
            <div className="rounded-[14px] border border-line bg-surface">
              <LoadingState label="Loading the diff…" />
            </div>
          ) : visibleFiles.length === 0 ? (
            <div className="rounded-[14px] border border-line bg-surface">
              <EmptyState
                icon={<FileCode2 />}
                title={files.length === 0 ? "No files changed" : "Nothing matches this filter"}
                description={
                  filter === "flagged" && !review
                    ? "Run the AI review to flag files with findings."
                    : undefined
                }
              />
            </div>
          ) : (
            visibleFiles.map((file) => (
              <FileDiff
                key={file.filename}
                file={file}
                findings={findingsByFile.get(file.filename) ?? []}
                viewed={viewed.has(file.filename)}
                onToggleViewed={() => toggleViewed(file.filename)}
              />
            ))
          )}
        </section>

        <ReviewRail
          entry={entry}
          running={running}
          error={reviewError}
          onRun={run}
          reportHref={`${base}/review`}
        />
      </div>

      {/* phone: sticky primary action */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2.5 border-t border-line bg-surface px-4 pt-3.5 pb-6 lg:hidden">
        {review ? (
          <Button asChild variant="primary" size="lg" className="flex-1">
            <Link href={`${base}/review`}>Open the report</Link>
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            loading={running}
            onClick={() => run()}
          >
            {running ? "Reviewing…" : "Run AI review"}
          </Button>
        )}
        {pull.githubUrl ? (
          <Button asChild variant="tertiary" size="lg" className="w-[52px] px-0">
            <a href={pull.githubUrl} target="_blank" rel="noreferrer" aria-label="Open on GitHub">
              <ExternalLink aria-hidden="true" />
            </a>
          </Button>
        ) : null}
      </div>
    </TopbarShell>
  );
}

function stateLook(pull: PullRequest) {
  if (pull.merged || pull.mergedAtGithub)
    return { label: "Merged", icon: GitMerge, className: "bg-violet-100 text-violet-600" };
  if (pull.state === "closed")
    return { label: "Closed", icon: GitPullRequestClosed, className: "bg-surface-hover text-fg-3" };
  if (pull.draft)
    return { label: "Draft", icon: GitPullRequestDraft, className: "bg-surface-hover text-fg-3" };
  return { label: "Open", icon: GitPullRequest, className: "bg-pass-fill text-pass" };
}

function PullHeader({
  pull,
  held,
  counts,
  reportHref,
  findingTotal,
  fileCount,
}: {
  pull: PullRequest;
  held: boolean;
  counts: ReturnType<typeof countBySeverity> | null;
  reportHref: string;
  findingTotal?: number;
  fileCount?: number;
}) {
  const look = stateLook(pull);
  const StateIcon = look.icon;
  const blocking = counts ? counts.critical + counts.high : 0;
  const blockingLabel = counts
    ? [
        counts.critical ? `${counts.critical} Critical` : null,
        counts.high ? `${counts.high} High` : null,
      ]
        .filter(Boolean)
        .join(" and ")
    : "";

  return (
    <div className="shrink-0 border-b border-line bg-surface px-4 pt-[22px] sm:px-7">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-[7px] rounded-full px-[13px] py-1.5 text-[13px] font-semibold",
            look.className,
          )}
        >
          <StateIcon className="size-[15px]" aria-hidden="true" />
          {look.label}
        </span>
        <h1 className="font-display text-[22px] font-bold tracking-[-0.02em] text-fg sm:text-[26px]">
          {pull.title}
        </h1>
        <span className="font-mono text-[20px] text-fg-faint">#{pull.githubPrNumber}</span>
      </div>
      <div className="mt-[11px] flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[13.5px] text-fg-muted">
        <Avatar name={pull.author?.login} src={pull.author?.avatarUrl} size={22} />
        <strong className="font-semibold text-fg">{pull.author?.login}</strong>
        <span>
          wants to merge{pull.commits ? ` ${pluralize(pull.commits, "commit")}` : ""} into
        </span>
        <span className="rounded-[6px] bg-surface-hover px-2 py-0.5 font-mono text-[12.5px] text-fg-2">
          {pull.targetBranch}
        </span>
        <span>from</span>
        <span className="rounded-[6px] bg-violet-100 px-2 py-0.5 font-mono text-[12.5px] break-all text-violet-700">
          {pull.sourceBranch}
        </span>
        <span aria-hidden="true">·</span>
        <span>opened {timeAgo(pull.createdAtGithub)}</span>
        {pull.additions !== undefined ? (
          <>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[12.5px]">
              <span className="text-pass-solid">+{pull.additions}</span>{" "}
              <span className="text-[#B3253C]">−{pull.deletions ?? 0}</span>
            </span>
          </>
        ) : null}
      </div>

      {held ? (
        <div className="mt-[18px] flex flex-col gap-3 rounded-[13px] border border-critical-line bg-[#FDF4F5] px-[18px] py-3.5 sm:flex-row sm:items-center sm:gap-[13px]">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-critical-fill">
            <AlertTriangle className="size-4 text-[#B3253C]" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <div className="text-[14.5px] font-semibold text-[#7D1428]">
              Merge gate held — {blockingLabel} {blocking === 1 ? "finding needs" : "findings need"}{" "}
              attention
            </div>
            <div className="mt-[3px] text-[13.5px] text-[#8A4653]">
              Set by the AI review. Resolve them on the branch, then re-run the review.
            </div>
          </div>
          <Button
            asChild
            variant="primary"
            size="sm"
            className="shrink-0 bg-[#B3253C] hover:bg-critical"
          >
            <Link href={reportHref}>Review the findings</Link>
          </Button>
        </div>
      ) : null}

      <div className="mt-[18px] flex gap-[26px]">
        <span className="relative pb-[13px] text-[14.5px] font-semibold text-fg">
          Files changed{" "}
          {fileCount !== undefined ? (
            <span className="font-mono font-normal text-fg-subtle">{fileCount}</span>
          ) : null}
          <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-sm bg-violet-500" />
        </span>
        <Link
          href={reportHref}
          className="inline-flex items-center gap-2 pb-[13px] text-[14.5px] text-[#6B6880] no-underline hover:text-fg"
        >
          AI review
          {findingTotal !== undefined ? (
            <Badge tone={held ? "critical" : "neutral"}>{findingTotal}</Badge>
          ) : null}
        </Link>
      </div>
    </div>
  );
}

function FileTree({
  files,
  findingsByFile,
  viewed,
  active,
  onSelect,
}: {
  files: PullRequestFile[];
  findingsByFile: Map<string, ReviewFinding[]>;
  viewed: Set<string>;
  active: string | null;
  onSelect: (filename: string) => void;
}) {
  const groups = new Map<string, PullRequestFile[]>();
  for (const file of files) {
    const slash = file.filename.lastIndexOf("/");
    const dir = slash === -1 ? "" : file.filename.slice(0, slash + 1);
    groups.set(dir, [...(groups.get(dir) ?? []), file]);
  }

  return (
    <div className="flex flex-col gap-px overflow-y-auto p-2">
      {[...groups.entries()].map(([dir, group]) => (
        <div key={dir || "root"}>
          <div className="px-2 pt-[11px] pb-[7px] font-mono text-[11.5px] tracking-[0.05em] break-all text-fg-faint first:pt-[7px]">
            {dir || "./"}
          </div>
          {group.map((file) => {
            const tone = worstTone(findingsByFile.get(file.filename) ?? []);
            const name = file.filename.slice(dir.length);
            return (
              <a
                key={file.filename}
                href={`#${fileAnchor(file.filename)}`}
                onClick={() => onSelect(file.filename)}
                className={cn(
                  "flex items-center gap-[9px] rounded-[9px] px-2.5 py-2 no-underline",
                  active === file.filename
                    ? "bg-violet-50 text-fg hover:text-fg"
                    : "text-fg-2 hover:bg-surface-sunken hover:text-fg",
                  viewed.has(file.filename) && "opacity-60",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    tone ? SEVERITY_DOT[tone] : "bg-[#D8D5CE]",
                  )}
                />
                <span className="min-w-0 flex-1 truncate font-mono text-[12.5px]">{name}</span>
                <span className="font-mono text-[11.5px] text-pass-solid">+{file.additions}</span>
              </a>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function fileAnchor(filename: string) {
  return `file-${filename.replace(/[^a-zA-Z0-9]+/g, "-")}`;
}

function FileDiff({
  file,
  findings,
  viewed,
  onToggleViewed,
}: {
  file: PullRequestFile;
  findings: ReviewFinding[];
  viewed: boolean;
  onToggleViewed: () => void;
}) {
  const counts = countBySeverity(findings);
  const worst = worstTone(findings);

  return (
    <div
      id={fileAnchor(file.filename)}
      className="scroll-mt-20 overflow-hidden rounded-[14px] border border-line bg-surface"
    >
      <div className="flex flex-wrap items-center gap-[11px] border-b border-line-soft bg-surface-sunken px-4 py-3">
        <FileCode2 className="size-4 text-fg-subtle" aria-hidden="true" />
        <span className="min-w-0 font-mono text-[13px] break-all text-fg">{file.filename}</span>
        <span className="font-mono text-xs">
          <span className="text-pass-solid">+{file.additions}</span>{" "}
          <span className="text-[#B3253C]">−{file.deletions}</span>
        </span>
        {worst ? (
          <Badge tone={worst}>
            {counts[worst]} {worst[0].toUpperCase() + worst.slice(1)}
          </Badge>
        ) : null}
        {file.status !== "modified" ? (
          <Badge tone="outline" size="sm" className="capitalize">
            {file.status}
          </Badge>
        ) : null}
        <div className="flex-1" />
        <button
          type="button"
          aria-pressed={viewed}
          onClick={onToggleViewed}
          className={cn(
            "rounded-sm border px-[11px] py-[5px] text-[12.5px]",
            viewed
              ? "border-transparent bg-fg text-white"
              : "border-line-strong bg-surface text-fg-muted hover:text-fg",
          )}
        >
          {viewed ? "Viewed" : "Mark viewed"}
        </button>
      </div>

      {viewed ? null : (
        <>
          {findings.length ? <InlineFindings findings={findings} /> : null}
          <DiffView patch={file.patch} />
        </>
      )}
    </div>
  );
}

const INLINE_LOOK: Record<string, string> = {
  critical: "border-critical-line bg-[#FDF7F8]",
  high: "border-[#F0DFC2] bg-[#FDF9F2]",
  medium: "border-[#EADFB5] bg-[#FDFBF3]",
  low: "border-[#D5DEEC] bg-[#F7F9FC]",
};

/*
  Findings only name a file (no line), so they sit at the top of that file's
  diff rather than at a specific line.
*/
function InlineFindings({ findings, title }: { findings: ReviewFinding[]; title?: string }) {
  const worst = worstTone(findings) ?? "low";
  return (
    <div className={cn("m-3.5 overflow-hidden rounded-[12px] border", INLINE_LOOK[worst])}>
      <div className="flex items-center gap-2.5 border-b border-black/5 px-4 py-[13px]">
        <BotMark size={26} className="rounded-sm" />
        <span className="text-[13.5px] font-semibold text-fg">{title ?? "Mergegate"}</span>
        <span className="text-[12.5px] text-fg-subtle">
          {pluralize(findings.length, "finding")}
          {title ? "" : " in this file"}
        </span>
      </div>
      <div className="divide-y divide-black/5">
        {findings.map((finding, index) => (
          <div key={index} className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={finding.severity} size="sm" />
              {title && finding.file ? (
                <span className="font-mono text-[11.5px] text-violet-600">{finding.file}</span>
              ) : null}
            </div>
            <h3 className="mt-2 text-[15px] font-semibold text-fg">{finding.issue}</h3>
            {finding.reason ? (
              <p className="mt-[7px] text-sm leading-relaxed text-fg-3">{finding.reason}</p>
            ) : null}
            {finding.suggestion ? (
              <div className="mt-3 overflow-hidden rounded-md border border-line bg-surface">
                <div className="border-b border-line-soft bg-surface-sunken px-[13px] py-2 text-[12.5px] text-fg-muted">
                  Suggested change
                </div>
                <p className="px-[13px] py-2.5 text-[13.5px] leading-relaxed text-fg-2">
                  {finding.suggestion}
                </p>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
