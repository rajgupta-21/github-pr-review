import type { Types } from "mongoose";
import { UserModel } from "../schema/user.schema";
import { getOctokit } from "./octokit.service";
import {
  executeWorkflowFunction,
  isExecutableFunction,
} from "./workflowFunctions.service";
import type {
  StepExecutionResult,
  WorkflowContext,
  WorkflowExecutionResult,
} from "../types/workflow.types";
import { fetchPRStatus } from "./prContext.service";
import {
  filterExecutableEdges,
  filterExecutableNodes,
  isTriggerNode,
  nodeMatchesTrigger,
  resolveNodeFunction,
  TRIGGER_FUNCTIONS,
  WEBHOOK_ONLY_TRIGGER_FUNCTIONS,
} from "../utils/workflowNodeMapping";

type WorkflowGraph = {
  nodes?: Array<{
    id: string;
    type?: string;
    data?: {
      label?: string;
      nodeType?: string;
      workflow?: { function?: string; status?: string };
    };
  }>;
  edges?: Array<{ source: string; target: string }>;
  definition?: {
    name?: string;
    status?: string;
    steps?: unknown[];
  } | null;
};

type ConnectedRepoDoc = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  repoId: number;
  owner: string;
  name: string;
  workflow?: WorkflowGraph | null;
};

function getExecutionOrder(
  nodes: WorkflowGraph["nodes"],
  edges: WorkflowGraph["edges"],
  entryNodeIds: string[],
): string[] {
  const nodeIds = new Set((nodes || []).map((n) => n.id));
  const adjacency = new Map<string, string[]>();

  for (const edge of edges || []) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) continue;
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, []);
    adjacency.get(edge.source)!.push(edge.target);
  }

  const visited = new Set<string>();
  const order: string[] = [];
  const queue = [...entryNodeIds];

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);
    order.push(nodeId);

    const neighbors = adjacency.get(nodeId) || [];
    queue.push(...neighbors);
  }

  return order;
}

function getEntryNodeIds(
  nodes: NonNullable<WorkflowGraph["nodes"]>,
  edges: NonNullable<WorkflowGraph["edges"]>,
): string[] {
  const nodeIds = new Set(nodes.map((n) => n.id));
  const targets = new Set(
    (edges || []).filter((e) => nodeIds.has(e.target)).map((e) => e.target),
  );

  const roots = nodes.filter((n) => !targets.has(n.id)).map((n) => n.id);
  return roots.length > 0 ? roots : nodes.map((n) => n.id);
}

function resolveTriggerNodes(
  nodes: NonNullable<WorkflowGraph["nodes"]>,
  edges: NonNullable<WorkflowGraph["edges"]>,
  trigger: string,
) {
  const matched = nodes.filter((node) => nodeMatchesTrigger(node, trigger));

  if (matched.length > 0) {
    return matched;
  }

  if (trigger === "manual_trigger" && nodes.length > 0) {
    const entryIds = getEntryNodeIds(nodes, edges);
    const entryNodes = nodes.filter((node) => entryIds.includes(node.id));

    // Manual runs should not start at webhook triggers (PR Opened / PR Updated).
    // Walk past them to the first actionable downstream nodes.
    const manualStartIds: string[] = [];

    for (const entry of entryNodes) {
      const fn = resolveNodeFunction(entry);
      if (WEBHOOK_ONLY_TRIGGER_FUNCTIONS.has(fn)) {
        const childIds = (edges || [])
          .filter((edge) => edge.source === entry.id)
          .map((edge) => edge.target);
        manualStartIds.push(...childIds);
      } else {
        manualStartIds.push(entry.id);
      }
    }

    const uniqueStartIds = [...new Set(manualStartIds)];

    if (uniqueStartIds.length > 0) {
      return nodes.filter((node) => uniqueStartIds.includes(node.id));
    }

    return entryNodes;
  }

  return [];
}

function getTriggerStepMessage(fn: string, runTrigger: string): string {
  if (fn === "workflow.manualTrigger") {
    return "Manual run started";
  }
  if (fn === "github.pullRequestOpened") {
    return runTrigger === "manual_trigger"
      ? "Webhook trigger — runs automatically when a PR is opened"
      : "PR opened event matched";
  }
  if (fn === "github.pullRequestUpdated") {
    return runTrigger === "manual_trigger"
      ? "Webhook trigger — runs automatically when a PR is updated"
      : "PR updated event matched";
  }
  if (fn === "workflow.scheduled") {
    return "Scheduled trigger matched";
  }
  return "Trigger matched — no action required";
}

function buildSkippedResult(
  base: Pick<WorkflowExecutionResult, "repoId" | "prNumber" | "trigger">,
  message: string,
  prStatus?: WorkflowExecutionResult["prStatus"],
): WorkflowExecutionResult {
  return {
    ...base,
    status: "skipped",
    steps: [],
    message,
    prStatus,
  };
}

export async function executeWorkflow(params: {
  connectedRepo: ConnectedRepoDoc;
  trigger: string;
  prNumber: number;
}): Promise<WorkflowExecutionResult> {
  const { connectedRepo, trigger, prNumber } = params;
  const allNodes = connectedRepo.workflow?.nodes || [];
  const allEdges = connectedRepo.workflow?.edges || [];

  const nodes = filterExecutableNodes(allNodes);
  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = filterExecutableEdges(allEdges, nodeIds);

  const baseResult = {
    repoId: connectedRepo.repoId,
    prNumber,
    trigger,
  };

  if (nodes.length === 0) {
    return buildSkippedResult(
      baseResult,
      "No executable workflow nodes — remove the placeholder and add real steps",
    );
  }

  const user = await UserModel.findById(connectedRepo.userId);
  if (!user?.githubAccessToken) {
    throw new Error("User GitHub token not found");
  }

  const octokit = getOctokit(user.githubAccessToken);
  const prStatus = await fetchPRStatus(
    octokit,
    connectedRepo.owner,
    connectedRepo.name,
    prNumber,
  );

  if (prStatus.merged) {
    return buildSkippedResult(
      baseResult,
      "This pull request is already merged — workflow cannot run",
      prStatus,
    );
  }

  if (prStatus.state === "closed") {
    return buildSkippedResult(
      baseResult,
      "This pull request is closed — workflow cannot run",
      prStatus,
    );
  }

  const triggerNodes = resolveTriggerNodes(nodes, edges, trigger);

  if (triggerNodes.length === 0) {
    return buildSkippedResult(
      baseResult,
      "No matching trigger found — add a Manual Trigger or connect your entry node",
      prStatus,
    );
  }

  const ctx: WorkflowContext = {
    userId: String(connectedRepo.userId),
    owner: connectedRepo.owner,
    repo: connectedRepo.name,
    repoId: connectedRepo.repoId,
    prNumber,
    octokit,
  };

  const executionOrder = getExecutionOrder(
    nodes,
    edges,
    triggerNodes.map((n) => n.id),
  );

  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const steps: StepExecutionResult[] = [];

  for (const nodeId of executionOrder) {
    const node = nodeById.get(nodeId);
    if (!node) continue;

    const fn = resolveNodeFunction(node);
    const stepResult: StepExecutionResult = {
      nodeId,
      name: node.data?.label || nodeId,
      function: fn,
      status: "running",
    };

    if (TRIGGER_FUNCTIONS.has(fn)) {
      stepResult.message = getTriggerStepMessage(fn, trigger);
      stepResult.status = "triggered";
      steps.push(stepResult);
      continue;
    }

    if (!isExecutableFunction(fn)) {
      stepResult.status = "failed";
      stepResult.error = `Unsupported workflow function: ${fn}`;
      steps.push(stepResult);
      continue;
    }

    try {
      const message = await executeWorkflowFunction(fn, ctx, node);
      stepResult.status = "completed";
      stepResult.message = message || "Step completed";
      steps.push(stepResult);
    } catch (error) {
      stepResult.status = "failed";
      stepResult.error =
        error instanceof Error ? error.message : "Step execution failed";
      steps.push(stepResult);

      return {
        ...baseResult,
        status: "failed",
        steps,
        review: ctx.review,
        prStatus,
      };
    }
  }

  const hasFailure = steps.some((step) => step.status === "failed");

  return {
    ...baseResult,
    status: hasFailure ? "failed" : "completed",
    steps,
    review: ctx.review,
    prStatus,
  };
}

export function workflowHasPREventTriggers(nodes: WorkflowGraph["nodes"]): boolean {
  const executable = filterExecutableNodes(nodes || []);
  return executable.some(
    (node) =>
      isTriggerNode(node) &&
      (nodeMatchesTrigger(node, "pr_opened") ||
        nodeMatchesTrigger(node, "pr_updated")),
  );
}
