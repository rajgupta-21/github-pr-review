"use client";

import { MousePointerClick, Play } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  type Connection,
  type Edge,
  MarkerType,
  type NodeMouseHandler,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

import { TopbarShell } from "@/components/shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorBanner, LoadingState } from "@/components/ui/feedback";
import { enableWebhook, executeWorkflow, getWorkflow, saveWorkflow } from "@/lib/api";
import type {
  ConnectedRepo,
  ExecutionStep,
  WorkflowDefinition,
  WorkflowExecutionResult,
  WorkflowGraphEdge,
  WorkflowGraphNode,
} from "@/lib/types";
import { cn } from "@/lib/utils";

import CanvasControls from "./CanvasControls";
import ExecutionPanel from "./ExecutionPanel";
import Inspector from "./Inspector";
import {
  formatNodeLabel,
  getDefaultNodeConfig,
  getFlowType,
  getWorkflowFunction,
  normalizeNodeType,
  type WorkflowNode,
  type WorkflowNodeData,
} from "./nodeCatalog";
import NodeSidebar from "./NodeSidebar";
import WorkflowNodeCard from "./nodes/WorkflowNode";
import {
  buildPlannedSteps,
  getRunnableEdges,
  getRunnableNodes,
  isPlaceholderNode,
  isTriggerFunction,
  mapStepToNodeStatus,
} from "./workflowGraph";

// All four stored reactflow types render with the same card; the look comes
// from the node's category (see nodeCatalog).
const nodeTypes = {
  githubWebhook: WorkflowNodeCard,
  aiReview: WorkflowNodeCard,
  securityScan: WorkflowNodeCard,
  action: WorkflowNodeCard,
};

const DEFAULT_WORKFLOW_NAME = "AI PR Automation Workflow";

const EDGE_IDLE = "#B8B4C4";
const EDGE_DONE = "#0F6B48";
const EDGE_ACTIVE = "#5B36E8";

const isKnownNodeType = (type: string | undefined): type is keyof typeof nodeTypes =>
  !!type && type in nodeTypes;

function normalizeLoadedNode(node: WorkflowGraphNode): WorkflowNode {
  const nodeType = (node.data?.nodeType as string) || "action";
  return {
    ...node,
    id: String(node.id),
    type: isKnownNodeType(node.type) ? node.type : getFlowType(nodeType),
    position: node.position ?? { x: 0, y: 0 },
    data: {
      ...node.data,
      label: node.data?.label || formatNodeLabel(nodeType),
      nodeType,
      event: (node.data?.event as string) ?? nodeType,
      action: (node.data?.action as string) ?? nodeType,
      repoName: (node.data?.repoName as string) ?? "",
      workflow: node.data?.workflow ?? {
        function: getWorkflowFunction(nodeType),
        status: "ready",
      },
      config: node.data?.config ?? getDefaultNodeConfig(nodeType),
    },
  };
}

type Notice = { tone: "info" | "error" | "success"; text: string } | null;

export default function Canvas({
  repo,
  repos,
  onSelectRepo,
}: {
  repo: ConnectedRepo;
  repos: ConnectedRepo[];
  onSelectRepo: (repoId: number) => void;
}) {
  const reactFlow = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState(DEFAULT_WORKFLOW_NAME);
  const [webhookActive, setWebhookActive] = useState(repo.webhookActive);
  const [enablingWebhook, setEnablingWebhook] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(
    repo.workflow?.nodes?.length ? (repo.workflow.updatedAt ?? null) : null,
  );
  const [isLoadingWorkflow, setIsLoadingWorkflow] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [prNumber, setPrNumber] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [executionPanelOpen, setExecutionPanelOpen] = useState(false);
  const [executionResult, setExecutionResult] = useState<WorkflowExecutionResult | null>(null);
  const [plannedSteps, setPlannedSteps] = useState<ExecutionStep[]>([]);
  const [runPrNumber, setRunPrNumber] = useState<number | null>(null);
  const [runStartedAt, setRunStartedAt] = useState<number | null>(null);
  const [runFinishedAt, setRunFinishedAt] = useState<number | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  const flash = useCallback((next: Notice, ms = 3000) => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    setNotice(next);
    if (next) noticeTimer.current = setTimeout(() => setNotice(null), ms);
  }, []);

  useEffect(() => () => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
  }, []);

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
              workflow: { ...node.data.workflow, status: mapStepToNodeStatus(update.status) },
            },
          };
        }),
      );
    },
    [setNodes],
  );

  // ─── Load the saved workflow for this repository ───
  useEffect(() => {
    let cancelled = false;

    getWorkflow(repo.repoId)
      .then((data) => {
        if (cancelled) return;
        const graph = data.workflow || { nodes: [], edges: [] };
        const loadedNodes = (graph.nodes || [])
          .map(normalizeLoadedNode)
          .filter((node) => !isPlaceholderNode(node));
        const ids = new Set(loadedNodes.map((node) => node.id));
        setNodes(loadedNodes);
        setEdges(
          ((graph.edges || []) as Edge[]).filter(
            (edge) => ids.has(edge.source) && ids.has(edge.target),
          ),
        );
        setWorkflowName(graph.definition?.name || DEFAULT_WORKFLOW_NAME);
        setWebhookActive(Boolean(data.webhookActive));
        requestAnimationFrame(() => reactFlow.fitView({ padding: 0.2 }));
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error("Load workflow error", error);
        setNodes([]);
        setEdges([]);
        setLoadError(error instanceof Error ? error.message : "Failed to load saved workflow");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingWorkflow(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reactFlow, repo.repoId, setEdges, setNodes]);

  // ─── Graph editing ───
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds),
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
      const position = reactFlow.screenToFlowPosition({ x: event.clientX, y: event.clientY });

      const newNode: WorkflowNode = {
        id: `node-${Date.now()}`,
        type: getFlowType(type),
        position,
        data: {
          label: formatNodeLabel(type),
          nodeType: type,
          event: type,
          action: type,
          config: getDefaultNodeConfig(type),
          workflow: { function: getWorkflowFunction(type), status: "ready" },
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setSelectedNodeId(newNode.id);
    },
    [reactFlow, setNodes],
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNodeId(node.id);
  }, []);

  const handleUpdateNode = useCallback(
    (nodeId: string, updates: Partial<WorkflowNodeData>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== nodeId) return node;
          return {
            ...node,
            data: {
              ...node.data,
              ...updates,
              config: updates.config ? { ...node.data.config, ...updates.config } : node.data.config,
              workflow: updates.workflow
                ? { ...node.data.workflow, ...updates.workflow }
                : node.data.workflow,
            },
          };
        }),
      );
    },
    [setNodes],
  );

  const handleDeleteNode = useCallback(() => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id),
    );
    setSelectedNodeId(null);
  }, [selectedNode, setNodes, setEdges]);

  const handleDuplicateNode = useCallback(() => {
    if (!selectedNode) return;
    const newNode: WorkflowNode = {
      ...selectedNode,
      id: `node-${Date.now()}`,
      selected: false,
      position: { x: selectedNode.position.x + 50, y: selectedNode.position.y + 50 },
      data: { ...selectedNode.data },
    };
    setNodes((nds) => nds.concat(newNode));
    setSelectedNodeId(newNode.id);
  }, [selectedNode, setNodes]);

  const handleClearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
  }, [setNodes, setEdges]);

  // ─── Save / run ───
  // The executable definition is sent alongside the visual graph.
  const generateWorkflow = useCallback((): WorkflowDefinition => {
    const steps = getRunnableNodes(nodes).map((node) => ({
      id: node.id,
      name: node.data.label,
      type: node.data.nodeType,
      function: node.data.workflow?.function || "workflow.unknown",
      status: node.data.workflow?.status || "draft",
    }));
    return { name: workflowName.trim() || DEFAULT_WORKFLOW_NAME, status: "active", steps };
  }, [nodes, workflowName]);

  const persist = useCallback(async () => {
    const runnableNodes = getRunnableNodes(nodes);
    const runnableEdges = getRunnableEdges(nodes, edges);
    const data = await saveWorkflow({
      repoId: repo.repoId,
      workflow: generateWorkflow(),
      nodes: runnableNodes as unknown as WorkflowGraphNode[],
      edges: runnableEdges as unknown as WorkflowGraphEdge[],
    });
    setSavedAt(new Date().toISOString());
    setWebhookActive(Boolean(data.webhookActive));
    return { data, runnableNodes, runnableEdges };
  }, [edges, generateWorkflow, nodes, repo.repoId]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const { data } = await persist();
      flash(
        {
          tone: "success",
          text: data.webhookActive ? "Saved — webhook active for PR events" : "Saved",
        },
        data.webhookActive ? 4000 : 2500,
      );
    } catch (error) {
      console.error("Save workflow error", error);
      flash({ tone: "error", text: error instanceof Error ? error.message : "Save failed" });
    } finally {
      setIsSaving(false);
    }
  }, [flash, persist]);

  const handleRunWorkflow = useCallback(async () => {
    if (nodes.length === 0) return;

    const parsedPrNumber = Number(prNumber);
    if (!prNumber || Number.isNaN(parsedPrNumber) || parsedPrNumber < 1) {
      flash({ tone: "error", text: "Enter a PR number to test the workflow" });
      return;
    }

    if (getRunnableNodes(nodes).length === 0) {
      flash({ tone: "error", text: "Add workflow nodes before running" });
      return;
    }

    const planned: ExecutionStep[] = buildPlannedSteps(nodes, edges).map((step) => ({
      ...step,
      status: "pending",
    }));

    setPlannedSteps(planned);
    setExecutionResult(null);
    setExecutionPanelOpen(true);
    setIsRunning(true);
    setRunPrNumber(parsedPrNumber);
    setRunStartedAt(Date.now());
    setRunFinishedAt(null);

    applyNodeStatuses(planned.map((step) => ({ nodeId: step.nodeId, status: "pending" })));
    const firstActive = planned.find((step) => !isTriggerFunction(step.function));
    if (firstActive) applyNodeStatuses([{ nodeId: firstActive.nodeId, status: "running" }]);

    try {
      const { runnableNodes, runnableEdges } = await persist();
      const result = await executeWorkflow({
        repoId: repo.repoId,
        prNumber: parsedPrNumber,
        trigger: "manual_trigger",
        nodes: runnableNodes as unknown as WorkflowGraphNode[],
        edges: runnableEdges as unknown as WorkflowGraphEdge[],
      });

      setExecutionResult({ ...result, prNumber: parsedPrNumber });
      applyNodeStatuses(
        (result.steps || []).map((step) => ({ nodeId: step.nodeId, status: step.status })),
      );
    } catch (error) {
      console.error("Run workflow error", error);
      setExecutionResult({
        repoId: repo.repoId,
        trigger: "manual_trigger",
        status: "failed",
        prNumber: parsedPrNumber,
        steps: planned.map((step) =>
          !isTriggerFunction(step.function)
            ? { ...step, status: "failed", error: "Execution interrupted" }
            : step,
        ),
        message: error instanceof Error ? error.message : "Workflow execution failed",
      });
      applyNodeStatuses(
        planned
          .filter((step) => !isTriggerFunction(step.function))
          .map((step) => ({ nodeId: step.nodeId, status: "failed" })),
      );
    } finally {
      setIsRunning(false);
      setRunFinishedAt(Date.now());
      setPlannedSteps([]);
    }
  }, [applyNodeStatuses, edges, flash, nodes, persist, prNumber, repo.repoId]);

  const handleEnableWebhook = useCallback(async () => {
    setEnablingWebhook(true);
    try {
      const data = await enableWebhook(repo.repoId);
      setWebhookActive(Boolean(data.webhookActive));
      flash(
        data.webhookActive
          ? { tone: "success", text: "Webhook enabled" }
          : { tone: "error", text: "Webhook URL is not configured on the server" },
      );
    } catch (error) {
      flash({ tone: "error", text: error instanceof Error ? error.message : "Failed to enable webhook" });
    } finally {
      setEnablingWebhook(false);
    }
  }, [flash, repo.repoId]);

  // ─── Edge styling follows the run: done paths green, the active one violet ───
  const displayEdges = useMemo(() => {
    const status = new Map(nodes.map((node) => [node.id, node.data.workflow?.status]));
    return edges.map((edge) => {
      const source = status.get(edge.source);
      const target = status.get(edge.target);
      const active = target === "running";
      const done = source === "completed" && (target === "completed" || target === "running");
      const color = active ? EDGE_ACTIVE : done ? EDGE_DONE : EDGE_IDLE;
      return {
        ...edge,
        type: "default",
        animated: active,
        style: { ...edge.style, stroke: color, strokeWidth: active ? 2.6 : done ? 2.4 : 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
      };
    });
  }, [edges, nodes]);

  const runnableCount = getRunnableNodes(nodes).length;

  return (
    <TopbarShell
      crumbs={[{ label: "Workflows", href: "/workflow" }, { label: workflowName || DEFAULT_WORKFLOW_NAME }]}
      actions={
        <>
          {notice ? (
            <span
              role="status"
              className={cn(
                "hidden max-w-60 truncate text-[12.5px] md:inline",
                notice.tone === "error" ? "text-[#FF9AA8]" : notice.tone === "success" ? "text-[#7FD6AE]" : "text-ink-muted",
              )}
            >
              {notice.text}
            </span>
          ) : null}
          {repos.length > 1 ? (
            <label className="hidden lg:block">
              <span className="sr-only">Repository</span>
              <select
                value={repo.repoId}
                onChange={(event) => onSelectRepo(Number(event.target.value))}
                className="h-9 max-w-52 truncate rounded-[9px] border border-ink-line-strong bg-ink-850 px-2.5 font-mono text-[12.5px] text-ink-fg outline-none focus:border-violet-400"
              >
                {repos.map((item) => (
                  <option key={item.repoId} value={item.repoId}>
                    {item.fullName}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <span className="hidden font-mono text-[12.5px] text-ink-muted lg:inline">
              {repo.fullName}
            </span>
          )}
          <Badge
            tone={webhookActive ? "pass" : "neutral"}
            dot
            size="sm"
            className={cn("hidden sm:inline-flex", !webhookActive && "bg-ink-750 text-ink-muted")}
          >
            {webhookActive ? "Webhook on" : "Webhook off"}
          </Badge>
          <span className="mx-0.5 hidden h-6 w-px bg-ink-line-strong sm:block" aria-hidden="true" />
          <label>
            <span className="sr-only">Pull request number for a test run</span>
            <input
              type="number"
              min={1}
              inputMode="numeric"
              value={prNumber}
              onChange={(event) => setPrNumber(event.target.value)}
              placeholder="PR #"
              className="h-9 w-[76px] rounded-[9px] border border-ink-line-strong bg-transparent px-2.5 font-mono text-[13px] text-ink-fg outline-none placeholder:text-ink-subtle focus:border-violet-400"
            />
          </label>
          <Button
            variant="ink"
            size="sm"
            onClick={handleRunWorkflow}
            loading={isRunning}
            disabled={isRunning || runnableCount === 0}
          >
            {isRunning ? null : <Play aria-hidden="true" />}
            {isRunning ? "Running…" : "Test run"}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} loading={isSaving} disabled={isSaving}>
            Save &amp; publish
          </Button>
        </>
      }
    >
      <div className="flex h-[calc(100vh-56px)] min-h-[560px]">
        <NodeSidebar />

        <div className="relative min-w-0 flex-1 bg-[#F1F0EC]" onDrop={onDrop} onDragOver={onDragOver}>
          {loadError ? (
            <ErrorBanner className="absolute top-4 left-1/2 z-10 w-[min(480px,calc(100%-32px))] -translate-x-1/2">
              Couldn’t load the saved workflow: {loadError}
            </ErrorBanner>
          ) : null}

          {isLoadingWorkflow ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#F1F0EC]/70">
              <LoadingState label="Loading workflow…" />
            </div>
          ) : nodes.length === 0 ? (
            <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center p-6">
              <div className="max-w-sm rounded-xl border border-dashed border-line-control bg-surface/90 px-6 py-7 text-center">
                <span className="mx-auto mb-3 inline-flex size-11 items-center justify-center rounded-[12px] bg-violet-50 text-violet-600">
                  <MousePointerClick className="size-5" aria-hidden="true" />
                </span>
                <h2 className="font-display text-[17px] font-bold text-fg">Start with a trigger</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
                  Drag <strong className="font-semibold">PR opened</strong> from the left, then add a
                  review pass and an action. Connect them to set the order.
                </p>
              </div>
            </div>
          ) : null}

          <ReactFlow
            nodes={nodes}
            edges={displayEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={() => setSelectedNodeId(null)}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.25}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
            className="h-full w-full"
          >
            <Background variant={BackgroundVariant.Dots} color="#D7D4CC" gap={20} size={1.2} />
            <CanvasControls onClear={handleClearAll} canClear={nodes.length > 0 || edges.length > 0} />
          </ReactFlow>

          {executionPanelOpen ? (
            <ExecutionPanel
              isRunning={isRunning}
              prNumber={runPrNumber}
              startedAt={runStartedAt}
              finishedAt={runFinishedAt}
              result={executionResult}
              plannedSteps={plannedSteps}
              onClose={() => setExecutionPanelOpen(false)}
            />
          ) : null}
        </div>

        <Inspector
          selectedNode={selectedNode}
          onDeleteNode={handleDeleteNode}
          onClose={() => setSelectedNodeId(null)}
          onDuplicateNode={handleDuplicateNode}
          onUpdateNode={handleUpdateNode}
          workflow={{
            name: workflowName,
            onRename: setWorkflowName,
            repo,
            webhookActive,
            enablingWebhook,
            onEnableWebhook: handleEnableWebhook,
            savedAt,
            nodeCount: runnableCount,
            edgeCount: getRunnableEdges(nodes, edges).length,
          }}
        />
      </div>
    </TopbarShell>
  );
}
