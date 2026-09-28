"use client";

import { useCallback, useEffect, useState } from "react";

import { connectRepo, getConnectedRepos, getGithubRepos } from "@/lib/api";
import type { ConnectedRepo, GithubRepo } from "@/lib/types";

export function hasWorkflow(repo: ConnectedRepo) {
  return (repo.workflow?.nodes?.length ?? 0) > 0;
}

/** A connected repo needs attention when nothing will run on its next PR. */
export function needsAttention(repo: ConnectedRepo) {
  return !hasWorkflow(repo) || !repo.webhookActive;
}

function fetchLists() {
  return Promise.allSettled([getConnectedRepos(), getGithubRepos()]);
}

export function useRepositories() {
  const [connected, setConnected] = useState<ConnectedRepo[]>([]);
  const [github, setGithub] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<number | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  const apply = useCallback((result: Awaited<ReturnType<typeof fetchLists>>) => {
    const [connectedResult, githubResult] = result;
    setError(null);
    setGithubError(null);
    if (connectedResult.status === "fulfilled") setConnected(connectedResult.value);
    else setError(connectedResult.reason?.message || "Could not load connected repositories");
    if (githubResult.status === "fulfilled") setGithub(githubResult.value);
    else setGithubError(githubResult.reason?.message || "Could not reach GitHub");
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchLists().then((result) => !cancelled && apply(result));
    return () => {
      cancelled = true;
    };
  }, [apply]);

  const reload = useCallback(async () => {
    setLoading(true);
    apply(await fetchLists());
  }, [apply]);

  const connect = useCallback(
    async (repo: GithubRepo) => {
      setConnecting(repo.id);
      setConnectError(null);
      try {
        const created = await connectRepo({
          repoId: repo.id,
          owner: repo.owner,
          fullName: repo.fullName,
        });
        setConnected((prev) => [...prev, created]);
      } catch (err) {
        setConnectError(
          `${repo.fullName}: ${err instanceof Error ? err.message : "could not connect"}`,
        );
      } finally {
        setConnecting(null);
      }
    },
    [],
  );

  const connectedIds = new Set(connected.map((repo) => repo.repoId));
  const available = github.filter((repo) => !connectedIds.has(repo.id));

  return {
    connected,
    available,
    githubTotal: github.length,
    loading,
    error,
    githubError,
    connecting,
    connectError,
    connect,
    reload,
  };
}
