import type { Octokit } from "@octokit/rest";
import type { PRFile, ReviewResult, WorkflowContext } from "../types/workflow.types";
import { generatePRReview } from "../utils/genrateResponse";

export async function fetchPRContext(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
) {
  const pullRequest = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });

  const files = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber,
  });

  const prFiles: PRFile[] = files.data
    .filter((file) => file.patch)
    .map((file) => ({
      filename: file.filename,
      status: file.status,
      patch: file.patch,
    }));

  return {
    pr: {
      title: pullRequest.data.title,
      description: pullRequest.data.body,
      htmlUrl: pullRequest.data.html_url,
    },
    files: prFiles,
    status: {
      state: pullRequest.data.state as "open" | "closed",
      merged: pullRequest.data.merged ?? false,
      draft: pullRequest.data.draft ?? false,
      title: pullRequest.data.title,
      htmlUrl: pullRequest.data.html_url,
    },
  };
}

export async function fetchPRStatus(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
) {
  const pullRequest = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });

  return {
    state: pullRequest.data.state as "open" | "closed",
    merged: pullRequest.data.merged ?? false,
    draft: pullRequest.data.draft ?? false,
    title: pullRequest.data.title,
    htmlUrl: pullRequest.data.html_url,
  };
}

export async function ensurePRContext(ctx: WorkflowContext) {
  if (ctx.pr && ctx.files) return ctx;

  const { pr, files } = await fetchPRContext(
    ctx.octokit,
    ctx.owner,
    ctx.repo,
    ctx.prNumber,
  );

  ctx.pr = pr;
  ctx.files = files;
  return ctx;
}

export async function runAIReview(
  ctx: WorkflowContext,
  reviewContext?: string,
): Promise<ReviewResult> {
  await ensurePRContext(ctx);

  const reviewPayload = {
    title: ctx.pr!.title,
    description: ctx.pr!.description,
    files: ctx.files!,
  };

  const rawReview = await generatePRReview(reviewPayload, reviewContext);
  const review = JSON.parse(rawReview || "{}") as ReviewResult;
  ctx.review = review;
  return review;
}

export function formatReviewAsComment(review: ReviewResult): string {
  const findings =
    review.findings?.length > 0
      ? review.findings
          .map(
            (f) =>
              `- **${f.severity}** — \`${f.file}\`: ${f.issue}\n  - Reason: ${f.reason}\n  - Suggestion: ${f.suggestion}`,
          )
          .join("\n")
      : "_No findings_";

  const strengths =
    review.strengths?.length > 0
      ? review.strengths.map((s) => `- ${s}`).join("\n")
      : "_None noted_";

  return `## AI PR Review

**Summary:** ${review.summary}

| Metric | Score |
|--------|-------|
| Overall | ${review.overallScore}/10 |
| Security | ${review.securityScore}/10 |
| Performance | ${review.performanceScore}/10 |
| Quality | ${review.qualityScore}/10 |

**Recommendation:** ${review.recommendation}

### Findings
${findings}

### Strengths
${strengths}

---
_Automated review by PR Review Bot_`;
}
