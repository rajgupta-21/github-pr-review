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
import { Handle, Position } from "reactflow";

interface CustomNodeProps {
  data: {
    label: string;
  };
  isConnecting?: boolean;
  xPos?: number;
  yPos?: number;
}

const nodeStyles: Record<
  string,
  { bg: string; icon: React.ReactNode; borderColor: string }
> = {
  pr_opened: {
    bg: "bg-blue-50",
    icon: <GitPullRequest size={18} className="text-blue-600" />,
    borderColor: "border-blue-300",
  },
  pr_updated: {
    bg: "bg-blue-50",
    icon: <RefreshCw size={18} className="text-blue-600" />,
    borderColor: "border-blue-300",
  },
  manual: {
    bg: "bg-blue-50",
    icon: <Play size={18} className="text-blue-600" />,
    borderColor: "border-blue-300",
  },
  cron: {
    bg: "bg-blue-50",
    icon: <Clock size={18} className="text-blue-600" />,
    borderColor: "border-blue-300",
  },
  code_review: {
    bg: "bg-purple-50",
    icon: <Bot size={18} className="text-purple-600" />,
    borderColor: "border-purple-300",
  },
  security: {
    bg: "bg-purple-50",
    icon: <Shield size={18} className="text-purple-600" />,
    borderColor: "border-purple-300",
  },
  performance: {
    bg: "bg-purple-50",
    icon: <Zap size={18} className="text-purple-600" />,
    borderColor: "border-purple-300",
  },
  comment: {
    bg: "bg-green-50",
    icon: <MessageSquare size={18} className="text-green-600" />,
    borderColor: "border-green-300",
  },
  approve: {
    bg: "bg-green-50",
    icon: <CheckCircle2 size={18} className="text-green-600" />,
    borderColor: "border-green-300",
  },
  slack: {
    bg: "bg-green-50",
    icon: <Bell size={18} className="text-green-600" />,
    borderColor: "border-green-300",
  },
};

export function TriggerNode(props: CustomNodeProps) {
  return <BaseNode {...props} />;
}

export function AINode(props: CustomNodeProps) {
  return <BaseNode {...props} />;
}

export function ActionNode(props: CustomNodeProps) {
  return <BaseNode {...props} />;
}

export function BaseNode({ data, isConnecting, xPos, yPos }: CustomNodeProps) {
  // Extract node type from data or use a default
  const nodeType =
    (data as any)?.nodeType || (data as any)?.label?.toLowerCase() || "default";
  const style = nodeStyles[nodeType] || nodeStyles.pr_opened;

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 ${style.bg} ${style.borderColor} shadow-md hover:shadow-lg transition-all cursor-pointer bg-white`}
    >
      <Handle type="target" position={Position.Top} />

      <div className="flex items-center gap-2">
        <div className="flex-shrink-0">{style.icon}</div>
        <div>
          <div className="font-medium text-sm text-gray-900">{data.label}</div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
