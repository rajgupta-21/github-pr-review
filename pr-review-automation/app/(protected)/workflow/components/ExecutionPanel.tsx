"use client";

import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Loader2,
  MinusCircle,
  X,
} from "lucide-react";

export type ExecutionStepStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "skipped"
  | "triggered";

export type ExecutionStep = {
  nodeId: string;
  name: string;
  function: string;
  status: ExecutionStepStatus;
  message?: string;
  error?: string;
};

export type PRStatusInfo = {
  state: "open" | "closed";
  merged: boolean;
  draft: boolean;
  title: string;
  htmlUrl: string;
};

export type ExecutionResult = {
  status: "completed" | "failed" | "skipped";
  prNumber: number;
  message?: string;
  steps: ExecutionStep[];
  prStatus?: PRStatusInfo;
  review?: {
    summary: string;
    overallScore: number;
    recommendation: string;
    findings?: Array<{ severity: string; file: string; issue: string }>;
  };
};

const STEP_STATUS_STYLES: Record<
  ExecutionStepStatus,
  { dot: string; text: string; label: string }
> = {
  pending: {
    dot: "bg-gray-300",
    text: "text-gray-500",
    label: "Pending",
  },
  running: {
    dot: "bg-purple-500 animate-pulse",
    text: "text-purple-700",
    label: "Running",
  },
  completed: {
    dot: "bg-green-500",
    text: "text-green-700",
    label: "Done",
  },
  failed: {
    dot: "bg-red-500",
    text: "text-red-700",
    label: "Failed",
  },
  skipped: {
    dot: "bg-gray-300",
    text: "text-gray-400",
    label: "Skipped",
  },
  triggered: {
    dot: "bg-purple-400",
    text: "text-purple-700",
    label: "Triggered",
  },
};

const OVERALL_STATUS_STYLES = {
  completed: "bg-green-50 text-green-800 border-green-200",
  failed: "bg-red-50 text-red-800 border-red-200",
  skipped: "bg-yellow-50 text-yellow-800 border-yellow-200",
  running: "bg-purple-50 text-purple-800 border-purple-200",
};

function getPRBadge(pr?: PRStatusInfo) {
  if (!pr) return null;

  if (pr.merged) {
    return { label: "Merged", className: "bg-purple-100 text-purple-700" };
  }
  if (pr.state === "closed") {
    return { label: "Closed", className: "bg-gray-200 text-gray-700" };
  }
  if (pr.draft) {
    return { label: "Draft", className: "bg-yellow-100 text-yellow-800" };
  }
  return { label: "Open", className: "bg-green-100 text-green-700" };
}

function StepIcon({ status }: { status: ExecutionStepStatus }) {
  if (status === "running") {
    return <Loader2 size={14} className="text-purple-600 animate-spin" />;
  }
  if (status === "completed") {
    return <CheckCircle2 size={14} className="text-green-600" />;
  }
  if (status === "failed") {
    return <AlertCircle size={14} className="text-red-600" />;
  }
  if (status === "skipped") {
    return <MinusCircle size={14} className="text-gray-400" />;
  }
  if (status === "triggered") {
    return <CheckCircle2 size={14} className="text-purple-600" />;
  }
  return <Circle size={14} className="text-gray-300" />;
}

type ExecutionPanelProps = {
  isOpen: boolean;
  isRunning: boolean;
  result: ExecutionResult | null;
  plannedSteps: ExecutionStep[];
  onClose: () => void;
};

export default function ExecutionPanel({
  isOpen,
  isRunning,
  result,
  plannedSteps,
  onClose,
}: ExecutionPanelProps) {
  if (!isOpen) return null;

  const steps = result?.steps?.length ? result.steps : plannedSteps;
  const overallStatus = isRunning
    ? "running"
    : result?.status || "running";
  const prBadge = getPRBadge(result?.prStatus);
  const prTitle = result?.prStatus?.title;
  const prNumber = result?.prNumber;

  return (
    <div className="w-80 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden shrink-0 h-full shadow-sm">
      <div className="border-b border-gray-200 px-4 py-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-semibold text-sm text-gray-900">
            Workflow Run
          </h2>
          {prNumber ? (
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              PR #{prNumber}
              {prTitle ? ` · ${prTitle}` : ""}
            </p>
          ) : null}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Overall + PR status */}
        <div className="space-y-2">
          <div
            className={`rounded-xl border px-3 py-2 text-xs font-medium capitalize ${OVERALL_STATUS_STYLES[overallStatus as keyof typeof OVERALL_STATUS_STYLES] || OVERALL_STATUS_STYLES.running}`}
          >
            {isRunning
              ? "Executing workflow…"
              : `Workflow ${overallStatus}`}
          </div>

          {prBadge ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                PR status
              </span>
              <span
                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${prBadge.className}`}
              >
                {prBadge.label}
              </span>
            </div>
          ) : null}

          {result?.message ? (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {result.message}
            </p>
          ) : null}
        </div>

        {/* Steps */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
            Steps
          </label>
          <div className="space-y-2">
            {steps.length === 0 ? (
              <p className="text-xs text-gray-400">No steps queued</p>
            ) : (
              steps.map((step) => {
                const style = STEP_STATUS_STYLES[step.status];
                return (
                  <div
                    key={step.nodeId}
                    className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5"
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        <StepIcon status={step.status} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {step.name}
                          </p>
                          <span
                            className={`text-[10px] font-semibold uppercase shrink-0 ${style.text}`}
                          >
                            {style.label}
                          </span>
                        </div>
                        {step.message ? (
                          <p className="text-[10px] text-gray-500 mt-1">
                            {step.message}
                          </p>
                        ) : null}
                        {step.error ? (
                          <p className="text-[10px] text-red-600 mt-1">
                            {step.error}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Minimal review summary */}
        {result?.review && !isRunning ? (
          <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-purple-600">
              Review summary
            </p>
            <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
              {result.review.summary}
            </p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">
                Score:{" "}
                <span className="font-semibold text-gray-900">
                  {result.review.overallScore}/10
                </span>
              </span>
              <span
                className={`font-medium ${
                  result.review.recommendation
                    ?.toLowerCase()
                    .includes("approve")
                    ? "text-green-700"
                    : "text-yellow-700"
                }`}
              >
                {result.review.recommendation}
              </span>
            </div>
            {result.review.findings && result.review.findings.length > 0 ? (
              <p className="text-[10px] text-gray-500">
                {result.review.findings.length} finding
                {result.review.findings.length === 1 ? "" : "s"} reported
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
