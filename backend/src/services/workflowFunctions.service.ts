import type { WorkflowContext } from "../types/workflow.types";
import {
  ensurePRContext,
  formatReviewAsComment,
  runAIReview,
} from "./prContext.service";

type WorkflowHandler = (
  ctx: WorkflowContext,
  node: { id: string; data?: Record<string, unknown> },
) => Promise<string | void>;

function getNodeConfig(node: { data?: Record<string, unknown> }) {
  return (node.data?.config as Record<string, unknown> | undefined) || {};
}

function getReviewContext(
  node: { data?: Record<string, unknown> },
  defaultContext: string,
): string | undefined {
  const custom = getNodeConfig(node).focusInstructions;
  if (typeof custom === "string" && custom.trim()) {
    return `${defaultContext}\n\nAdditional instructions:\n${custom.trim()}`;
  }
  return defaultContext;
}

const TRIGGER_HANDLERS: WorkflowHandler = async () => {
  // Triggers are entry points — no side effects
};

const workflowHandlers: Record<string, WorkflowHandler> = {
  "github.pullRequestOpened": TRIGGER_HANDLERS,
  "github.pullRequestUpdated": TRIGGER_HANDLERS,
  "workflow.manualTrigger": TRIGGER_HANDLERS,
  "workflow.scheduled": TRIGGER_HANDLERS,

  "ai.reviewPullRequest": async (ctx, node) => {
    await runAIReview(
      ctx,
      getReviewContext(
        node,
        "Review for bugs, security, performance, code quality, and maintainability.",
      ),
    );
    return "AI code review completed";
  },

  "ai.securityScan": async (ctx, node) => {
    await runAIReview(
      ctx,
      getReviewContext(
        node,
        "Focus exclusively on security vulnerabilities, unsafe patterns, injection risks, auth issues, and secrets exposure.",
      ),
    );
    return "Security scan completed";
  },

  "ai.performanceReview": async (ctx, node) => {
    await runAIReview(
      ctx,
      getReviewContext(
        node,
        "Focus exclusively on performance issues, inefficient algorithms, memory usage, and scalability concerns.",
      ),
    );
    return "Performance review completed";
  },

  "github.commentPullRequest": async (ctx, node) => {
    await ensurePRContext(ctx);

    if (!ctx.review) {
      await runAIReview(ctx);
    }

    const body = formatReviewAsComment(ctx.review!);
    await ctx.octokit.rest.issues.createComment({
      owner: ctx.owner,
      repo: ctx.repo,
      issue_number: ctx.prNumber,
      body,
    });

    return "Posted review comment on PR";
  },

  "github.approvePullRequest": async (ctx, node) => {
    await ensurePRContext(ctx);

    const onlyIfRecommended = getNodeConfig(node).onlyIfRecommended !== false;
    const recommendation = ctx.review?.recommendation?.toLowerCase() || "";

    if (onlyIfRecommended && recommendation.includes("request")) {
      return "Skipped approval — review recommends changes";
    }

    await ctx.octokit.rest.pulls.createReview({
      owner: ctx.owner,
      repo: ctx.repo,
      pull_number: ctx.prNumber,
      event: "APPROVE",
      body: ctx.review
        ? `AI review recommendation: ${ctx.review.recommendation}\n\n${ctx.review.summary}`
        : "Approved by workflow automation",
    });

    return "PR approved";
  },

  "notification.slack": async (ctx, node) => {
    const config = getNodeConfig(node);
    const channel =
      typeof config.channel === "string" ? config.channel : "#pr-reviews";
    const summary = ctx.review?.summary || `PR #${ctx.prNumber} workflow ran`;
    console.log(
      `[Slack stub] ${channel} ${ctx.owner}/${ctx.repo}#${ctx.prNumber}: ${summary}`,
    );
    return `Slack notification logged for ${channel}`;
  },
};

export async function executeWorkflowFunction(
  fn: string,
  ctx: WorkflowContext,
  node: { id: string; data?: Record<string, unknown> },
): Promise<string | void> {
  const handler = workflowHandlers[fn];

  if (!handler) {
    throw new Error(`Unknown workflow function: ${fn}`);
  }

  return handler(ctx, node);
}

export function isExecutableFunction(fn: string): boolean {
  return fn !== "workflow.unknown" && fn in workflowHandlers;
}
