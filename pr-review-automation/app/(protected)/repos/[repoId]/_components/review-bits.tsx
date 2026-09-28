import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { isApprove, scoreBarClass, scoreTextClass, severityTone, toPercent } from "@/lib/review";
import type { ReviewFinding, ReviewResult } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Ink tile holding the sparkle — the "this came from Mergegate" mark. */
export function BotMark({ size = 30, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[9px] bg-[#2A2054] text-violet-300",
        className,
      )}
    >
      <Sparkles style={{ width: size * 0.5, height: size * 0.5 }} strokeWidth={2} />
    </span>
  );
}

export function RecommendationBadge({
  review,
  size = "lg",
}: {
  review: ReviewResult;
  size?: "md" | "lg";
}) {
  const approve = isApprove(review);
  return (
    <Badge tone={approve ? "pass" : "high"} size={size}>
      {approve ? "Approve" : "Changes requested"}
    </Badge>
  );
}

const RING_STROKE = { pass: "#0F6B48", high: "#C2700E", critical: "#C02A42", none: "#E5E3DD" };

export function ScoreRing({ score, size = 86 }: { score: number | null; size?: number }) {
  const r = size / 2 - 7;
  const circumference = 2 * Math.PI * r;
  const tone =
    score === null ? "none" : score >= 85 ? "pass" : score >= 60 ? "high" : "critical";
  const offset = circumference * (1 - (score ?? 0) / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F0EEE9" strokeWidth={10} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={RING_STROKE[tone]}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

export function ScoreBar({ label, score }: { label: string; score: number | null }) {
  return (
    <div>
      <div className="flex justify-between text-[13px] text-fg-3">
        <span>{label}</span>
        <span className={cn("font-mono", scoreTextClass(score))}>{score ?? "—"}</span>
      </div>
      <div className="mt-[5px] h-1.5 overflow-hidden rounded-full bg-surface-hover">
        <div
          className={cn("h-full rounded-full", scoreBarClass(score))}
          style={{ width: `${score ?? 0}%` }}
        />
      </div>
    </div>
  );
}

export function reviewScores(review: ReviewResult) {
  return {
    overall: toPercent(review.overallScore),
    security: toPercent(review.securityScore),
    performance: toPercent(review.performanceScore),
    quality: toPercent(review.qualityScore),
  };
}

export const SEVERITY_DOT: Record<string, string> = {
  critical: "bg-critical-solid",
  high: "bg-high-solid",
  medium: "bg-medium-solid",
  low: "bg-low-solid",
};

/** Does a finding's `file` refer to this changed file? Models sometimes return basenames. */
export function findingMatchesFile(finding: ReviewFinding, filename: string) {
  const f = (finding.file || "").trim().replace(/^\.?\//, "").replace(/:\d+$/, "");
  if (!f) return false;
  return f === filename || filename.endsWith(`/${f}`) || f.endsWith(`/${filename}`);
}

/** Highest severity tone among findings, or null. */
export function worstTone(findings: ReviewFinding[]) {
  const order = ["critical", "high", "medium", "low"] as const;
  const tones = new Set(findings.map((f) => severityTone(f.severity)));
  return order.find((t) => tones.has(t)) ?? null;
}

export function formatDuration(ms?: number) {
  if (ms === undefined) return null;
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  return s < 60 ? `${s.toFixed(1)}s` : `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
}
