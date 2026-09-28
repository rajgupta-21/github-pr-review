"use client";

import { BookMarked, GitMerge, GitPullRequest, Plus, Webhook, Workflow } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { PageHeading, SidebarShell } from "@/components/shell/app-shell";
import { displayName, useUser } from "@/components/shell/user-context";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorBanner, LoadingState } from "@/components/ui/feedback";

import { AttentionList, type OpenPull } from "./_components/attention-list";
import { RunActivity } from "./_components/run-activity";
import { SplitBar, StatCard } from "./_components/stat-card";
import { hasWorkflow, useWorkspace } from "./_components/use-workspace";

const WEEK = 7 * 24 * 60 * 60 * 1000;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const user = useUser();
  const { data, error, loading, reload } = useWorkspace();
  const [now] = useState(() => Date.now());

  const summary = useMemo(() => {
    if (!data) return null;
    const open: OpenPull[] = data.pullsByRepo
      .flatMap(({ repo, pulls }) =>
        pulls.filter((pr) => pr.state === "open").map((pr) => ({ repo, pr })),
      )
      .sort(
        (a, b) => new Date(b.pr.createdAtGithub).getTime() - new Date(a.pr.createdAtGithub).getTime(),
      );
    const drafts = open.filter(({ pr }) => pr.draft).length;
    const allPulls = data.pullsByRepo.flatMap((entry) => entry.pulls);
    const mergedThisWeek = allPulls.filter(
      (pr) => pr.mergedAtGithub && now - new Date(pr.mergedAtGithub).getTime() < WEEK,
    ).length;
    const closedThisWeek = allPulls.filter(
      (pr) =>
        pr.state === "closed" &&
        !pr.mergedAtGithub &&
        pr.closedAtGithub &&
        now - new Date(pr.closedAtGithub).getTime() < WEEK,
    ).length;
    const withWorkflow = data.repos.filter(hasWorkflow).length;
    const webhooks = data.repos.filter((repo) => repo.webhookActive).length;
    const unreachable = data.pullsByRepo.filter((entry) => entry.failed).length;

    return { open, drafts, mergedThisWeek, closedThisWeek, withWorkflow, webhooks, unreachable };
  }, [data, now]);

  const description = summary
    ? summary.open.length === 0
      ? "No pull requests are open on your connected repositories."
      : `${summary.open.length} open pull ${summary.open.length === 1 ? "request" : "requests"} across ${data!.repos.length} connected ${data!.repos.length === 1 ? "repository" : "repositories"}.`
    : "Here's what's happening with your repositories.";

  return (
    <SidebarShell
      header={
        <>
          <div className="flex-1" />
          <Button asChild variant="tertiary" size="sm" className="h-10 px-3.5 text-sm">
            <Link href="/workflow">
              <Plus aria-hidden="true" />
              New workflow
            </Link>
          </Button>
          <Button asChild variant="primary" size="sm" className="h-10 px-4 text-sm">
            <Link href="/repos">Connect repository</Link>
          </Button>
        </>
      }
    >
      <PageHeading title={`${greeting()}, ${displayName(user)}`} description={description} />

      {loading && !data ? <LoadingState label="Loading your workspace…" /> : null}

      {error ? (
        <ErrorBanner className="mt-6">
          {error}.{" "}
          <button type="button" onClick={reload} className="font-semibold underline">
            Try again
          </button>
        </ErrorBanner>
      ) : null}

      {data && summary ? (
        data.repos.length === 0 ? (
          <div className="mt-6 rounded-xl border border-line bg-surface">
            <EmptyState
              icon={<BookMarked />}
              title="Connect your first repository"
              description="Pick a repository from your GitHub account. Its pull requests will show up here, ready for review."
              action={
                <Button asChild variant="primary">
                  <Link href="/repos">Connect repository</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {summary.unreachable > 0 ? (
              <ErrorBanner className="mt-6">
                Pull requests for {summary.unreachable}{" "}
                {summary.unreachable === 1 ? "repository" : "repositories"} could not be loaded from
                GitHub.
              </ErrorBanner>
            ) : null}

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Open pull requests"
                icon={GitPullRequest}
                value={summary.open.length}
                note={summary.drafts ? `${summary.drafts} draft` : undefined}
              >
                <SplitBar
                  parts={[
                    { value: summary.open.length - summary.drafts, className: "bg-violet-500" },
                    { value: summary.drafts, className: "bg-line-control" },
                  ]}
                />
                <div className="mt-[9px] text-[12.5px] text-fg-subtle">
                  {summary.open.length - summary.drafts} ready · {summary.drafts} draft
                </div>
              </StatCard>

              <StatCard
                label="Merged this week"
                icon={GitMerge}
                value={summary.mergedThisWeek}
              >
                <div className="text-[12.5px] text-fg-subtle">
                  {summary.closedThisWeek} closed without merging in the last 7 days
                </div>
              </StatCard>

              <StatCard
                label="Active workflows"
                icon={Workflow}
                value={summary.withWorkflow}
                note={`of ${data.repos.length} repos`}
              >
                <SplitBar
                  parts={[
                    { value: summary.withWorkflow, className: "bg-pass-solid" },
                    { value: data.repos.length - summary.withWorkflow, className: "bg-high-solid" },
                  ]}
                />
                <div className="mt-[9px] text-[12.5px] text-fg-subtle">
                  {data.repos.length - summary.withWorkflow} connected with no workflow
                </div>
              </StatCard>

              <StatCard
                label="Webhooks active"
                icon={Webhook}
                value={summary.webhooks}
                note={`of ${data.repos.length} repos`}
              >
                <div className="text-[12.5px] text-fg-subtle">
                  Workflows run automatically when a PR is opened or updated
                </div>
              </StatCard>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
              <AttentionList pulls={summary.open} />
              <RunActivity pullsByRepo={data.pullsByRepo} />
            </div>
          </>
        )
      ) : null}
    </SidebarShell>
  );
}
