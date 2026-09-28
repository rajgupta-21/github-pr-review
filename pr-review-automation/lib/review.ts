import type { ReviewFinding, ReviewResult, Severity } from "./types";

export const SEVERITIES: Severity[] = ["Critical", "High", "Medium", "Low"];

export type SeverityTone = "critical" | "high" | "medium" | "low";

export function severityTone(severity: string | undefined): SeverityTone {
  switch ((severity || "").toLowerCase()) {
    case "critical":
      return "critical";
    case "high":
      return "high";
    case "medium":
      return "medium";
    default:
      return "low";
  }
}

export function severityRank(severity: string | undefined) {
  return SEVERITIES.findIndex((s) => s.toLowerCase() === (severity || "").toLowerCase());
}

export function sortFindings(findings: ReviewFinding[] = []) {
  return [...findings].sort((a, b) => {
    const ra = severityRank(a.severity);
    const rb = severityRank(b.severity);
    return (ra === -1 ? 99 : ra) - (rb === -1 ? 99 : rb);
  });
}

export function countBySeverity(findings: ReviewFinding[] = []) {
  const counts: Record<SeverityTone, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const finding of findings) counts[severityTone(finding.severity)] += 1;
  return counts;
}

/**
 * The model returns scores on a 0–10 scale; the design shows 0–100.
 * Anything already above 10 is treated as a percentage.
 */
export function toPercent(score: number | undefined | null): number | null {
  if (score === undefined || score === null || Number.isNaN(Number(score))) return null;
  const value = Number(score);
  return Math.round(value <= 10 ? value * 10 : value);
}

/** Text colour class for a 0–100 score: ≥85 pass, ≥60 high/amber, else critical. */
export function scoreTextClass(percent: number | null) {
  if (percent === null) return "text-fg-subtle";
  if (percent >= 85) return "text-pass";
  if (percent >= 60) return "text-high";
  return "text-critical";
}

export function scoreBarClass(percent: number | null) {
  if (percent === null) return "bg-line";
  if (percent >= 85) return "bg-pass-solid";
  if (percent >= 60) return "bg-high-solid";
  return "bg-critical-solid";
}

/** The merge gate holds when the review has any Critical or High finding. */
export function gateHeld(review: ReviewResult | null | undefined) {
  if (!review) return false;
  const counts = countBySeverity(review.findings);
  return counts.critical > 0 || counts.high > 0;
}

export function isApprove(review: ReviewResult | null | undefined) {
  return (review?.recommendation || "").toLowerCase().includes("approve");
}

/*
  Reviews are not persisted by the backend yet (POST /pr/ai-review just returns
  the result), so the last review per PR is kept in sessionStorage. This lets
  the PR screen and the report screen share one run instead of paying twice.
*/
const cacheKey = (repoId: number | string, prNumber: number | string) =>
  `mergegate:review:${repoId}:${prNumber}`;

export interface CachedReview {
  review: ReviewResult;
  ranAt: string;
  durationMs?: number;
}

export function readCachedReview(repoId: number | string, prNumber: number | string) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(cacheKey(repoId, prNumber));
    return raw ? (JSON.parse(raw) as CachedReview) : null;
  } catch {
    return null;
  }
}

export function writeCachedReview(
  repoId: number | string,
  prNumber: number | string,
  entry: CachedReview,
) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(cacheKey(repoId, prNumber), JSON.stringify(entry));
  } catch {
    // storage full or blocked — the review still shows for this page view
  }
}
