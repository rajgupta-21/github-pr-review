"use client";

import { BookMarked, ChevronRight, Workflow } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ReactFlowProvider } from "reactflow";

import { TopbarShell } from "@/components/shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorBanner, LoadingState } from "@/components/ui/feedback";
import { getConnectedRepos } from "@/lib/api";
import { pluralize, timeAgo } from "@/lib/format";
import type { ConnectedRepo } from "@/lib/types";

import Canvas from "./Canvas";

function parseRepoId(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/* Picks the repository (?repoId) and hands it to the builder. */
export default function WorkflowScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedRepoId = parseRepoId(searchParams.get("repoId"));

  const [repos, setRepos] = useState<ConnectedRepo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getConnectedRepos()
      .then((list) => !cancelled && setRepos(list))
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error(err);
        setError(err instanceof Error ? err.message : "Unable to load connected repositories");
        setRepos([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectRepo = (repoId: number) => router.replace(`/workflow?repoId=${repoId}`);
  const selectedRepo =
    selectedRepoId !== undefined ? repos?.find((repo) => repo.repoId === selectedRepoId) : undefined;

  if (selectedRepo && repos) {
    return (
      <ReactFlowProvider key={selectedRepo.repoId}>
        <Canvas repo={selectedRepo} repos={repos} onSelectRepo={selectRepo} />
      </ReactFlowProvider>
    );
  }

  return (
    <TopbarShell crumbs={[{ label: "Workflows" }]}>
      <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:py-16">
        <div className="text-center">
          <span className="mx-auto inline-flex size-12 items-center justify-center rounded-[13px] bg-violet-50 text-violet-600">
            <Workflow className="size-6" aria-hidden="true" />
          </span>
          <h1 className="mt-4 font-display text-[30px] leading-tight font-bold tracking-[-0.025em] text-fg">
            Choose a repository
          </h1>
          <p className="mt-2 text-[15px] text-fg-muted">
            Each connected repository has its own review workflow. Pick one to open the builder.
          </p>
        </div>

        {error ? <ErrorBanner className="mt-8">{error}</ErrorBanner> : null}
        {selectedRepoId !== undefined && repos && !selectedRepo && !error ? (
          <ErrorBanner className="mt-8">
            That repository isn’t connected to your account. Pick one below.
          </ErrorBanner>
        ) : null}

        <div className="mt-8 overflow-hidden rounded-xl border border-line bg-surface">
          {repos === null ? (
            <LoadingState label="Loading repositories…" />
          ) : repos.length === 0 ? (
            <EmptyState
              icon={<BookMarked aria-hidden="true" />}
              title="No connected repositories"
              description="Connect a GitHub repository first, then build its review workflow here."
              action={
                <Button asChild variant="primary">
                  <Link href="/repos">Connect repository</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-line-soft">
              {repos.map((repo) => {
                const nodeCount = repo.workflow?.nodes?.length ?? 0;
                return (
                  <li key={repo.repoId}>
                    <button
                      type="button"
                      onClick={() => selectRepo(repo.repoId)}
                      className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-sunken"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-mono text-[14px] text-fg">
                          {repo.fullName}
                        </span>
                        <span className="mt-1 block text-[13px] text-fg-subtle">
                          {nodeCount > 0
                            ? `${pluralize(nodeCount, "node")} · saved ${timeAgo(repo.workflow?.updatedAt)}`
                            : "No workflow yet"}
                        </span>
                      </span>
                      {nodeCount > 0 ? (
                        <Badge tone={repo.webhookActive ? "pass" : "neutral"} dot size="sm">
                          {repo.webhookActive ? "Active" : "Manual only"}
                        </Badge>
                      ) : (
                        <Badge tone="violet" size="sm">
                          Set up
                        </Badge>
                      )}
                      <ChevronRight className="size-4 shrink-0 text-fg-faint" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </TopbarShell>
  );
}
