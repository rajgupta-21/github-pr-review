"use client";

import {
  Bell,
  Bot,
  CheckCircle2,
  Clock,
  GitPullRequest,
  MessageSquare,
  Play,
  RefreshCw,
  Shield,
  Zap,
} from "lucide-react";

const nodes = [
  {
    category: "Triggers",
    items: [
      { type: "pr_opened", label: "PR Opened", icon: GitPullRequest },
      { type: "pr_updated", label: "PR Updated", icon: RefreshCw },
      { type: "manual_trigger", label: "Manual Trigger", icon: Play },
      { type: "scheduled", label: "Scheduled", icon: Clock },
    ],
  },
  {
    category: "AI Review",
    items: [
      { type: "code_review", label: "Code Review", icon: Bot },
      { type: "security_scan", label: "Security Scan", icon: Shield },
      { type: "performance_review", label: "Performance Review", icon: Zap },
    ],
  },
  {
    category: "Actions",
    items: [
      { type: "post_comment", label: "Post Comment", icon: MessageSquare },
      { type: "approve_pr", label: "Approve PR", icon: CheckCircle2 },
      { type: "slack_notify", label: "Slack Notify", icon: Bell },
    ],
  },
];

export default function NodeSidebar() {
  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string,
  ) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/reactflow", nodeType);
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden flex-shrink-0 h-full">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="font-semibold text-sm text-gray-900">Workflow Nodes</h2>
        <p className="text-xs text-gray-500 mt-1">Drag to canvas</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {nodes.map((section) => (
          <div key={section.category}>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {section.category}
            </h3>
            <div className="space-y-2">
              {section.items.map((node) => {
                const IconComponent = node.icon;
                return (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, node.type)}
                    className="p-3 border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 cursor-grab active:cursor-grabbing transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                        <IconComponent size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-900">
                          {node.label}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
