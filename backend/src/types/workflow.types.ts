import type { Octokit } from "@octokit/rest";

export type WorkflowStepStatus =
  | "draft"
  | "ready"
  | "running"
  | "completed"
  | "failed"
  | "skipped";

export type WorkflowStep = {
  id: string;
  name: string;
  type: string;
  function: string;
  status: WorkflowStepStatus;
};

export type WorkflowDefinition = {
  name: string;
  status: "draft" | "active" | "disabled";
  steps: WorkflowStep[];
};

export type ReviewFinding = {
  severity: string;
  file: string;
  issue: string;
  reason: string;
  suggestion: string;
};

export type ReviewResult = {
  summary: string;
  overallScore: number;
  securityScore: number;
  performanceScore: number;
  qualityScore: number;
  findings: ReviewFinding[];
  strengths: string[];
  recommendation: string;
};

export type PRFile = {
  filename: string;
  status: string;
  patch?: string;
};

export type WorkflowContext = {
  userId: string;
  owner: string;
  repo: string;
  repoId: number;
  prNumber: number;
  octokit: Octokit;
  pr?: {
    title: string;
    description: string | null;
    htmlUrl: string;
  };
  files?: PRFile[];
  review?: ReviewResult;
};

export type StepExecutionResult = {
  nodeId: string;
  name: string;
  function: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped" | "triggered";
  message?: string;
  error?: string;
};

export type PRRunStatus = {
  state: "open" | "closed";
  merged: boolean;
  draft: boolean;
  title: string;
  htmlUrl: string;
  reviewState?: string;
};

export type WorkflowExecutionResult = {
  repoId: number;
  prNumber: number;
  trigger: string;
  status: "completed" | "failed" | "skipped";
  steps: StepExecutionResult[];
  review?: ReviewResult;
  prStatus?: PRRunStatus;
  message?: string;
};
