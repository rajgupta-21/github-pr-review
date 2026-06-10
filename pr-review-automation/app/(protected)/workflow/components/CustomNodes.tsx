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
  const nodeType =
    (data as any)?.nodeType || (data as any)?.label?.toLowerCase() || "default";
  const style = nodeStyles[nodeType] || nodeStyles.pr_opened;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border-2 ${style.bg} ${style.borderColor} shadow-xl transition transform hover:-translate-y-0.5 hover:shadow-2xl cursor-pointer bg-white min-w-[220px]`}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: "#7c3aed",
          borderRadius: 9999,
          width: 12,
          height: 12,
          top: -6,
        }}
      />

      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white shadow-sm"
            aria-hidden="true"
          >
            {style.icon}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">
              {data.label}
            </div>
            <div className="mt-1 inline-flex rounded-full bg-white/90 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">
              {nodeType.replace(/_/g, " ")}
            </div>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: "#7c3aed",
          borderRadius: 9999,
          width: 12,
          height: 12,
          bottom: -6,
        }}
      />
    </div>
  );
}
