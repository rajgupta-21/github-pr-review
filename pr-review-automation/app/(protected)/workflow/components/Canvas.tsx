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
import Inspector from "./Inspector";
import NodeSidebar from "./NodeSidebar";
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

type WorkflowStep = {
  id: string;
  name: string;
  type: string;
  function: string; // e.g. "github.pullRequestOpened"
  status: "draft" | "ready" | "running" | "completed" | "failed";
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

type CanvasProps = {
  selectedRepoId?: number;
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
export default function Canvas({ selectedRepoId }: CanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<any>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoadingWorkflow, setIsLoadingWorkflow] = useState(false);
  const [isFlowReady, setIsFlowReady] = useState(false);

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
        // Backend stores the graph separately now (inside data.graph)
        const graph = data.graph || { nodes: [], edges: [] };

        if (graph.nodes?.length > 0) {
          setNodes(graph.nodes);
        } else {
          setNodes(initialNodes);
        }

        setEdges(graph.edges || []);
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

  // Maps a node's logical type → the ReactFlow component to render
  const getNodeType = (type: string) => {
    switch (type) {
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
    return labels[type] || type;
  };

  const getWorkflowFunction = (type: string): string => {
    const functions: Record<string, string> = {
      // Triggers
      pr_opened: "github.pullRequestOpened",
      pr_updated: "github.pullRequestUpdated",
      manual_trigger: "workflow.manualTrigger",
      scheduled: "workflow.scheduled",

      // AI actions
      code_review: "ai.reviewPullRequest",
      security_scan: "ai.securityScan",
      performance_review: "ai.performanceReview",

      // GitHub actions
      post_comment: "github.commentPullRequest",
      approve_pr: "github.approvePullRequest",
      slack_notify: "notification.slack",
    };
    return functions[type] || "workflow.unknown";
  };

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

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

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
            workflow: {
              function: getWorkflowFunction(type), // e.g. "ai.reviewPullRequest"
              status: "ready", // starts as ready, changes during run
            },
          },
        };

        setNodes((nds) => nds.concat(newNode));
      }
    },
    [setNodes],
  );
  console.log("nodes:", nodes);

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
    const steps: WorkflowStep[] = nodes.map((node) => ({
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

  const handleRunWorkflow = useCallback(async () => {
    if (nodes.length === 0) return;

    setIsRunning(true);

    for (const node of nodes) {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== node.id) return n;
          return {
            ...n,
            data: {
              ...n.data,
              workflow: {
                ...n.data.workflow,
                status: "running",
              },
            },
          };
        }),
      );

      // Wait 1 second to simulate work
      await new Promise((r) => setTimeout(r, 1000));

      // Mark as "completed"
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== node.id) return n;
          return {
            ...n,
            data: {
              ...n.data,
              workflow: {
                ...n.data.workflow,
                status: "completed",
              },
            },
          };
        }),
      );
    }

    setIsRunning(false);
  }, [nodes, setNodes]);

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

    try {
      const response = await fetch("http://localhost:4000/user/workflow", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoId: selectedRepoId,
          // The executable workflow steps (what the backend actually runs)
          workflow: generateWorkflow(),
          // The visual graph (what ReactFlow renders)
          graph: {
            nodes,
            edges,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save workflow");
      }

      setSaveStatus("Saved successfully");
      setTimeout(() => setSaveStatus(null), 2500);
    } catch (error) {
      console.error("Save workflow error", error);
      setSaveStatus("Save failed");
      setTimeout(() => setSaveStatus(null), 2500);
    }
  }, [edges, nodes, selectedRepoId, generateWorkflow]);

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
        className="flex min-h-0 w-[50vw] bg-white rounded-2xl border border-gray-200 overflow-hidden flex-col shadow-sm"
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
            </div>

            {/* React Flow Canvas */}
            <div className="flex-1 relative min-h-0">
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

      {/* Right Inspector Panel */}
      <Inspector
        selectedNode={selectedNode}
        onDeleteNode={handleDeleteNode}
        onClose={() => setSelectedNode(null)}
        onDuplicateNode={handleDuplicateNode}
      />
    </div>
  );
}
