"use client";

import { useCallback, useEffect, useState } from "react";

import { getConnectedRepos, getRepoPulls } from "@/lib/api";
import type { ConnectedRepo, PullRequest } from "@/lib/types";

export type RepoPulls = {
  repo: ConnectedRepo;
  pulls: PullRequest[];
  /** true when GitHub could not be reached for this repo */
  failed: boolean;
};

export type Workspace = {
  repos: ConnectedRepo[];
  pullsByRepo: RepoPulls[];
};

export function hasWorkflow(repo: ConnectedRepo) {
  return (repo.workflow?.nodes?.length ?? 0) > 0;
}

async function fetchWorkspace(): Promise<
  { ok: true; data: Workspace } | { ok: false; error: string }
> {
  try {
    const repos = await getConnectedRepos();
    const results = await Promise.allSettled(repos.map((repo) => getRepoPulls(repo)));
    return {
      ok: true,
      data: {
        repos,
        pullsByRepo: repos.map((repo, index) => {
          const result = results[index];
          return result.status === "fulfilled"
            ? { repo, pulls: result.value, failed: false }
            : { repo, pulls: [], failed: true };
        }),
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not load your workspace" };
  }
}

/** Connected repos plus every repo's PRs, fetched in parallel; one failing repo doesn't sink the page. */
export function useWorkspace() {
  const [data, setData] = useState<Workspace | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const apply = useCallback((result: Awaited<ReturnType<typeof fetchWorkspace>>) => {
    if (result.ok) setData(result.data);
    else setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchWorkspace().then((result) => !cancelled && apply(result));
    return () => {
      cancelled = true;
    };
  }, [apply]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    apply(await fetchWorkspace());
  }, [apply]);

  return { data, error, loading, reload };
}
