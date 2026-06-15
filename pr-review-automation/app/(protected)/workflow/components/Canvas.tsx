"use client";

import { Play, RotateCcw, Save } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  Node,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import ExecutionPanel, {
  type ExecutionResult,
  type ExecutionStep,
} from "./ExecutionPanel";
import Inspector from "./Inspector";
import NodeSidebar from "./NodeSidebar";
import {
  buildPlannedSteps,
  getRunnableEdges,
  getRunnableNodes,
  isTriggerFunction,
  mapStepToNodeStatus,
} from "./workflowGraph";
import ActionNode from "./nodes/actionNode";
import AiReviewNode from "./nodes/aiReviewNode";
import GithubWebhookNode from "./nodes/githubWebhookNode";
import SecurityNode from "./nodes/securityScanNode";

const nodeTypes = {
  githubWebhook: GithubWebhookNode,
  aiReview: AiReviewNode,
  securityScan: SecurityNode,
  action: ActionNode,
};

const NODE_TYPE_ALIASES: Record<string, string> = {
  manual: "manual_trigger",
  cron: "scheduled",
  security: "security_scan",
  performance: "performance_review",
  comment: "post_comment",
  approve: "approve_pr",
  slack: "slack_notify",
};

const normalizeNodeType = (type: string) => NODE_TYPE_ALIASES[type] || type;

const getNodeType = (type: string) => {
  const normalized = normalizeNodeType(type);
  switch (normalized) {
    case "pr_opened":
    case "pr_updated":
    case "manual_trigger":
    case "scheduled":
      return "githubWebhook";

    case "code_review":
      return "aiReview";

    case "security_scan":
    case "performance_review":
      return "securityScan";

    case "post_comment":
    case "approve_pr":
    case "slack_notify":
      return "action";

    default:
      return "action";
  }
};

const formatNodeLabel = (type: string) => {
  const normalized = normalizeNodeType(type);
  const labels: Record<string, string> = {
    pr_opened: "PR Opened",
    pr_updated: "PR Updated",
    manual_trigger: "Manual Trigger",
    scheduled: "Scheduled",
    code_review: "AI Code Review",
    security_scan: "Security Scan",
    performance_review: "Performance Review",
    post_comment: "Post Comment",
    approve_pr: "Approve PR",
    slack_notify: "Slack Notify",
  };
  return labels[normalized] || normalized;
};

const getWorkflowFunction = (type: string): string => {
  const normalized = normalizeNodeType(type);
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
  return functions[normalized] || "workflow.unknown";
};

const DEFAULT_NODE_CONFIG: Record<string, Record<string, string | number | boolean>> = {
  code_review: { model: "llama-3.3-70b-versatile", focusInstructions: "" },
  security_scan: { minSeverity: "high", focusInstructions: "" },
  performance_review: { focusInstructions: "" },
  scheduled: { cron: "" },
  pr_opened: { targetBranch: "" },
  post_comment: { includeFindings: true, includeScores: true },
  approve_pr: { onlyIfRecommended: true },
  slack_notify: { channel: "#pr-reviews", mentionAuthor: false },
};

const getDefaultNodeConfig = (type: string) => {
  const normalized = normalizeNodeType(type);
  return { ...(DEFAULT_NODE_CONFIG[normalized] || {}) };
};

const isKnownNodeType = (
  type: string | undefined,
): type is keyof typeof nodeTypes => !!type && type in nodeTypes;

const normalizeLoadedNode = (node: Node): Node => {
  const nodeType = (node.data?.nodeType as string) || "action";
  const reactFlowType = isKnownNodeType(node.type)
    ? node.type
    : getNodeType(nodeType);

  return {
    ...node,
    id: String(node.id),
    type: reactFlowType,
    position: node.position ?? { x: 0, y: 0 },
    data: {
      ...node.data,
      label: node.data?.label || formatNodeLabel(nodeType),
      nodeType,
      event: node.data?.event ?? nodeType,
      action: node.data?.action ?? nodeType,
      repoName: node.data?.repoName ?? "",
      workflow: node.data?.workflow ?? {
        function: getWorkflowFunction(nodeType),
        status: "ready",
      },
      config: node.data?.config ?? getDefaultNodeConfig(nodeType),
    },
  };
};

type WorkflowStep = {
  id: string;
  name: string;
  type: string;
  function: string;
  status: "draft" | "ready" | "running" | "completed" | "failed" | "pending";
};

type WorkflowDefinition = {
  name: string;
  status: "draft" | "active" | "disabled";
  steps: WorkflowStep[];
};

type WorkflowGraph = {
  nodes: Node[];
  edges: Edge[];
  workflow: WorkflowDefinition;
};

type ConnectedRepo = {
  repoId: number;
  name: string;
  fullName: string;
  workflow?: WorkflowGraph;
};

const initialNodes: Node[] = [
  {
    id: "1",
    data: { label: "Start creating workFlow", nodeType: "test" },
    position: { x: 0, y: 100 },
    type: "default",
  },
];

const initialEdges: Edge[] = [];

// ─────────────────────────────────────────────
// Main Canvas Component
// ─────────────────────────────────────────────
export default function Canvas({ selectedRepoId }) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<any>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoadingWorkflow, setIsLoadingWorkflow] = useState(false);
  const [isFlowReady, setIsFlowReady] = useState(false);
  const [prNumber, setPrNumber] = useState("");
  const [runStatus, setRunStatus] = useState<string | null>(null);
  const [executionPanelOpen, setExecutionPanelOpen] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(
    null,
  );
  const [plannedSteps, setPlannedSteps] = useState<ExecutionStep[]>([]);

  const applyNodeStatuses = useCallback(
    (updates: Array<{ nodeId: string; status: string }>) => {
      setNodes((nds) =>
        nds.map((node) => {
          const update = updates.find((item) => item.nodeId === node.id);
          if (!update) return node;

          return {
            ...node,
            data: {
              ...node.data,
              workflow: {
                ...node.data.workflow,
                status: mapStepToNodeStatus(update.status),
              },
            },
          };
        }),
      );
    },
    [setNodes],
  );

  // Called by ReactFlow once it's mounted and ready
  const onInit = useCallback((instance: any) => {
    reactFlowInstance.current = instance;
    setIsFlowReady(true);
  }, []);

  // ─── Load workflow whenever the selected repo changes ───
  useEffect(() => {
    if (selectedRepoId === undefined) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
      return;
    }

    const loadWorkflow = async () => {
      try {
        setIsLoadingWorkflow(true);
        const response = await fetch(
          `http://localhost:4000/user/workflow?repoId=${selectedRepoId}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load saved workflow");
        }

        const data = await response.json();
        const graph = data.workflow || { nodes: [], edges: [] };
        const loadedNodes = (graph.nodes || []).map(normalizeLoadedNode);

        if (loadedNodes.length > 0) {
          setNodes(loadedNodes);
        } else {
          setNodes(initialNodes);
        }

        setEdges(graph.edges || []);

        requestAnimationFrame(() => {
          reactFlowInstance.current?.fitView({ padding: 0.2 });
        });
      } catch (error) {
        console.error("Load workflow error", error);
        setNodes(initialNodes);
        setEdges([]);
      } finally {
        setSelectedNode(null);
        setIsLoadingWorkflow(false);
      }
    };

    loadWorkflow();
  }, [selectedRepoId, setEdges, setNodes]);

  // Auto-fit the view whenever nodes load
  useEffect(() => {
    if (!reactFlowInstance.current || !isFlowReady || nodes.length === 0)
      return;
    reactFlowInstance.current.fitView({ padding: 0.2 });
  }, [nodes, isFlowReady]);

  // ─── Helpers ───────────────────────────────

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            animated: true,
            markerEnd: "arrowclosed",
          },
          eds,
        ),
      );
    },
    [setEdges],
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const rawType = event.dataTransfer.getData("application/reactflow");
      if (!rawType) return;

      const type = normalizeNodeType(rawType);

      if (reactFlowInstance.current) {
        const position = reactFlowInstance.current.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const newNode: Node = {
          id: `node-${Date.now()}`,
          type: getNodeType(type),
          position,
          data: {
            label: formatNodeLabel(type),
            nodeType: type,
            event: type,
            action: type,
            config: getDefaultNodeConfig(type),
            workflow: {
              function: getWorkflowFunction(type),
              status: "ready",
            },
          },
        };

        setNodes((nds) => nds.concat(newNode));
      }
    },
    [setNodes],
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // ─── Node selection ──────────────────────────
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleUpdateNode = useCallback(
    (
      nodeId: string,
      updates: {
        label?: string;
        config?: Record<string, string | number | boolean>;
        workflow?: { function?: string; status?: string };
      },
    ) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== nodeId) return node;

          return {
            ...node,
            data: {
              ...node.data,
              ...updates,
              config: updates.config
                ? { ...node.data.config, ...updates.config }
                : node.data.config,
              workflow: updates.workflow
                ? { ...node.data.workflow, ...updates.workflow }
                : node.data.workflow,
            },
          };
        }),
      );

      setSelectedNode((prev) => {
        if (!prev || prev.id !== nodeId) return prev;
        return {
          ...prev,
          data: {
            ...prev.data,
            ...updates,
            config: updates.config
              ? { ...prev.data.config, ...updates.config }
              : prev.data.config,
            workflow: updates.workflow
              ? { ...prev.data.workflow, ...updates.workflow }
              : prev.data.workflow,
          },
        };
      });
    },
    [setNodes],
  );

  // ─── Inspector actions ───────────────────────
  const handleDeleteNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            edge.source !== selectedNode.id && edge.target !== selectedNode.id,
        ),
      );
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);

  const handleDuplicateNode = useCallback(() => {
    if (selectedNode) {
      const newNode: Node = {
        ...selectedNode,
        id: `node-${Date.now()}`,
        position: {
          x: selectedNode.position.x + 50,
          y: selectedNode.position.y + 50,
        },
      };
      setNodes((nds) => nds.concat(newNode));
      setSelectedNode(newNode);
    }
  }, [selectedNode, setNodes]);

  const handleClearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  // ─── Generate the workflow definition ───────
  // Walks through all current nodes and builds the WorkflowDefinition
  // object that gets sent to the backend — separate from the visual graph
  const generateWorkflow = useCallback((): WorkflowDefinition => {
    const runnableNodes = getRunnableNodes(nodes);
    const steps: WorkflowStep[] = runnableNodes.map((node) => ({
      id: node.id,
      name: node.data.label,
      type: node.data.nodeType,
      function: node.data.workflow?.function || "workflow.unknown",
      status: node.data.workflow?.status || "draft",
    }));

    return {
      name: "AI PR Automation Workflow",
      status: "active",
      steps,
    };
  }, [nodes]);

  const getWorkflowPayload = useCallback(() => {
    const runnableNodes = getRunnableNodes(nodes);
    const runnableEdges = getRunnableEdges(nodes, edges);
    return { runnableNodes, runnableEdges };
  }, [nodes, edges]);

  const handleRunWorkflow = useCallback(async () => {
    if (nodes.length === 0 || selectedRepoId === undefined) return;

    const parsedPrNumber = Number(prNumber);
    if (!prNumber || Number.isNaN(parsedPrNumber) || parsedPrNumber < 1) {
      setRunStatus("Enter a valid PR number to run the workflow");
      setTimeout(() => setRunStatus(null), 3000);
      return;
    }

    const { runnableNodes, runnableEdges } = getWorkflowPayload();

    if (runnableNodes.length === 0) {
      setRunStatus("Add workflow nodes — the placeholder node cannot be executed");
      setTimeout(() => setRunStatus(null), 3000);
      return;
    }

    const planned = buildPlannedSteps(nodes, edges).map((step) => ({
      ...step,
      status: "pending" as const,
    }));

    setPlannedSteps(planned);
    setExecutionResult(null);
    setExecutionPanelOpen(true);
    setIsRunning(true);
    setRunStatus(null);

    applyNodeStatuses(
      planned.map((step) => ({ nodeId: step.nodeId, status: "pending" })),
    );

    const firstActive = planned.find((step) => !isTriggerFunction(step.function));
    if (firstActive) {
      applyNodeStatuses([{ nodeId: firstActive.nodeId, status: "running" }]);
    }

    try {
      await fetch("http://localhost:4000/user/workflow", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoId: Number(selectedRepoId),
          workflow: generateWorkflow(),
          nodes: runnableNodes,
          edges: runnableEdges,
        }),
      });

      const response = await fetch(
        "http://localhost:4000/user/workflow/execute",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            repoId: Number(selectedRepoId),
            prNumber: parsedPrNumber,
            trigger: "manual_trigger",
            nodes: runnableNodes,
            edges: runnableEdges,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Workflow execution failed");
      }

      const data = await response.json();
      const result = data.result as ExecutionResult;

      setExecutionResult({
        ...result,
        prNumber: parsedPrNumber,
        review: result.review
          ? {
              summary: result.review.summary,
              overallScore: result.review.overallScore,
              recommendation: result.review.recommendation,
              findings: result.review.findings?.slice(0, 5),
            }
          : undefined,
      });

      const stepResults = result.steps || [];
      applyNodeStatuses(
        stepResults.map((step) => ({
          nodeId: step.nodeId,
          status: step.status,
        })),
      );
    } catch (error) {
      console.error("Run workflow error", error);
      setExecutionResult({
        status: "failed",
        prNumber: parsedPrNumber,
        steps: planned.map((step) =>
          step.status === "pending" && !isTriggerFunction(step.function)
            ? { ...step, status: "failed" as const, error: "Execution interrupted" }
            : step,
        ),
        message:
          error instanceof Error ? error.message : "Workflow execution failed",
      });
    } finally {
      setIsRunning(false);
      setPlannedSteps([]);
    }
  }, [
    applyNodeStatuses,
    generateWorkflow,
    getWorkflowPayload,
    nodes,
    prNumber,
    selectedRepoId,
  ]);

  // ─── Save Workflow ───────────────────────────
  // Sends BOTH the visual graph (nodes/edges) AND the executable
  // workflow definition to the backend in one request
  const handleSave = useCallback(async () => {
    if (selectedRepoId === undefined) {
      setSaveStatus("Select a repository first");
      setTimeout(() => setSaveStatus(null), 2500);
      return;
    }

    setSaveStatus("Saving...");

    const { runnableNodes, runnableEdges } = getWorkflowPayload();

    try {
      const response = await fetch("http://localhost:4000/user/workflow", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoId: Number(selectedRepoId),
          workflow: generateWorkflow(),
          nodes: runnableNodes,
          edges: runnableEdges,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save workflow");
      }

      const data = await response.json();

      setSaveStatus("Saved successfully");
      if (data.webhookActive) {
        setRunStatus("Saved — GitHub webhook active for PR events");
        setTimeout(() => setRunStatus(null), 4000);
      }
      setTimeout(() => setSaveStatus(null), 2500);
    } catch (error) {
      console.error("Save workflow error", error);
      setSaveStatus("Save failed");
      setTimeout(() => setSaveStatus(null), 2500);
    }
  }, [edges, generateWorkflow, getWorkflowPayload, nodes, selectedRepoId]);

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="flex h-full w-full gap-3 bg-gray-100 p-3">
      {/* Left Sidebar — Node Library */}
      <div className="flex w-80 flex-col gap-4">
        {selectedRepoId ? (
          <NodeSidebar />
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-600 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Select a repository first
            </h3>
            <p className="mt-3 text-sm leading-6">
              Visit the Repositories page and choose a repository to open the
              workflow editor.
            </p>
          </div>
        )}
      </div>

      {/* Main Canvas */}
      <div
        ref={reactFlowWrapper}
        className="flex min-h-[600px] w-[50vw] bg-white rounded-2xl border border-gray-200 overflow-hidden flex-col shadow-sm"
      >
        {!selectedRepoId ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-10 text-center text-slate-600">
            <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-8 text-sm shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">
                No repository selected
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
                Select a repository from the Repositories page to open its
                workflow editor.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between bg-white">
              <h1 className="text-lg font-semibold text-gray-900">
                Workflow Builder
              </h1>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={prNumber}
                  onChange={(e) => setPrNumber(e.target.value)}
                  placeholder="PR #"
                  className="w-20 rounded-lg border border-gray-200 px-2 py-2 text-sm"
                  title="Pull request number for manual run"
                />
                <button
                  onClick={handleClearAll}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Clear all"
                >
                  <RotateCcw size={18} />
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Save size={16} />
                  Save
                </button>
                <button
                  onClick={handleRunWorkflow}
                  disabled={isRunning || nodes.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                >
                  <Play size={16} />
                  {isRunning ? "Running..." : "Run"}
                </button>
              </div>
              {saveStatus ? (
                <div className="text-sm text-gray-500 pl-2">{saveStatus}</div>
              ) : null}
              {runStatus ? (
                <div className="text-sm text-purple-600 pl-2">{runStatus}</div>
              ) : null}
            </div>

            {/* React Flow Canvas */}
            <div className="flex-1 relative min-h-[500px]">
              {isLoadingWorkflow ? (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
                  Loading workflow...
                </div>
              ) : null}
              <ReactFlow
                onInit={onInit}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.25}
                maxZoom={1.5}
                style={{ width: "100%", height: "100%" }}
              >
                <Background color="#aaa" gap={16} />
                <Controls />
              </ReactFlow>
            </div>
          </>
        )}
      </div>

      {/* Right panel — execution results or node inspector */}
      {executionPanelOpen ? (
        <ExecutionPanel
          isOpen={executionPanelOpen}
          isRunning={isRunning}
          result={executionResult}
          plannedSteps={plannedSteps}
          onClose={() => setExecutionPanelOpen(false)}
        />
      ) : (
        <Inspector
          selectedNode={selectedNode}
          onDeleteNode={handleDeleteNode}
          onClose={() => setSelectedNode(null)}
          onDuplicateNode={handleDuplicateNode}
          onUpdateNode={handleUpdateNode}
        />
      )}
    </div>
  );
}
