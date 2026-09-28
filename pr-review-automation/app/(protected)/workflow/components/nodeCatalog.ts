import {
  Bell,
  Bot,
  Check,
  Clock,
  GitPullRequest,
  type LucideIcon,
  MessageSquare,
  Play,
  RefreshCw,
  Shield,
  Zap,
} from "lucide-react";
import type { Node } from "reactflow";

/*
  Single source of truth for workflow node types: labels, backend function
  names, default config, palette grouping and inspector fields. Function names
  must match backend/src/utils/workflowNodeMapping.ts.
*/

export type NodeConfig = Record<string, string | number | boolean>;

export type WorkflowNodeData = {
  label: string;
  nodeType: string;
  event?: string;
  action?: string;
  repoName?: string;
  config?: NodeConfig;
  workflow?: { function?: string; status?: string };
  [key: string]: unknown;
};

export type WorkflowNode = Node<WorkflowNodeData>;

export type NodeCategory = "Trigger" | "Review" | "Action";

export type FieldConfig = {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "checkbox" | "textarea" | "severity";
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  helperText?: string;
  mono?: boolean;
};

export type NodeDefinition = {
  type: string;
  label: string;
  /** shorter label for the palette */
  paletteLabel: string;
  category: NodeCategory;
  /** reactflow node type key */
  flowType: "githubWebhook" | "aiReview" | "securityScan" | "action";
  fn: string;
  icon: LucideIcon;
  description: string;
  defaults: NodeConfig;
  fields: FieldConfig[];
  /** exists in the UI but the backend does not run it yet */
  comingSoon?: boolean;
};

export const NODE_TYPE_ALIASES: Record<string, string> = {
  manual: "manual_trigger",
  cron: "scheduled",
  security: "security_scan",
  performance: "performance_review",
  comment: "post_comment",
  approve: "approve_pr",
  slack: "slack_notify",
};

export const normalizeNodeType = (type: string | undefined) =>
  (type && NODE_TYPE_ALIASES[type]) || type || "";

const DEFINITIONS: NodeDefinition[] = [
  {
    type: "pr_opened",
    label: "PR Opened",
    paletteLabel: "PR opened",
    category: "Trigger",
    flowType: "githubWebhook",
    fn: "github.pullRequestOpened",
    icon: GitPullRequest,
    description:
      "Starts the workflow when a pull request is opened on the connected repository.",
    defaults: { targetBranch: "" },
    fields: [
      {
        name: "targetBranch",
        label: "Target branch filter",
        type: "text",
        placeholder: "e.g. main (leave empty for any)",
        helperText: "Optional — only run when the PR targets this branch.",
        mono: true,
      },
    ],
  },
  {
    type: "pr_updated",
    label: "PR Updated",
    paletteLabel: "PR updated",
    category: "Trigger",
    flowType: "githubWebhook",
    fn: "github.pullRequestUpdated",
    icon: RefreshCw,
    description: "Starts the workflow when new commits are pushed to an open pull request.",
    defaults: {},
    fields: [],
  },
  {
    type: "manual_trigger",
    label: "Manual Trigger",
    paletteLabel: "Manual trigger",
    category: "Trigger",
    flowType: "githubWebhook",
    fn: "workflow.manualTrigger",
    icon: Play,
    description:
      "Starts the workflow when you click Test run in the builder (requires a PR number).",
    defaults: {},
    fields: [],
  },
  {
    type: "scheduled",
    label: "Scheduled",
    paletteLabel: "Scheduled",
    category: "Trigger",
    flowType: "githubWebhook",
    fn: "workflow.scheduled",
    icon: Clock,
    description: "Runs on a cron schedule. Scheduler integration is coming soon.",
    defaults: { cron: "" },
    comingSoon: true,
    fields: [
      {
        name: "cron",
        label: "Cron expression",
        type: "text",
        placeholder: "0 9 * * 1-5",
        helperText: "Standard cron syntax (not yet executed automatically).",
        mono: true,
      },
    ],
  },
  {
    type: "code_review",
    label: "AI Code Review",
    paletteLabel: "AI code review",
    category: "Review",
    flowType: "aiReview",
    fn: "ai.reviewPullRequest",
    icon: Bot,
    description: "Fetches PR diffs and runs an AI review using your connected Groq model.",
    defaults: { model: "llama-3.3-70b-versatile", focusInstructions: "" },
    fields: [
      {
        name: "model",
        label: "Model",
        type: "select",
        options: [{ value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B — default" }],
      },
      {
        name: "focusInstructions",
        label: "Repository instructions",
        type: "textarea",
        placeholder: "e.g. We use Zod for all request validation. Flag any handler that reads req.body without a schema.",
        helperText: "Optional extra instructions passed to the AI reviewer.",
        mono: true,
      },
    ],
  },
  {
    type: "security_scan",
    label: "Security Scan",
    paletteLabel: "Security scan",
    category: "Review",
    flowType: "securityScan",
    fn: "ai.securityScan",
    icon: Shield,
    description: "Runs an AI review focused on security vulnerabilities and unsafe patterns.",
    defaults: { minSeverity: "high", focusInstructions: "" },
    fields: [
      { name: "minSeverity", label: "Report findings at or above", type: "severity" },
      {
        name: "focusInstructions",
        label: "Additional focus",
        type: "textarea",
        placeholder: "e.g. Check auth middleware and input validation",
        mono: true,
      },
    ],
  },
  {
    type: "performance_review",
    label: "Performance Review",
    paletteLabel: "Performance pass",
    category: "Review",
    flowType: "securityScan",
    fn: "ai.performanceReview",
    icon: Zap,
    description: "Runs an AI review focused on performance, memory, and scalability.",
    defaults: { focusInstructions: "" },
    fields: [
      {
        name: "focusInstructions",
        label: "Performance focus",
        type: "textarea",
        placeholder: "e.g. Database queries and N+1 patterns",
        mono: true,
      },
    ],
  },
  {
    type: "post_comment",
    label: "Post Comment",
    paletteLabel: "Comment on PR",
    category: "Action",
    flowType: "action",
    fn: "github.commentPullRequest",
    icon: MessageSquare,
    description:
      "Posts the AI review as a comment on the pull request. Runs a review first if none exists.",
    defaults: { includeFindings: true, includeScores: true },
    fields: [
      { name: "includeFindings", label: "Include detailed findings", type: "checkbox" },
      { name: "includeScores", label: "Include score table", type: "checkbox" },
    ],
  },
  {
    type: "approve_pr",
    label: "Approve PR",
    paletteLabel: "Approve PR",
    category: "Action",
    flowType: "action",
    fn: "github.approvePullRequest",
    icon: Check,
    description:
      "Approves the pull request on GitHub. Skips approval if the review recommends changes.",
    defaults: { onlyIfRecommended: true },
    fields: [
      {
        name: "onlyIfRecommended",
        label: "Only approve when review says Approve",
        type: "checkbox",
      },
    ],
  },
  {
    type: "slack_notify",
    label: "Slack Notify",
    paletteLabel: "Notify Slack",
    category: "Action",
    flowType: "action",
    fn: "notification.slack",
    icon: Bell,
    description:
      "Sends a Slack notification with the review summary. The backend only logs it for now.",
    defaults: { channel: "#pr-reviews", mentionAuthor: false },
    fields: [
      { name: "channel", label: "Channel", type: "text", placeholder: "#pr-reviews", mono: true },
      { name: "mentionAuthor", label: "Mention PR author", type: "checkbox" },
    ],
  },
];

export const NODE_DEFINITIONS: Record<string, NodeDefinition> = Object.fromEntries(
  DEFINITIONS.map((definition) => [definition.type, definition]),
);

export const PALETTE: Array<{ title: string; items: NodeDefinition[] }> = [
  { title: "Triggers", items: DEFINITIONS.filter((d) => d.category === "Trigger") },
  { title: "Review passes", items: DEFINITIONS.filter((d) => d.category === "Review") },
  { title: "Actions", items: DEFINITIONS.filter((d) => d.category === "Action") },
];

export function getDefinition(type: string | undefined) {
  return NODE_DEFINITIONS[normalizeNodeType(type)];
}

export const getFlowType = (type: string) => getDefinition(type)?.flowType ?? "action";

export const formatNodeLabel = (type: string) => {
  const normalized = normalizeNodeType(type);
  return NODE_DEFINITIONS[normalized]?.label ?? normalized;
};

export const getWorkflowFunction = (type: string) =>
  getDefinition(type)?.fn ?? "workflow.unknown";

export const getDefaultNodeConfig = (type: string): NodeConfig => ({
  ...(getDefinition(type)?.defaults ?? {}),
});

/* Category look: icon colour and tile fill, per the design. */
export const CATEGORY_STYLE: Record<NodeCategory, { icon: string; tile: string; label: string }> = {
  Trigger: { icon: "text-violet-600", tile: "bg-violet-50", label: "Trigger" },
  Review: { icon: "text-high", tile: "bg-high-fill", label: "Review" },
  Action: { icon: "text-pass", tile: "bg-pass-fill", label: "Action" },
};

export function getConfigValue(
  config: NodeConfig | undefined,
  field: FieldConfig,
  nodeType: string,
): string | number | boolean {
  const defaults = getDefinition(nodeType)?.defaults ?? {};
  const value = config?.[field.name] ?? defaults[field.name];

  if (field.type === "checkbox") return Boolean(value);
  if (field.type === "number") return typeof value === "number" ? value : Number(value) || 0;
  return typeof value === "string" ? value : String(value ?? "");
}

/** One-line summary under a node's title on the canvas. */
export function nodeSummary(data: WorkflowNodeData): string {
  const type = normalizeNodeType(data.nodeType);
  const config = data.config ?? {};
  const text = (key: string) => (typeof config[key] === "string" ? (config[key] as string).trim() : "");

  switch (type) {
    case "pr_opened":
      return text("targetBranch") ? `any branch → ${text("targetBranch")}` : "any branch";
    case "pr_updated":
      return "new commits pushed";
    case "manual_trigger":
      return "run from the builder";
    case "scheduled":
      return text("cron") || "no schedule set";
    case "code_review":
      return text("focusInstructions") ? "custom instructions" : "full diff review";
    case "security_scan":
      return `report ${text("minSeverity") || "high"} and above`;
    case "performance_review":
      return text("focusInstructions") ? "custom focus" : "queries, memory, scale";
    case "post_comment":
      return config.includeFindings === false ? "summary only" : "summary + findings";
    case "approve_pr":
      return config.onlyIfRecommended === false ? "always approve" : "only if recommended";
    case "slack_notify":
      return text("channel") || "no channel set";
    default:
      return data.workflow?.function ?? "";
  }
}
