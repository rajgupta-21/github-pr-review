export const NODE_TYPE_ALIASES: Record<string, string> = {
  manual: "manual_trigger",
  cron: "scheduled",
  security: "security_scan",
  performance: "performance_review",
  comment: "post_comment",
  approve: "approve_pr",
  slack: "slack_notify",
};

export function normalizeNodeType(type: string | undefined): string {
  if (!type) return "action";
  return NODE_TYPE_ALIASES[type] || type;
}

export function nodeTypeToFunction(nodeType: string): string {
  const type = normalizeNodeType(nodeType);
  const functions: Record<string, string> = {
    pr_opened: "github.pullRequestOpened",
    pr_updated: "github.pullRequestUpdated",
    manual_trigger: "workflow.manualTrigger",
    scheduled: "workflow.scheduled",
    code_review: "ai.reviewPullRequest",
    security_scan: "ai.securityScan",
    performance_review: "ai.performanceReview",
    post_comment: "github.commentPullRequest",
    approve_pr: "github.approvePullRequest",
    slack_notify: "notification.slack",
  };
  return functions[type] || "workflow.unknown";
}

export const TRIGGER_FUNCTIONS = new Set([
  "github.pullRequestOpened",
  "github.pullRequestUpdated",
  "workflow.manualTrigger",
  "workflow.scheduled",
]);

/** Webhook-only triggers — skipped as entry points during manual runs */
export const WEBHOOK_ONLY_TRIGGER_FUNCTIONS = new Set([
  "github.pullRequestOpened",
  "github.pullRequestUpdated",
]);

export const TRIGGER_NODE_TYPES = new Set([
  "pr_opened",
  "pr_updated",
  "manual_trigger",
  "scheduled",
]);

export function resolveNodeType(node: {
  data?: { nodeType?: string; event?: string; action?: string };
}): string {
  const raw = node.data?.nodeType || node.data?.event || node.data?.action;
  return normalizeNodeType(raw);
}

export function isTriggerNode(node: { data?: { nodeType?: string; event?: string; action?: string; workflow?: { function?: string } } }): boolean {
  const nodeType = resolveNodeType(node);
  const fn = node.data?.workflow?.function || nodeTypeToFunction(nodeType);
  return TRIGGER_NODE_TYPES.has(nodeType) || TRIGGER_FUNCTIONS.has(fn);
}

export function resolveNodeFunction(node: {
  data?: { nodeType?: string; event?: string; action?: string; workflow?: { function?: string } };
}): string {
  const nodeType = resolveNodeType(node);
  return node.data?.workflow?.function || nodeTypeToFunction(nodeType);
}

export function isPlaceholderNode(node: {
  id?: string;
  type?: string;
  data?: { nodeType?: string; event?: string; action?: string; workflow?: { function?: string } };
}): boolean {
  const nodeType = resolveNodeType(node);
  if (nodeType === "test") return true;
  if (node.type === "default") return true;

  const fn = resolveNodeFunction(node);
  if (fn === "workflow.unknown" && !TRIGGER_NODE_TYPES.has(nodeType)) {
    return true;
  }

  return false;
}

export function filterExecutableNodes<
  T extends { id: string; type?: string; data?: { nodeType?: string; event?: string; action?: string; workflow?: { function?: string } } },
>(nodes: T[]): T[] {
  return nodes.filter((node) => !isPlaceholderNode(node));
}

export function filterExecutableEdges<
  T extends { source: string; target: string },
>(edges: T[], nodeIds: Set<string>): T[] {
  return edges.filter(
    (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
  );
}

export function nodeMatchesTrigger(
  node: { data?: { nodeType?: string; event?: string; action?: string; workflow?: { function?: string } } },
  trigger: string,
): boolean {
  const nodeType = resolveNodeType(node);
  const fn = resolveNodeFunction(node);

  const triggerMatchers: Record<string, string[]> = {
    pr_opened: ["pr_opened", "github.pullRequestOpened"],
    pr_updated: ["pr_updated", "github.pullRequestUpdated"],
    manual_trigger: ["manual_trigger", "workflow.manualTrigger"],
    scheduled: ["scheduled", "workflow.scheduled"],
    opened: ["pr_opened", "github.pullRequestOpened"],
    reopened: ["pr_opened", "github.pullRequestOpened"],
    synchronize: ["pr_updated", "github.pullRequestUpdated"],
  };

  const matchers = triggerMatchers[trigger] || [trigger];
  return matchers.includes(nodeType) || matchers.includes(fn);
}
