import type { Edge, Node } from "reactflow";

const PLACEHOLDER_NODE_TYPES = new Set(["test"]);

export function isPlaceholderNode(node: Node): boolean {
  const nodeType = (node.data?.nodeType as string) || "";
  if (PLACEHOLDER_NODE_TYPES.has(nodeType)) return true;
  if (node.type === "default") return true;
  if (
    node.data?.workflow?.function === "workflow.unknown" &&
    !["pr_opened", "pr_updated", "manual_trigger", "scheduled"].includes(
      nodeType,
    )
  ) {
    return true;
  }
  return false;
}

export function getRunnableNodes(nodes: Node[]): Node[] {
  return nodes.filter((node) => !isPlaceholderNode(node));
}

export function getRunnableEdges(nodes: Node[], edges: Edge[]): Edge[] {
  const ids = new Set(getRunnableNodes(nodes).map((node) => node.id));
  return edges.filter(
    (edge) => ids.has(edge.source) && ids.has(edge.target),
  );
}

const TRIGGER_FUNCTIONS = new Set([
  "github.pullRequestOpened",
  "github.pullRequestUpdated",
  "workflow.manualTrigger",
  "workflow.scheduled",
]);

const WEBHOOK_ONLY_TRIGGER_FUNCTIONS = new Set([
  "github.pullRequestOpened",
  "github.pullRequestUpdated",
]);

function getExecutionOrder(
  nodes: Node[],
  edges: Edge[],
  entryNodeIds: string[],
): string[] {
  const nodeIds = new Set(nodes.map((n) => n.id));
  const adjacency = new Map<string, string[]>();

  for (const edge of edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) continue;
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, []);
    adjacency.get(edge.source)!.push(edge.target);
  }

  const visited = new Set<string>();
  const order: string[] = [];
  const queue = [...entryNodeIds];

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    order.push(id);

    const neighbors = adjacency.get(id) || [];
    queue.push(...neighbors);
  }

  return order;
}

function getEntryNodeIds(nodes: Node[], edges: Edge[]): string[] {
  const targets = new Set(edges.map((e) => e.target));
  const roots = nodes.filter((n) => !targets.has(n.id)).map((n) => n.id);
  return roots.length > 0 ? roots : nodes.map((n) => n.id);
}

function nodeMatchesManualTrigger(node: Node): boolean {
  const nodeType = (node.data?.nodeType as string) || "";
  const fn = node.data?.workflow?.function || "";
  return (
    nodeType === "manual_trigger" ||
    fn === "workflow.manualTrigger" ||
    nodeType === "manual"
  );
}

function resolveManualEntryNodes(nodes: Node[], edges: Edge[]): Node[] {
  const manualNodes = nodes.filter((n) => nodeMatchesManualTrigger(n));
  if (manualNodes.length > 0) return manualNodes;

  const entryIds = getEntryNodeIds(nodes, edges);
  const entryNodes = nodes.filter((n) => entryIds.includes(n.id));
  const startIds: string[] = [];

  for (const entry of entryNodes) {
    const fn = (entry.data?.workflow?.function as string) || "";
    if (WEBHOOK_ONLY_TRIGGER_FUNCTIONS.has(fn)) {
      startIds.push(
        ...edges
          .filter((edge) => edge.source === entry.id)
          .map((edge) => edge.target),
      );
    } else {
      startIds.push(entry.id);
    }
  }

  const uniqueStartIds = [...new Set(startIds)];
  if (uniqueStartIds.length > 0) {
    return nodes.filter((n) => uniqueStartIds.includes(n.id));
  }

  return entryNodes;
}

export function buildPlannedSteps(
  nodes: Node[],
  edges: Edge[],
): Array<{ nodeId: string; name: string; function: string }> {
  const runnableNodes = getRunnableNodes(nodes);
  const runnableEdges = getRunnableEdges(nodes, edges);

  if (runnableNodes.length === 0) return [];

  const entryNodes = resolveManualEntryNodes(runnableNodes, runnableEdges);

  const order = getExecutionOrder(
    runnableNodes,
    runnableEdges,
    entryNodes.map((n) => n.id),
  );

  const nodeById = new Map(runnableNodes.map((n) => [n.id, n]));

  return order.map((nodeId) => {
    const node = nodeById.get(nodeId)!;
    return {
      nodeId,
      name: (node.data?.label as string) || nodeId,
      function: (node.data?.workflow?.function as string) || "workflow.unknown",
    };
  });
}

export function mapStepToNodeStatus(
  stepStatus: string,
): "pending" | "running" | "completed" | "failed" | "ready" {
  switch (stepStatus) {
    case "failed":
      return "failed";
    case "completed":
      return "completed";
    case "running":
      return "running";
    case "skipped":
    case "triggered":
      return "ready";
    default:
      return "pending";
  }
}

export function isTriggerFunction(fn: string): boolean {
  return TRIGGER_FUNCTIONS.has(fn);
}
