"use client";

import { Copy, Trash2, X } from "lucide-react";
import { Node } from "reactflow";

interface InspectorProps {
  selectedNode: Node | null;
  onDeleteNode: () => void;
  onClose: () => void;
  onDuplicateNode: () => void;
}

const nodeConfigs: Record<
  string,
  {
    label: string;
    fields: Array<{ name: string; label: string; type: string }>;
  }
> = {
  pr_opened: {
    label: "PR Opened",
    fields: [
      { name: "repository", label: "Repository", type: "text" },
      { name: "branch", label: "Target Branch", type: "text" },
    ],
  },
  pr_updated: {
    label: "PR Updated",
    fields: [{ name: "repository", label: "Repository", type: "text" }],
  },
  manual: {
    label: "Manual Trigger",
    fields: [],
  },
  cron: {
    label: "Scheduled Trigger",
    fields: [{ name: "schedule", label: "Schedule (cron)", type: "text" }],
  },
  code_review: {
    label: "Code Review",
    fields: [
      { name: "model", label: "AI Model", type: "select" },
      { name: "focusAreas", label: "Focus Areas", type: "text" },
    ],
  },
  security: {
    label: "Security Scan",
    fields: [{ name: "severity", label: "Min Severity", type: "select" }],
  },
  performance: {
    label: "Performance Review",
    fields: [{ name: "threshold", label: "Threshold (%)", type: "number" }],
  },
  comment: {
    label: "Post Comment",
    fields: [
      { name: "template", label: "Comment Style", type: "select" },
      { name: "collapse", label: "Collapse if clean?", type: "checkbox" },
    ],
  },
  approve: {
    label: "Approve PR",
    fields: [{ name: "condition", label: "Approve if", type: "text" }],
  },
  slack: {
    label: "Slack Notify",
    fields: [
      { name: "channel", label: "Channel", type: "text" },
      { name: "mention", label: "Mention Author?", type: "checkbox" },
    ],
  },
};

export default function Inspector({
  selectedNode,
  onDeleteNode,
  onClose,
  onDuplicateNode,
}: InspectorProps) {
  if (!selectedNode) {
    return (
      <div className="w-72 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden flex-shrink-0 h-full">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="font-semibold text-sm text-gray-900">Inspector</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-xs text-gray-400 text-center">
            Select a node on the canvas to inspect its properties
          </p>
        </div>
      </div>
    );
  }

  const nodeType = (selectedNode.data as any)?.nodeType || "pr_opened";
  const config = nodeConfigs[nodeType];

  return (
    <div className="w-72 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden flex-shrink-0 h-full shadow-lg">
      <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-sm text-gray-900">
            {config?.label || "Node"}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">ID: {selectedNode.id}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Node Position */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
            Position
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-xs text-gray-500">X</p>
              <p className="font-mono text-xs text-gray-900">
                {Math.round(selectedNode.position.x)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-xs text-gray-500">Y</p>
              <p className="font-mono text-xs text-gray-900">
                {Math.round(selectedNode.position.y)}
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Fields */}
        {config && config.fields.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
              Configuration
            </label>
            <div className="space-y-2">
              {config.fields.map((field) => (
                <div key={field.name}>
                  <label className="text-xs font-medium text-gray-700 block mb-1">
                    {field.label}
                  </label>
                  {field.type === "select" ? (
                    <select className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-900 focus:outline-none focus:border-purple-400">
                      <option>Select option</option>
                    </select>
                  ) : field.type === "checkbox" ? (
                    <input
                      type="checkbox"
                      defaultChecked={false}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  ) : (
                    <input
                      type={field.type}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-purple-400"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-3 space-y-2">
        <button
          onClick={onDuplicateNode}
          className="w-full flex items-center justify-center gap-2 text-xs text-purple-600 border border-purple-200 py-2 rounded-lg hover:bg-purple-50 transition-colors"
        >
          <Copy size={14} />
          Duplicate
        </button>
        <button
          onClick={onDeleteNode}
          className="w-full flex items-center justify-center gap-2 text-xs text-red-600 border border-red-200 py-2 rounded-lg hover:bg-red-50 transition-colors"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </div>
  );
}
