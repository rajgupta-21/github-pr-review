"use client";

import {
  AlertTriangle,
  Bolt,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Code2,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

type Severity = "Critical" | "High" | "Medium" | "Low";

interface Finding {
  issue: string;
  file: string;
  severity: Severity;
  reason: string;
  suggestion: string;
}

interface Review {
  summary: string;
  recommendation: "Approve" | "Request Changes";
  securityScore: number;
  performanceScore: number;
  qualityScore: number;
  overallScore: number;
  findings: Finding[];
  strengths: string[];
}

// ---------------------------------------------------------------------------
// Severity config — one place to change colors / labels
// ---------------------------------------------------------------------------

const SEVERITY_STYLES: Record<
  Severity,
  {
    badge: string;
    icon: string;
    dot: string;
  }
> = {
  Critical: {
    badge: "bg-red-100 text-red-700",
    icon: "text-red-600",
    dot: "bg-red-500",
  },

  High: {
    badge: "bg-orange-100 text-orange-700",
    icon: "text-orange-600",
    dot: "bg-orange-400",
  },

  Medium: {
    badge: "bg-yellow-100 text-yellow-700",
    icon: "text-yellow-700",
    dot: "bg-yellow-400",
  },

  Low: {
    badge: "bg-blue-100 text-blue-700",
    icon: "text-blue-600",
    dot: "bg-blue-400",
  },
};
// Score gets a color based on its value (out of 10)
function scoreColor(value: number) {
  if (value >= 8) return "text-green-600";
  if (value >= 5) return "text-yellow-600";
  return "text-red-500";
}

function scoreBarColor(value: number) {
  if (value >= 8) return "bg-green-500";
  if (value >= 5) return "bg-yellow-400";
  return "bg-red-400";
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ScoreCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <div className="flex items-center gap-2 text-gray-400 text-xs">
        {icon}
        {title}
      </div>
      <div className={`text-2xl font-semibold mt-2 ${scoreColor(value)}`}>
        {value}
        <span className="text-sm text-gray-400 font-normal">/10</span>
      </div>
      <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${scoreBarColor(value)}`}
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Finding card — collapses/expands suggestion
// ---------------------------------------------------------------------------

function FindingCard({ item }: { item: Finding }) {
  const [open, setOpen] = useState(false);
  const styles = SEVERITY_STYLES[item.severity];

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex items-start gap-3">
          {/* Icon chip */}
          <div className={`p-1.5 rounded-lg ${styles.icon}`}>
            <AlertTriangle size={14} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{item.issue}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.file}</p>
          </div>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${styles.badge}`}
        >
          {item.severity}
        </span>
      </div>

      {/* Reason */}
      <div className="border-t border-gray-100 px-4 py-3">
        <p className="text-xs text-gray-500 leading-relaxed">{item.reason}</p>
      </div>

      {/* Toggle suggestion */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 text-xs text-gray-500 hover:text-gray-700 w-full text-left"
      >
        <Lightbulb size={13} />
        Suggestion
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {open && (
        <div className="mx-4 mb-4 bg-gray-50 rounded-lg p-3 text-xs text-gray-600 leading-relaxed">
          {item.suggestion}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

const FILTERS: Array<Severity | "All"> = [
  "All",
  "Critical",
  "High",
  "Medium",
  "Low",
];

export default function AIReviewPanel({ review }: { review: Review }) {
  const [activeFilter, setActiveFilter] = useState<Severity | "All">("All");

  const filtered =
    activeFilter === "All"
      ? review.findings
      : review.findings.filter((f) => f.severity === activeFilter);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-gray-800">
              <Code2 size={16} />
              <h1 className="text-base font-semibold">AI code review</h1>
            </div>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed max-w-lg">
              {review.summary}
            </p>
          </div>
          <span
            className={`text-xs font-medium px-3 py-1.5 rounded-full shrink-0 ${
              review.recommendation === "Approve"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {review.recommendation}
          </span>
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ScoreCard
          title="Security"
          value={review.securityScore}
          icon={<ShieldCheck size={13} />}
        />
        <ScoreCard
          title="Performance"
          value={review.performanceScore}
          icon={<Bolt size={13} />}
        />
        <ScoreCard
          title="Quality"
          value={review.qualityScore}
          icon={<Code2 size={13} />}
        />
        <ScoreCard
          title="Overall"
          value={review.overallScore}
          icon={<CheckCircle size={13} />}
        />
      </div>

      {/* Findings */}
      <div className="">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-800">Findings</h2>
          <span className="text-xs text-gray-400">
            {review.findings.length} issues
          </span>
        </div>

        {/* Severity filter pills */}
        <div className="flex gap-2 flex-wrap mb-3 mt-3">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                activeFilter === f
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map((item, i) => (
            <FindingCard key={i} item={item} />
          ))}
        </div>
      </div>

      {/* Strengths */}
      <div className="bg-green-50 border border-green-100 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle size={15} className="text-green-600" />
          <h2 className="text-sm font-semibold text-green-800">Strengths</h2>
        </div>
        <div className="space-y-1.5">
          {review.strengths.map((s, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-xs text-green-700"
            >
              <span className="mt-1.5 w-1 h-1 rounded-full bg-green-500 shrink-0" />
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
