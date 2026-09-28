"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { getPull, getRepo, runAiReview } from "@/lib/api";
import { type CachedReview, writeCachedReview } from "@/lib/review";
import type { ConnectedRepo, PullRequest } from "@/lib/types";

type Keyed<T> = { key: string; data: T | null; error: string | null };

/** Loads the connected repository document for a GitHub repo id. */
export function useRepo(repoId: string) {
  const [state, setState] = useState<Keyed<ConnectedRepo> | null>(null);

  useEffect(() => {
    let cancelled = false;
    getRepo(repoId)
      .then((data) => !cancelled && setState({ key: repoId, data, error: null }))
      .catch(
        (err: Error) =>
          !cancelled &&
          setState({ key: repoId, data: null, error: err.message || "Could not load repository" }),
      );
    return () => {
      cancelled = true;
    };
  }, [repoId]);

  const current = state?.key === repoId ? state : null;
  const setRepo = useCallback(
    (repo: ConnectedRepo) => setState({ key: repoId, data: repo, error: null }),
    [repoId],
  );
  return { repo: current?.data ?? null, error: current?.error ?? null, setRepo };
}

/** Loads one pull request once the repository is known. */
export function usePull(repo: ConnectedRepo | null, prNumber: string) {
  const [state, setState] = useState<Keyed<PullRequest> | null>(null);
  const key = repo ? `${repo.repoId}:${prNumber}` : "";

  useEffect(() => {
    if (!repo) return;
    let cancelled = false;
    getPull(repo, prNumber)
      .then((data) => !cancelled && setState({ key, data, error: null }))
      .catch(
        (err: Error) =>
          !cancelled &&
          setState({ key, data: null, error: err.message || "Could not load pull request" }),
      );
    return () => {
      cancelled = true;
    };
  }, [repo, prNumber, key]);

  const current = state?.key === key ? state : null;
  return { pull: current?.data ?? null, error: current?.error ?? null };
}

/*
  The last AI review for a PR. Reviews are not persisted by the backend, so the
  result lives in sessionStorage (see lib/review) and is shared by the PR and
  report screens. Read through useSyncExternalStore so SSR renders "no review".
*/
const REVIEW_EVENT = "mergegate:review-cache";

function subscribe(callback: () => void) {
  window.addEventListener(REVIEW_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(REVIEW_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function readRaw(repoId: string, prNumber: string) {
  try {
    return window.sessionStorage.getItem(`mergegate:review:${repoId}:${prNumber}`);
  } catch {
    return null;
  }
}

export function useReview(repo: ConnectedRepo | null, repoId: string, prNumber: string) {
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(repoId, prNumber),
    () => null,
  );
  const entry = useMemo<CachedReview | null>(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CachedReview;
    } catch {
      return null;
    }
  }, [raw]);

  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (context?: string) => {
      if (!repo) return;
      setRunning(true);
      setError(null);
      const started = performance.now();
      try {
        const review = await runAiReview(repo, prNumber, context);
        writeCachedReview(repoId, prNumber, {
          review,
          ranAt: new Date().toISOString(),
          durationMs: Math.round(performance.now() - started),
        });
        window.dispatchEvent(new Event(REVIEW_EVENT));
      } catch (err) {
        setError(err instanceof Error ? err.message : "The AI review failed");
      } finally {
        setRunning(false);
      }
    },
    [repo, repoId, prNumber],
  );

  return { entry, review: entry?.review ?? null, running, error, run };
}
