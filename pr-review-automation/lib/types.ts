// Shapes returned by the Express backend (backend/src). Keep in sync with the
// controllers — these mirror what they actually send, not what we wish they sent.

export interface User {
  _id: string;
  name?: string;
  email: string | null;
  role: string;
  githubConnected: boolean;
  githubId?: string;
  githubUsername?: string;
  githubAvatarUrl?: string;
  plan: string;
  createdAt?: string;
}

export interface MeResponse {
  authenticated: boolean;
  user: User;
}

/** GET /user/repo — the user's repositories straight from GitHub */
export interface GithubRepo {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
  defaultBranch: string;
  language: string | null;
  htmlUrl: string;
}

export interface WorkflowGraphNode {
  id: string;
  type?: string;
  position?: { x: number; y: number };
  data?: {
    label?: string;
    nodeType?: string;
    config?: Record<string, string | number | boolean>;
    workflow?: { function?: string; status?: string };
    [key: string]: unknown;
  };
}

export interface WorkflowGraphEdge {
  id?: string;
  source: string;
  target: string;
  [key: string]: unknown;
}

export interface WorkflowDefinition {
  name: string;
  status: "draft" | "active" | "disabled";
  steps: Array<{
    id: string;
    name: string;
    type: string;
    function: string;
    status: string;
  }>;
}

export interface StoredWorkflow {
  nodes: WorkflowGraphNode[];
  edges: WorkflowGraphEdge[];
  definition?: WorkflowDefinition;
  updatedAt?: string;
}

/** A ConnectedRepo document (GET /repo/connected, GET /user/repo/:repoId) */
export interface ConnectedRepo {
  _id: string;
  userId: string;
  repoId: number;
  name: string;
  owner: string;
  fullName: string;
  language: string | null;
  description: string | null;
  repoUrl: string;
  webhookActive: boolean;
  webhookId?: number;
  visibility: "public" | "private";
  defaultBranch: string;
  connected: boolean;
  workflow?: StoredWorkflow;
  createdAt: string;
  updatedAt: string;
}

/** A Pr document as stored by /repo/pr-all and /user/pull-request */
export interface PullRequest {
  _id: string;
  repoId: string;
  githubPrId: number;
  githubPrNumber: number;
  title: string;
  body: string | null;
  state: "open" | "closed";
  merged?: boolean;
  draft?: boolean;
  author: { login: string; id: number; avatarUrl: string };
  sourceBranch: string;
  targetBranch: string;
  headSha?: string;
  baseSha?: string;
  githubUrl: string;
  diffUrl?: string;
  patchUrl?: string;
  commits?: number;
  additions?: number;
  deletions?: number;
  changedFiles?: number;
  aiReviewed?: boolean;
  createdAtGithub: string;
  updatedAtGithub: string;
  closedAtGithub?: string | null;
  mergedAtGithub?: string | null;
}

/** GET /pr/files-changed — raw GitHub file entries */
export interface PullRequestFile {
  sha: string;
  filename: string;
  status: "added" | "modified" | "removed" | "renamed" | "copied" | "changed" | "unchanged";
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch?: string;
  previous_filename?: string;
}

export type Severity = "Critical" | "High" | "Medium" | "Low";

export interface ReviewFinding {
  severity: Severity | string;
  file: string;
  issue: string;
  reason: string;
  suggestion: string;
}

/** POST /pr/ai-review → review. Scores come back from the model on a 0–10 scale. */
export interface ReviewResult {
  summary: string;
  overallScore: number;
  securityScore: number;
  performanceScore: number;
  qualityScore: number;
  findings: ReviewFinding[];
  strengths: string[];
  recommendation: "Approve" | "Request Changes" | string;
}

export type ExecutionStepStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "skipped"
  | "triggered";

export interface ExecutionStep {
  nodeId: string;
  name: string;
  function: string;
  status: ExecutionStepStatus;
  message?: string;
  error?: string;
}

export interface PRRunStatus {
  state: "open" | "closed";
  merged: boolean;
  draft: boolean;
  title: string;
  htmlUrl: string;
}

export interface WorkflowExecutionResult {
  repoId: number;
  prNumber: number;
  trigger: string;
  status: "completed" | "failed" | "skipped";
  steps: ExecutionStep[];
  review?: ReviewResult;
  prStatus?: PRRunStatus;
  message?: string;
}
