"use client";

import { Play, RotateCcw, Save } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { BaseNode } from "./CustomNodes";
import Inspector from "./Inspector";
import NodeSidebar from "./NodeSidebar";

const nodeTypes = {
  default: BaseNode,
};

const initialNodes: Node[] = [
  {
    id: "1",
    data: { label: "Start: PR Opened", nodeType: "pr_opened" },
    position: { x: 250, y: 100 },
    type: "default",
  },
];

const initialEdges: Edge[] = [];

export default function Canvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<any>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const onInit = useCallback((instance: any) => {
    reactFlowInstance.current = instance;
  }, []);
  const [isRunning, setIsRunning] = useState(false);

  // Handle connections between nodes
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
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

  // Save workflow (placeholder)
  const handleSave = useCallback(() => {
    const workflowData = {
      nodes,
      edges,
    };
    console.log("Saving workflow:", workflowData);
  }, [nodes, edges]);

  return (
    <div className="flex h-full w-full gap-3 bg-gray-100 p-3">
      {/* Left Sidebar */}
      <NodeSidebar />

      {/* Main Canvas */}
      <div
        ref={reactFlowWrapper}
        className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col shadow-sm"
      >
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
            <MiniMap />
          </ReactFlow>
        </div>
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
