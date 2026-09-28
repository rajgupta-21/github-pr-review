"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/feedback";
import { FindingCard } from "@/components/ui/finding-card";
import { Label, Textarea } from "@/components/ui/input";
import { timeAgo } from "@/lib/format";
import type { CachedReview } from "@/lib/review";
import { sortFindings } from "@/lib/review";

import {
  BotMark,
  formatDuration,
  RecommendationBadge,
  reviewScores,
  ScoreBar,
  ScoreRing,
} from "./review-bits";

/** Optional reviewer focus + the run button; shared by the PR rail and report empty state. */
export function RunReviewForm({
  running,
  onRun,
  label = "Run AI review",
  compact = false,
}: {
  running: boolean;
  onRun: (context?: string) => void;
  label?: string;
  compact?: boolean;
}) {
  const [context, setContext] = useState("");
  const id = compact ? "review-focus-compact" : "review-focus";
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onRun(context.trim() || undefined);
      }}
    >
      <div>
        <Label htmlFor={id}>Review focus (optional)</Label>
        <Textarea
          id={id}
          rows={compact ? 2 : 3}
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g. Check the auth middleware and error handling"
          className="text-[13.5px]"
        />
      </div>
      <Button type="submit" variant="primary" loading={running} className="w-full">
        {running ? "Reviewing the diff…" : label}
      </Button>
    </form>
  );
}

export function ReviewRail({
  entry,
  running,
  error,
  onRun,
  reportHref,
}: {
  entry: CachedReview | null;
  running: boolean;
  error: string | null;
  onRun: (context?: string) => void;
  reportHref: string;
}) {
  const [showRerun, setShowRerun] = useState(false);
  const review = entry?.review;

  return (
    <aside className="flex w-full shrink-0 flex-col gap-3.5 lg:w-[320px]">
      <div className="rounded-[14px] border border-line bg-surface p-[18px]">
        <div className="flex items-center gap-2.5">
          <BotMark />
          <div>
            <div className="text-[14.5px] font-semibold text-fg">AI review</div>
            <div className="text-[12.5px] text-fg-subtle">
              {running
                ? "Running now…"
                : entry
                  ? `Finished ${timeAgo(entry.ranAt)}${
                      entry.durationMs ? ` · took ${formatDuration(entry.durationMs)}` : ""
                    }`
                  : "Not run on this pull request yet"}
            </div>
          </div>
        </div>

        {error ? <ErrorBanner className="mt-4">{error}</ErrorBanner> : null}

        {review ? (
          <>
            <ReviewScores review={review} />
            <Button asChild variant="tertiary" className="mt-[18px] w-full font-semibold">
              <Link href={reportHref}>Open the full report</Link>
            </Button>
            {showRerun ? (
              <div className="mt-4 border-t border-line-soft pt-4">
                <RunReviewForm running={running} onRun={onRun} label="Re-run review" />
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full"
                onClick={() => setShowRerun(true)}
              >
                Re-run with a different focus
              </Button>
            )}
          </>
        ) : (
          <div className="mt-4">
            <p className="mb-4 text-[13.5px] leading-relaxed text-fg-muted">
              Mergegate reads every changed file and scores the pull request for security,
              performance and quality.
            </p>
            <RunReviewForm running={running} onRun={onRun} />
          </div>
        )}
      </div>

      {review && review.findings?.length ? (
        <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line-soft px-4 py-3.5">
            <span className="text-[13.5px] font-semibold text-fg">Top findings</span>
            <Link href={reportHref} className="text-[13px]">
              All {review.findings.length}
            </Link>
          </div>
          <div className="flex flex-col gap-2.5 p-3">
            {sortFindings(review.findings)
              .slice(0, 3)
              .map((finding, index) => (
                <FindingCard key={index} finding={finding} compact />
              ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}

function ReviewScores({ review }: { review: CachedReview["review"] }) {
  const scores = reviewScores(review);
  return (
    <>
      <div className="mt-[18px] flex items-center gap-4">
        <ScoreRing score={scores.overall} />
        <div>
          <div className="font-display text-[34px] font-bold tracking-[-0.03em] text-fg">
            {scores.overall ?? "—"}
          </div>
          <div className="text-[13px] text-fg-muted">Overall score</div>
          <div className="mt-[7px]">
            <RecommendationBadge review={review} size="md" />
          </div>
        </div>
      </div>
      <div className="mt-[18px] flex flex-col gap-[11px]">
        <ScoreBar label="Security" score={scores.security} />
        <ScoreBar label="Performance" score={scores.performance} />
        <ScoreBar label="Quality" score={scores.quality} />
      </div>
    </>
  );
}
