"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { isApprove, scoreTextClass, toPercent } from "@/lib/review";
import type { ExecutionStep, ExecutionStepStatus, WorkflowExecutionResult } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEP_MARK: Record<ExecutionStepStatus, { mark: string; className: string }> = {
  pending: { mark: "·", className: "text-fg-faint" },
  running: { mark: "▸", className: "text-violet-700" },
  completed: { mark: "✓", className: "text-pass" },
  triggered: { mark: "✓", className: "text-pass" },
  failed: { mark: "✕", className: "text-critical" },
  skipped: { mark: "–", className: "text-fg-faint" },
};

const DOT: Record<string, string> = {
  running: "bg-violet-500 animate-pulse",
  completed: "bg-pass-solid",
  failed: "bg-critical-solid",
  skipped: "bg-medium-solid",
};

function formatElapsed(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

type ExecutionPanelProps = {
  isRunning: boolean;
  prNumber: number | null;
  startedAt: number | null;
  finishedAt: number | null;
  result: WorkflowExecutionResult | null;
  plannedSteps: ExecutionStep[];
  onClose: () => void;
};

/* Floating run toast in the canvas corner: progress, step log, review summary. */
export default function ExecutionPanel({
  isRunning,
  prNumber,
  startedAt,
  finishedAt,
  result,
  plannedSteps,
  onClose,
}: ExecutionPanelProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  const steps = result?.steps?.length ? result.steps : plannedSteps;
  const status = isRunning ? "running" : result?.status || "running";
  const done = steps.filter((step) => step.status !== "pending" && step.status !== "running").length;
  const progress = isRunning
    ? Math.max(8, Math.round((done / Math.max(steps.length, 1)) * 100))
    : 100;
  const elapsed = startedAt ? (finishedAt ?? now) - startedAt : 0;
  const review = result?.review;
  const score = toPercent(review?.overallScore);

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute right-5 bottom-5 z-10 w-[330px] max-w-[calc(100%-40px)] rounded-[13px] border border-line-strong bg-surface px-4 py-3.5 shadow-[0_6px_20px_rgba(20,18,42,0.1)]"
    >
      <div className="flex items-center gap-[9px]">
        <span className={cn("size-2 shrink-0 rounded-full", DOT[status] ?? DOT.running)} aria-hidden="true" />
        <span className="truncate text-[13.5px] font-semibold text-fg">
          {isRunning ? "Test run" : `Run ${status}`}
          {prNumber ? ` on PR #${prNumber}` : ""}
        </span>
        <div className="flex-1" />
        <span className="font-mono text-[12.5px] text-fg-subtle">{formatElapsed(elapsed)}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss run"
          className="-mr-1 rounded-sm p-1 text-fg-faint hover:bg-surface-hover hover:text-fg"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-[11px] h-1.5 overflow-hidden rounded-full bg-line-soft">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500",
            status === "failed" ? "bg-critical-solid" : status === "skipped" ? "bg-medium-solid" : status === "completed" ? "bg-pass-solid" : "bg-violet-500",
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {result?.prStatus ? (
        <div className="mt-2.5 flex items-center gap-2 text-xs text-fg-subtle">
          <span className="truncate">{result.prStatus.title}</span>
          <Badge
            size="sm"
            tone={result.prStatus.merged ? "violet" : result.prStatus.state === "closed" ? "neutral" : "pass"}
            className="ml-auto"
          >
            {result.prStatus.merged
              ? "Merged"
              : result.prStatus.state === "closed"
                ? "Closed"
                : result.prStatus.draft
                  ? "Draft"
                  : "Open"}
          </Badge>
        </div>
      ) : null}

      <div className="mt-[11px] max-h-40 overflow-y-auto font-mono text-[11.5px] leading-5 text-[#6B6880]">
        {steps.length === 0 ? <div>No steps queued</div> : null}
        {steps.map((step) => {
          const mark = STEP_MARK[step.status] ?? STEP_MARK.pending;
          return (
            <div key={step.nodeId}>
              <span className={mark.className}>{mark.mark}</span> {step.function.split(".").pop()}
              {step.message ? <span className="text-fg-faint"> → {step.message}</span> : null}
              {step.error ? <span className="text-critical"> → {step.error}</span> : null}
            </div>
          );
        })}
      </div>

      {result?.message ? (
        <p className="mt-2.5 rounded-sm border border-critical-line bg-[#FDF4F5] px-3 py-2 text-xs text-[#7D1428]">
          {result.message}
        </p>
      ) : null}

      {review && !isRunning ? (
        <div className="mt-3 border-t border-line-soft pt-3">
          <p className="line-clamp-3 text-[12.5px] leading-normal text-fg-2">{review.summary}</p>
          <div className="mt-2 flex items-center gap-3 text-xs">
            <span className="text-fg-subtle">
              Score{" "}
              <span className={cn("font-display text-[15px] font-bold", scoreTextClass(score))}>
                {score ?? "—"}
              </span>
            </span>
            <span className="text-fg-subtle">
              {review.findings?.length ?? 0} finding{review.findings?.length === 1 ? "" : "s"}
            </span>
            <Badge size="sm" tone={isApprove(review) ? "pass" : "high"} className="ml-auto">
              {review.recommendation}
            </Badge>
          </div>
        </div>
      ) : null}
    </div>
  );
}
