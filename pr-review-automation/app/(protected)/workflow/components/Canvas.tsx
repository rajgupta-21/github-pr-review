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

const nodeTypes = {};

type WorkflowGraph = {
  nodes: Node[];
  edges: Edge[];
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
    data: { label: "Start: PR Opened", nodeType: "pr_opened" },
    position: { x: 0, y: 100 },
    type: "default",
  },
];

const initialEdges: Edge[] = [];

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
  const onInit = useCallback((instance: any) => {
    reactFlowInstance.current = instance;
    setIsFlowReady(true);
  }, []);

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
        const workflow = data.workflow || { nodes: [], edges: [] };

        if (workflow.nodes?.length > 0) {
          setNodes(workflow.nodes);
        } else {
          setNodes(initialNodes);
        }

        setEdges(workflow.edges || []);
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

  useEffect(() => {
    if (!reactFlowInstance.current || !isFlowReady || nodes.length === 0)
      return;
    reactFlowInstance.current.fitView({ padding: 0.2 });
  }, [nodes, isFlowReady]);

  // Handle connections between nodes
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

  // Handle drop event on canvas
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");

      if (!type) {
        return;
      }

      if (reactFlowInstance.current) {
        const position = reactFlowInstance.current.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const newNode: Node = {
          id: `node-${Date.now()}`,
          type: "default",
          position,
          data: {
            label: `Node: ${type}`,
            nodeType: type,
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

  // Handle node click to select
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Handle canvas click to deselect
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Delete selected node
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

  // Duplicate selected node
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

  // Run workflow simulation
  const handleRunWorkflow = useCallback(async () => {
    if (nodes.length === 0) return;

    setIsRunning(true);
    // Simulate workflow execution
    for (let i = 0; i < nodes.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
    setIsRunning(false);
  }, [nodes]);

  // Clear all
  const handleClearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  // Save workflow
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
          nodes,
          edges,
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
  }, [edges, nodes, selectedRepoId]);

  return (
    <div className="flex h-full w-full gap-3 bg-gray-100 p-3">
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
        className="flex min-h-0 w-[50vw] bg-white rounded-2xl border border-gray-200 overflow-hidden  flex-col shadow-sm"
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
                style={{ width: "100%", height: "100%", border: "20px" }}
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
