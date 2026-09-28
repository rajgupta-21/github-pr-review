import { AlertCircle, Check } from "lucide-react";
import { memo } from "react";
import { Handle, type NodeProps, Position } from "reactflow";

import { cn } from "@/lib/utils";

import {
  CATEGORY_STYLE,
  getDefinition,
  nodeSummary,
  type WorkflowNodeData,
} from "../nodeCatalog";

type RunState = "idle" | "pending" | "running" | "completed" | "failed";

function runState(status: string | undefined): RunState {
  switch (status) {
    case "pending":
      return "pending";
    case "running":
      return "running";
    case "completed":
      return "completed";
    case "failed":
      return "failed";
    default:
      return "idle";
  }
}

/* Header strip + border per run state, as drawn in the design. */
const STATE_STYLE: Record<RunState, { card: string; strip: string; text: string }> = {
  idle: { card: "border-line", strip: "bg-surface-sunken border-line-soft", text: "text-fg-subtle" },
  pending: { card: "border-line", strip: "bg-surface-sunken border-line-soft", text: "text-fg-subtle" },
  running: { card: "border-violet-500 border-2", strip: "bg-violet-50 border-[#E2DAFB]", text: "text-violet-700" },
  completed: { card: "border-[#C9E4D6]", strip: "bg-[#F3FAF6] border-[#DCEBE3]", text: "text-pass" },
  failed: { card: "border-critical-line", strip: "bg-[#FDF4F5] border-critical-line", text: "text-critical" },
};

const handleClass =
  "!size-2.5 !border-2 !border-surface !bg-line-control hover:!bg-violet-500 transition-colors";

function WorkflowNodeCard({ data, selected }: NodeProps<WorkflowNodeData>) {
  const definition = getDefinition(data.nodeType);
  const category = definition?.category ?? "Action";
  const style = CATEGORY_STYLE[category];
  const Icon = definition?.icon;
  const state = runState(data.workflow?.status);
  const stateStyle = STATE_STYLE[state];

  const stripLabel =
    state === "running"
      ? "Running"
      : state === "completed"
        ? category === "Trigger"
          ? style.label
          : "Done"
        : state === "failed"
          ? "Failed"
          : state === "pending"
            ? `${style.label} · queued`
            : style.label;

  return (
    <div
      className={cn(
        "w-[192px] overflow-hidden rounded-lg border-[1.5px] bg-surface shadow-[0_2px_8px_rgba(20,18,42,0.06)] transition-shadow",
        stateStyle.card,
        selected &&
          "border-2 border-violet-500 shadow-[0_0_0_4px_rgba(91,54,232,0.14),0_4px_14px_rgba(20,18,42,0.1)]",
      )}
    >
      <Handle type="target" position={Position.Left} className={handleClass} />

      <div className={cn("flex items-center gap-[7px] border-b px-3 py-2", stateStyle.strip)}>
        <span
          className={cn(
            "font-mono text-[10.5px] tracking-[0.1em] uppercase",
            stateStyle.text,
          )}
        >
          {stripLabel}
        </span>
        {definition?.comingSoon ? (
          <span className="rounded-full bg-surface-hover px-1.5 font-mono text-[9.5px] text-fg-subtle uppercase">
            soon
          </span>
        ) : null}
        <div className="flex-1" />
        {state === "completed" ? (
          <Check className="size-[13px] text-pass-solid" strokeWidth={2.6} aria-hidden="true" />
        ) : state === "running" ? (
          <span className="size-2 animate-pulse rounded-full bg-violet-500" aria-hidden="true" />
        ) : state === "failed" ? (
          <AlertCircle className="size-[13px] text-critical-solid" aria-hidden="true" />
        ) : null}
      </div>

      <div className="flex items-center gap-2.5 p-3">
        {Icon ? (
          <Icon className={cn("size-[17px] shrink-0", style.icon)} strokeWidth={1.9} aria-hidden="true" />
        ) : null}
        <div className="min-w-0">
          <div className="truncate text-[13.5px] font-semibold text-fg">{data.label}</div>
          <div className="mt-0.5 truncate text-xs text-fg-subtle">{nodeSummary(data)}</div>
        </div>
      </div>

      {state === "running" ? (
        <div className="h-1 overflow-hidden bg-line-soft">
          <div className="h-full w-1/2 animate-pulse bg-violet-500" />
        </div>
      ) : null}

      <Handle type="source" position={Position.Right} className={handleClass} />
    </div>
  );
}

export default memo(WorkflowNodeCard);
