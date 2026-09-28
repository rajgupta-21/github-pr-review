"use client";

import {
  BookMarked,
  ExternalLink,
  GitMerge,
  GitPullRequest,
  GitPullRequestClosed,
  GitPullRequestDraft,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";

import { TopbarShell } from "@/components/shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorBanner, LoadingState } from "@/components/ui/feedback";
import { Select } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { enableWebhook, getRepoPulls } from "@/lib/api";
import { formatDate, pluralize, timeAgo } from "@/lib/format";
import { countBySeverity, gateHeld, readCachedReview, scoreTextClass, toPercent } from "@/lib/review";
import type { ConnectedRepo, PullRequest, ReviewResult } from "@/lib/types";
import { cn } from "@/lib/utils";

import { useRepo } from "./_components/hooks";

type PrState = "open" | "merged" | "closed";

function prState(pr: PullRequest): PrState {
  if (pr.merged || pr.mergedAtGithub) return "merged";
  return pr.state === "open" ? "open" : "closed";
}

const LANGUAGE_DOT: Record<string, string> = {
  TypeScript: "#2B7489",
  JavaScript: "#E0C341",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#DEA584",
  Java: "#B07219",
};

export default function RepoDetailPage({ params }: { params: Promise<{ repoId: string }> }) {
  const { repoId } = use(params);
  const { repo, error, setRepo } = useRepo(repoId);

  const [pulls, setPulls] = useState<PullRequest[] | null>(null);
  const [pullsError, setPullsError] = useState<string | null>(null);
  const [filter, setFilter] = useState<PrState>("open");
  const [author, setAuthor] = useState("all");

  useEffect(() => {
    if (!repo) return;
    let cancelled = false;
    getRepoPulls(repo)
      .then((data) => !cancelled && setPulls(data))
      .catch((err: Error) => !cancelled && setPullsError(err.message));
    return () => {
      cancelled = true;
    };
  }, [repo]);

  // Reviews run this session (they are not stored server-side yet). `pulls` is
  // only set client-side, so reading sessionStorage here cannot mismatch SSR.
  const reviews = useMemo(() => {
    const found: Record<number, ReviewResult> = {};
    for (const pr of pulls ?? []) {
      const cached = readCachedReview(repoId, pr.githubPrNumber);
      if (cached) found[pr.githubPrNumber] = cached.review;
    }
    return found;
  }, [pulls, repoId]);

  const counts = useMemo(() => {
    const c = { open: 0, merged: 0, closed: 0 };
    for (const pr of pulls ?? []) c[prState(pr)] += 1;
    return c;
  }, [pulls]);

  const authors = useMemo(
    () => [...new Set((pulls ?? []).map((pr) => pr.author?.login).filter(Boolean))].sort(),
    [pulls],
  );

  const visible = useMemo(
    () =>
      (pulls ?? [])
        .filter((pr) => prState(pr) === filter)
        .filter((pr) => author === "all" || pr.author?.login === author)
        .sort(
          (a, b) =>
            new Date(b.updatedAtGithub).getTime() - new Date(a.updatedAtGithub).getTime(),
        ),
    [pulls, filter, author],
  );

  const crumbs = [
    { label: "Repositories", href: "/repos" },
    { label: repo?.fullName ?? "…", mono: true },
  ];

  if (error) {
    return (
      <TopbarShell crumbs={crumbs}>
        <div className="p-7">
          <ErrorBanner>{error}</ErrorBanner>
        </div>
      </TopbarShell>
    );
  }

  if (!repo) {
    return (
      <TopbarShell crumbs={crumbs}>
        <LoadingState label="Loading repository…" />
      </TopbarShell>
    );
  }

  return (
    <TopbarShell crumbs={crumbs}>
      <RepoHeader repo={repo} prCount={pulls ? counts.open : undefined} />

      <div className="flex flex-col gap-[18px] px-4 py-5 sm:px-7 lg:flex-row">
        <section className="flex min-w-0 flex-1 flex-col gap-3.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <Segmented
              label="Pull request state"
              value={filter}
              onChange={setFilter}
              options={[
                { value: "open", label: `Open ${counts.open}` },
                { value: "merged", label: `Merged ${counts.merged}` },
                { value: "closed", label: `Closed ${counts.closed}` },
              ]}
            />
            <div className="flex-1" />
            <label className="sr-only" htmlFor="author-filter">
              Author
            </label>
            <Select
              id="author-filter"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-auto py-2 text-[13.5px]"
            >
              <option value="all">Author: Anyone</option>
              {authors.map((login) => (
                <option key={login} value={login}>
                  Author: {login}
                </option>
              ))}
            </Select>
          </div>

          <div className="overflow-hidden rounded-xl border border-line bg-surface">
            {pullsError ? (
              <div className="p-5">
                <ErrorBanner>{pullsError}</ErrorBanner>
              </div>
            ) : pulls === null ? (
              <LoadingState label="Fetching pull requests from GitHub…" />
            ) : visible.length === 0 ? (
              <EmptyState
                icon={<GitPullRequest />}
                title={`No ${filter} pull requests`}
                description={
                  author === "all"
                    ? "When someone opens a pull request on this repository it shows up here."
                    : `Nothing ${filter} by ${author}.`
                }
              />
            ) : (
              visible.map((pr, index) => (
                <PullRow
                  key={pr._id ?? pr.githubPrNumber}
                  pr={pr}
                  repoId={repoId}
                  review={reviews[pr.githubPrNumber]}
                  last={index === visible.length - 1}
                />
              ))
            )}
          </div>
        </section>

        <RepoRail repo={repo} onRepoChange={setRepo} />
      </div>
    </TopbarShell>
  );
}

function RepoHeader({ repo, prCount }: { repo: ConnectedRepo; prCount?: number }) {
  return (
    <div className="shrink-0 border-b border-line bg-surface px-4 pt-6 sm:px-7">
      <div className="flex flex-col gap-5 md:flex-row md:items-start">
        <span className="inline-flex size-[52px] shrink-0 items-center justify-center rounded-[15px] bg-violet-100 text-violet-600">
          <BookMarked className="size-6" strokeWidth={1.9} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-[27px] font-bold tracking-[-0.025em] break-all text-fg">
              {repo.fullName}
            </h1>
            {repo.webhookActive ? (
              <Badge tone="pass" size="lg" dot>
                Webhook active
              </Badge>
            ) : (
              <Badge tone="muted" size="lg" dot>
                Webhook inactive
              </Badge>
            )}
            <Badge tone="neutral" size="lg" className="font-normal">
              {repo.visibility === "private" ? "Private" : "Public"}
            </Badge>
          </div>
          {repo.description ? (
            <p className="mt-2 text-[14.5px] text-fg-muted">{repo.description}</p>
          ) : null}
          <div className="mt-[11px] flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[13px] text-fg-subtle">
            {repo.language ? (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="size-[9px] rounded-full"
                    style={{ background: LANGUAGE_DOT[repo.language] ?? "#9A95A8" }}
                  />
                  {repo.language}
                </span>
                <span aria-hidden="true">·</span>
              </>
            ) : null}
            <span>
              Default branch{" "}
              <span className="font-mono text-fg-3">{repo.defaultBranch || "—"}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>Connected {formatDate(repo.createdAt)}</span>
            <span aria-hidden="true">·</span>
            <span>
              Repo ID <span className="font-mono text-fg-3">{repo.repoId}</span>
            </span>
          </div>
        </div>
        <div className="flex shrink-0 gap-[9px]">
          {repo.repoUrl ? (
            <Button asChild variant="tertiary" size="md">
              <a href={repo.repoUrl} target="_blank" rel="noreferrer">
                <ExternalLink aria-hidden="true" />
                GitHub
              </a>
            </Button>
          ) : null}
          <Button asChild variant="primary" size="md">
            <Link href={`/workflow?repoId=${repo.repoId}`}>Edit workflow</Link>
          </Button>
        </div>
      </div>

      <div className="mt-5 flex gap-[26px]">
        <span className="relative pb-[13px] text-[14.5px] font-semibold text-fg">
          Pull requests{" "}
          {prCount !== undefined ? (
            <span className="font-mono font-normal text-fg-subtle">{prCount}</span>
          ) : null}
          <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-sm bg-violet-500" />
        </span>
        <Link
          href={`/workflow?repoId=${repo.repoId}`}
          className="pb-[13px] text-[14.5px] text-[#6B6880] no-underline hover:text-fg"
        >
          Workflow
        </Link>
      </div>
    </div>
  );
}

const STATE_ICON: Record<PrState | "draft", { icon: typeof GitPullRequest; tile: string; fg: string }> = {
  open: { icon: GitPullRequest, tile: "bg-pass-fill", fg: "text-pass-solid" },
  draft: { icon: GitPullRequestDraft, tile: "bg-surface-muted", fg: "text-fg-subtle" },
  merged: { icon: GitMerge, tile: "bg-violet-100", fg: "text-violet-600" },
  closed: { icon: GitPullRequestClosed, tile: "bg-surface-muted", fg: "text-fg-subtle" },
};

function PullRow({
  pr,
  repoId,
  review,
  last,
}: {
  pr: PullRequest;
  repoId: string;
  review?: ReviewResult;
  last: boolean;
}) {
  const state = prState(pr);
  const look = STATE_ICON[pr.draft && state === "open" ? "draft" : state];
  const Icon = look.icon;
  const counts = review ? countBySeverity(review.findings) : null;
  const score = review ? toPercent(review.overallScore) : null;

  return (
    <Link
      href={`/repos/${repoId}/pulls/${pr.githubPrNumber}`}
      className={cn(
        "flex gap-[15px] px-5 py-[17px] text-inherit no-underline transition-colors hover:bg-surface-sunken hover:text-inherit",
        !last && "border-b border-line-soft",
      )}
    >
      <span
        className={cn(
          "inline-flex size-9 shrink-0 items-center justify-center rounded-md",
          look.tile,
        )}
      >
        <Icon className={cn("size-[18px]", look.fg)} strokeWidth={2} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="text-[15.5px] font-semibold text-fg">{pr.title}</span>
          <span className="font-mono text-[13px] text-fg-faint">#{pr.githubPrNumber}</span>
          {pr.draft ? <Badge tone="muted">Draft</Badge> : null}
          {review && state === "open" ? (
            gateHeld(review) ? (
              <Badge className="border border-critical-line bg-[#FDF4F5] text-critical">
                Merge gate held
              </Badge>
            ) : (
              <Badge className="border border-[#C9E4D6] bg-[#F3FAF6] text-pass">
                Ready to merge
              </Badge>
            )
          ) : null}
        </div>
        <div className="mt-[7px] flex flex-wrap items-center gap-x-[9px] gap-y-1 text-[13px] text-[#6B6880]">
          <span>{pr.author?.login}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-[12.5px] break-all">
            {pr.sourceBranch} → {pr.targetBranch}
          </span>
          {pr.changedFiles !== undefined && pr.changedFiles !== null ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{pluralize(pr.changedFiles, "file")}</span>
            </>
          ) : null}
          {pr.additions !== undefined && pr.additions !== null ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[12.5px]">
                <span className="text-pass-solid">+{pr.additions}</span>{" "}
                <span className="text-[#B3253C]">−{pr.deletions ?? 0}</span>
              </span>
            </>
          ) : null}
          <span aria-hidden="true">·</span>
          <span>{timeAgo(pr.updatedAtGithub)}</span>
        </div>
      </div>
      {counts ? (
        <div className="hidden shrink-0 items-center gap-[18px] sm:flex">
          <div className="flex gap-[5px]">
            {(["critical", "high", "medium", "low"] as const)
              .filter((tone) => counts[tone] > 0)
              .map((tone) => (
                <Badge key={tone} tone={tone}>
                  {counts[tone]} {tone[0].toUpperCase()}
                </Badge>
              ))}
          </div>
          <div className="w-[54px] text-right">
            <div className={cn("font-display text-[21px] font-bold", scoreTextClass(score))}>
              {score ?? "—"}
            </div>
            <div className="text-[11.5px] text-fg-faint">score</div>
          </div>
        </div>
      ) : null}
    </Link>
  );
}

function RepoRail({
  repo,
  onRepoChange,
}: {
  repo: ConnectedRepo;
  onRepoChange: (repo: ConnectedRepo) => void;
}) {
  const [enabling, setEnabling] = useState(false);
  const [webhookError, setWebhookError] = useState<string | null>(null);

  const nodes = repo.workflow?.nodes ?? [];
  const hasWorkflow = nodes.length > 0;
  const triggers = nodes
    .map((node) => node.data?.nodeType)
    .filter((type): type is string =>
      ["pr_opened", "pr_updated", "manual_trigger", "scheduled"].includes(type ?? ""),
    );
  const triggerLabel = triggers.length
    ? triggers
        .map((t) =>
          t === "pr_opened"
            ? "on PR opened"
            : t === "pr_updated"
              ? "on PR updated"
              : t === "scheduled"
                ? "scheduled"
                : "manual",
        )
        .join(", ")
    : "no trigger";
  const definition = repo.workflow?.definition;
  const workflowActive = hasWorkflow && definition?.status !== "disabled";

  const turnOnWebhook = async () => {
    setEnabling(true);
    setWebhookError(null);
    try {
      const result = await enableWebhook(repo.repoId);
      onRepoChange({ ...repo, webhookActive: result.webhookActive });
      if (!result.webhookActive) {
        setWebhookError("The backend has no public webhook URL configured (GITHUB_WEBHOOK_URL).");
      }
    } catch (err) {
      setWebhookError(err instanceof Error ? err.message : "Could not enable the webhook");
    } finally {
      setEnabling(false);
    }
  };

  return (
    <aside className="flex w-full shrink-0 flex-col gap-3.5 lg:w-[336px]">
      <div className="overflow-hidden rounded-[15px] border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line-soft px-4 py-3.5">
          <h2 className="text-sm font-semibold">Workflow</h2>
          <Link href={`/workflow?repoId=${repo.repoId}`} className="text-[13px]">
            {hasWorkflow ? "Manage" : "Create"}
          </Link>
        </div>
        <div className="px-4 py-3">
          {hasWorkflow ? (
            <div className="flex items-center gap-[11px]">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-violet-100 text-violet-600">
                <Workflow className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">
                  {definition?.name || "PR workflow"}
                </div>
                <div className="mt-0.5 text-[12.5px] text-fg-subtle">
                  {pluralize(nodes.length, "node")} · {triggerLabel}
                </div>
              </div>
              <Badge tone={workflowActive ? "pass" : "muted"}>
                {workflowActive ? "Active" : "Disabled"}
              </Badge>
            </div>
          ) : (
            <p className="text-[13px] leading-relaxed text-fg-muted">
              No workflow yet — pull requests here are not reviewed automatically.
            </p>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-[15px] border border-line bg-surface">
        <div className="border-b border-line-soft px-4 py-3.5 text-sm font-semibold">
          Connection
        </div>
        <dl className="px-4 pt-1 pb-3.5">
          <RailRow label="Webhook">
            <span className={cn("font-semibold", repo.webhookActive ? "text-pass" : "text-fg-subtle")}>
              {repo.webhookActive ? "Delivering" : "Not installed"}
            </span>
          </RailRow>
          <RailRow label="Auto review">
            <span className={cn("font-semibold", hasWorkflow && repo.webhookActive ? "text-pass" : "text-fg-subtle")}>
              {hasWorkflow && repo.webhookActive ? "Enabled" : "Off"}
            </span>
          </RailRow>
          <RailRow label="Visibility">
            {repo.visibility === "private" ? "Private" : "Public"}
          </RailRow>
          <RailRow label="Connected" last>
            {formatDate(repo.createdAt)}
          </RailRow>
        </dl>
        {hasWorkflow && !repo.webhookActive ? (
          <div className="px-4 pb-4">
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              loading={enabling}
              onClick={turnOnWebhook}
            >
              Enable webhook
            </Button>
            {webhookError ? (
              <p className="mt-2 text-[12.5px] text-critical">{webhookError}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function RailRow({
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
        "flex justify-between py-[11px] text-[13.5px]",
        !last && "border-b border-[#F3F1EC]",
      )}
    >
      <dt className="text-[#6B6880]">{label}</dt>
      <dd className="text-fg">{children}</dd>
    </div>
  );
}

