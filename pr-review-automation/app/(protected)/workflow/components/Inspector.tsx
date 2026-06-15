"use client";

import { Copy, Trash2, X } from "lucide-react";
import { Node } from "reactflow";

type NodeConfig = Record<string, string | number | boolean>;

type WorkflowNodeData = {
  label?: string;
  nodeType?: string;
  event?: string;
  action?: string;
  repoName?: string;
  config?: NodeConfig;
  workflow?: {
    function?: string;
    status?: string;
  };
};

interface InspectorProps {
  selectedNode: Node | null;
  onDeleteNode: () => void;
  onClose: () => void;
  onDuplicateNode: () => void;
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNodeData>) => void;
}

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

type FieldConfig = {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "checkbox" | "textarea";
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  helperText?: string;
};

type NodeConfigDefinition = {
  label: string;
  category: "Trigger" | "AI Review" | "Action";
  description: string;
  fields: FieldConfig[];
};

const nodeConfigs: Record<string, NodeConfigDefinition> = {
  pr_opened: {
    label: "PR Opened",
    category: "Trigger",
    description:
      "Starts the workflow when a pull request is opened on the connected repository.",
    fields: [
      {
        name: "targetBranch",
        label: "Target branch filter",
        type: "text",
        placeholder: "e.g. main (leave empty for any)",
        helperText: "Optional — only run when the PR targets this branch.",
      },
    ],
  },
  pr_updated: {
    label: "PR Updated",
    category: "Trigger",
    description:
      "Starts the workflow when new commits are pushed to an open pull request.",
    fields: [],
  },
  manual_trigger: {
    label: "Manual Trigger",
    category: "Trigger",
    description:
      "Starts the workflow when you click Run in the builder (requires a PR number).",
    fields: [],
  },
  scheduled: {
    label: "Scheduled",
    category: "Trigger",
    description: "Runs on a cron schedule. Scheduler integration is coming soon.",
    fields: [
      {
        name: "cron",
        label: "Cron expression",
        type: "text",
        placeholder: "0 9 * * 1-5",
        helperText: "Standard cron syntax (not yet executed automatically).",
      },
    ],
  },
  code_review: {
    label: "AI Code Review",
    category: "AI Review",
    description:
      "Fetches PR diffs and runs an AI review using your connected Groq model.",
    fields: [
      {
        name: "model",
        label: "AI model",
        type: "select",
        options: [
          { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (default)" },
        ],
      },
      {
        name: "focusInstructions",
        label: "Review focus",
        type: "textarea",
        placeholder: "e.g. Check error handling and API design",
        helperText: "Optional extra instructions passed to the AI reviewer.",
      },
    ],
  },
  security_scan: {
    label: "Security Scan",
    category: "AI Review",
    description:
      "Runs an AI review focused on security vulnerabilities and unsafe patterns.",
    fields: [
      {
        name: "minSeverity",
        label: "Report from severity",
        type: "select",
        options: [
          { value: "low", label: "Low and above" },
          { value: "medium", label: "Medium and above" },
          { value: "high", label: "High and above" },
          { value: "critical", label: "Critical only" },
        ],
      },
      {
        name: "focusInstructions",
        label: "Additional focus",
        type: "textarea",
        placeholder: "e.g. Check auth middleware and input validation",
      },
    ],
  },
  performance_review: {
    label: "Performance Review",
    category: "AI Review",
    description:
      "Runs an AI review focused on performance, memory, and scalability.",
    fields: [
      {
        name: "focusInstructions",
        label: "Performance focus",
        type: "textarea",
        placeholder: "e.g. Database queries and N+1 patterns",
      },
    ],
  },
  post_comment: {
    label: "Post Comment",
    category: "Action",
    description:
      "Posts the AI review as a comment on the pull request. Runs a review first if none exists.",
    fields: [
      {
        name: "includeFindings",
        label: "Include detailed findings",
        type: "checkbox",
      },
      {
        name: "includeScores",
        label: "Include score table",
        type: "checkbox",
      },
    ],
  },
  approve_pr: {
    label: "Approve PR",
    category: "Action",
    description:
      "Approves the pull request on GitHub. Skips approval if the review recommends changes.",
    fields: [
      {
        name: "onlyIfRecommended",
        label: "Only approve when review says Approve",
        type: "checkbox",
      },
    ],
  },
  slack_notify: {
    label: "Slack Notify",
    category: "Action",
    description:
      "Sends a Slack notification with the review summary (requires SLACK_WEBHOOK_URL).",
    fields: [
      {
        name: "channel",
        label: "Channel",
        type: "text",
        placeholder: "#pr-reviews",
      },
      {
        name: "mentionAuthor",
        label: "Mention PR author",
        type: "checkbox",
      },
    ],
  },
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-yellow-50 text-yellow-700 border-yellow-200",
  ready: "bg-gray-50 text-gray-700 border-gray-200",
  pending: "bg-gray-50 text-gray-500 border-gray-200",
  running: "bg-purple-50 text-purple-700 border-purple-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

const DEFAULT_CONFIG: Record<string, NodeConfig> = {
  code_review: { model: "llama-3.3-70b-versatile", focusInstructions: "" },
  security_scan: { minSeverity: "high", focusInstructions: "" },
  performance_review: { focusInstructions: "" },
  scheduled: { cron: "" },
  pr_opened: { targetBranch: "" },
  post_comment: { includeFindings: true, includeScores: true },
  approve_pr: { onlyIfRecommended: true },
  slack_notify: { channel: "#pr-reviews", mentionAuthor: false },
};

function getConfigValue(
  config: NodeConfig | undefined,
  field: FieldConfig,
  nodeType: string,
): string | number | boolean {
  const defaults = DEFAULT_CONFIG[nodeType] || {};
  const value = config?.[field.name] ?? defaults[field.name];

  if (field.type === "checkbox") {
    return Boolean(value);
  }

  if (field.type === "number") {
    return typeof value === "number" ? value : Number(value) || 0;
  }

  return typeof value === "string" ? value : String(value ?? "");
}

export default function Inspector({
  selectedNode,
  onDeleteNode,
  onClose,
  onDuplicateNode,
  onUpdateNode,
}: InspectorProps) {
  if (!selectedNode) {
    return (
      <div className="w-72 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden flex-shrink-0 h-full">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="font-semibold text-sm text-gray-900">Inspector</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-xs text-gray-400 text-center">
            Select a node on the canvas to inspect and configure it
          </p>
        </div>
      </div>
    );
  }

  const data = selectedNode.data as WorkflowNodeData;
  const nodeType = normalizeNodeType(data.nodeType || "");
  const config = nodeConfigs[nodeType];
  const workflowFn = data.workflow?.function || "workflow.unknown";
  const workflowStatus = data.workflow?.status || "ready";

  const updateConfig = (name: string, value: string | number | boolean) => {
    onUpdateNode(selectedNode.id, {
      config: {
        ...(data.config || {}),
        [name]: value,
      },
    });
  };

  const updateLabel = (label: string) => {
    onUpdateNode(selectedNode.id, { label });
  };

  return (
    <div className="w-72 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden flex-shrink-0 h-full shadow-lg">
      <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-purple-600">
            {config?.category || "Node"}
          </p>
          <h2 className="font-semibold text-sm text-gray-900">
            {config?.label || data.label || "Node"}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5 font-mono truncate max-w-[180px]">
            {selectedNode.id}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {config?.description ? (
          <p className="text-xs text-gray-500 leading-relaxed">
            {config.description}
          </p>
        ) : null}

        {/* Execution metadata */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
            Execution
          </label>
          <div className="space-y-2">
            <div className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-[10px] text-gray-500 uppercase">Function</p>
              <p className="font-mono text-xs text-gray-900 break-all">
                {workflowFn}
              </p>
            </div>
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2.5">
              <p className="text-[10px] text-gray-500 uppercase">Status</p>
              <span
                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                  STATUS_STYLES[workflowStatus] || STATUS_STYLES.ready
                }`}
              >
                {workflowStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Display label */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
            Display label
          </label>
          <input
            type="text"
            value={data.label || ""}
            onChange={(e) => updateLabel(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-purple-400"
          />
        </div>

        {/* Position (read-only) */}
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

        {/* Node-specific configuration */}
        {config && config.fields.length > 0 ? (
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
              Configuration
            </label>
            <div className="space-y-3">
              {config.fields.map((field) => (
                <div key={field.name}>
                  <label className="text-xs font-medium text-gray-700 block mb-1">
                    {field.label}
                  </label>

                  {field.type === "select" ? (
                    <select
                      value={String(
                        getConfigValue(data.config, field, nodeType),
                      )}
                      onChange={(e) => updateConfig(field.name, e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-900 focus:outline-none focus:border-purple-400"
                    >
                      {(field.options || []).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "checkbox" ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(
                          getConfigValue(data.config, field, nodeType),
                        )}
                        onChange={(e) =>
                          updateConfig(field.name, e.target.checked)
                        }
                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs text-gray-600">Enabled</span>
                    </label>
                  ) : field.type === "textarea" ? (
                    <textarea
                      value={String(
                        getConfigValue(data.config, field, nodeType),
                      )}
                      onChange={(e) => updateConfig(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-purple-400 resize-none"
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={String(
                        getConfigValue(data.config, field, nodeType),
                      )}
                      onChange={(e) =>
                        updateConfig(
                          field.name,
                          field.type === "number"
                            ? Number(e.target.value)
                            : e.target.value,
                        )
                      }
                      placeholder={field.placeholder}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-purple-400"
                    />
                  )}

                  {field.helperText ? (
                    <p className="text-[10px] text-gray-400 mt-1">
                      {field.helperText}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {!config ? (
          <div className="rounded-lg border border-dashed border-gray-200 p-3">
            <p className="text-xs text-gray-500">
              Unknown node type:{" "}
              <span className="font-mono">{nodeType || "unset"}</span>
            </p>
          </div>
        ) : null}
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
