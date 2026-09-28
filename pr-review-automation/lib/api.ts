// One typed client for every route the Express backend exposes today.
// Components should call these rather than hand-rolling fetch + URLs.
import type {
  ConnectedRepo,
  GithubRepo,
  MeResponse,
  PullRequest,
  PullRequestFile,
  ReviewResult,
  StoredWorkflow,
  WorkflowDefinition,
  WorkflowExecutionResult,
  WorkflowGraphEdge,
  WorkflowGraphNode,
} from "./types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data?.message || `Request failed (${response.status})`, response.status);
  }
  return data as T;
}

const enc = encodeURIComponent;

/* ─── auth ─────────────────────────────────────────────── */

export const githubLoginUrl = `${API_BASE}/auth/github`;

export function getMe() {
  return request<MeResponse>("/auth/me");
}

export function login(email: string, password: string) {
  return request<{ message: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(name: string, email: string, password: string) {
  return request<{ message: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function logout() {
  // The backend registers this route as "/auth/logut".
  return request<{ message: string }>("/auth/logut");
}

/* ─── repositories ─────────────────────────────────────── */

export function getGithubRepos() {
  return request<GithubRepo[]>("/user/repo");
}

export async function getConnectedRepos() {
  const data = await request<{ connectedRepos: ConnectedRepo[] }>("/repo/connected");
  return data.connectedRepos ?? [];
}

export async function connectRepo(repo: { repoId: number; owner: string; fullName: string }) {
  const data = await request<{ connectedRepo: ConnectedRepo }>("/repo/connect", {
    method: "POST",
    body: JSON.stringify(repo),
  });
  return data.connectedRepo;
}

export async function getRepo(repoId: number | string) {
  const data = await request<{ fetchData: ConnectedRepo }>(`/user/repo/${enc(String(repoId))}`);
  return data.fetchData;
}

/* ─── pull requests ────────────────────────────────────── */

/** Fetches every PR (open and closed) from GitHub and upserts them. */
export async function getRepoPulls(repo: Pick<ConnectedRepo, "owner" | "name" | "userId">) {
  const data = await request<{ prs: PullRequest[] }>(
    `/repo/pr-all/${enc(repo.owner)}/${enc(repo.name)}/${enc(repo.userId)}`,
  );
  return data.prs ?? [];
}

export async function getPull(
  repo: Pick<ConnectedRepo, "owner" | "name" | "userId">,
  prNumber: number | string,
) {
  const data = await request<{ pr: PullRequest }>(
    `/user/pull-request/${enc(repo.owner)}/${enc(repo.name)}/${enc(String(prNumber))}/${enc(repo.userId)}`,
  );
  return data.pr;
}

export async function getPullFiles(
  repo: Pick<ConnectedRepo, "owner" | "name" | "userId">,
  prNumber: number | string,
) {
  try {
    const data = await request<{ filesChanged: PullRequestFile[] }>(
      `/pr/files-changed/${enc(repo.owner)}/${enc(repo.name)}/${enc(String(prNumber))}/${enc(repo.userId)}`,
    );
    return data.filesChanged ?? [];
  } catch (error) {
    // The backend answers 400 "no files changed" for an empty PR.
    if (error instanceof ApiError && error.status === 400) return [];
    throw error;
  }
}

export async function runAiReview(
  repo: Pick<ConnectedRepo, "owner" | "name" | "userId">,
  prNumber: number | string,
  context?: string,
) {
  const data = await request<{ review: ReviewResult }>("/pr/ai-review", {
    method: "POST",
    body: JSON.stringify({
      userId: repo.userId,
      owner: repo.owner,
      repoName: repo.name,
      pr_Number: prNumber,
      context: context || undefined,
    }),
  });
  return data.review;
}

/* ─── workflows ────────────────────────────────────────── */

export function getWorkflow(repoId: number) {
  return request<{ workflow: StoredWorkflow; webhookActive: boolean }>(
    `/user/workflow?repoId=${enc(String(repoId))}`,
  );
}

export function saveWorkflow(payload: {
  repoId: number;
  nodes: WorkflowGraphNode[];
  edges: WorkflowGraphEdge[];
  workflow?: WorkflowDefinition;
}) {
  return request<{ workflow: StoredWorkflow; webhookActive: boolean }>("/user/workflow", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function executeWorkflow(payload: {
  repoId: number;
  prNumber: number;
  trigger?: string;
  nodes?: WorkflowGraphNode[];
  edges?: WorkflowGraphEdge[];
}) {
  const data = await request<{ result: WorkflowExecutionResult }>("/user/workflow/execute", {
    method: "POST",
    body: JSON.stringify({ trigger: "manual_trigger", ...payload }),
  });
  return data.result;
}

export function enableWebhook(repoId: number) {
  return request<{ webhookActive: boolean; webhookId?: number }>("/user/workflow/webhook/enable", {
    method: "POST",
    body: JSON.stringify({ repoId }),
  });
}
