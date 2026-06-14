import ActionNode from "./actionNode";
import AiReviewNode from "./aiReviewNode";
import GithubWebhookNode from "./githubWebhookNode";
import SecurityNode from "./securityScanNode";

export const nodeTypes = {
  // triggers
  githubWebhook: GithubWebhookNode,

  // AI nodes
  aiReview: AiReviewNode,
  //security scan
  securityScan: SecurityNode,

  // actions
  action: ActionNode,
};
