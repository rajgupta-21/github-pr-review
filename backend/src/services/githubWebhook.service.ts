import crypto from "crypto";
import type { Octokit } from "@octokit/rest";
import { ConnectedRepo } from "../schema/ConnectedRepository.schema";

export function getWebhookSecret(): string {
  return process.env.GITHUB_WEBHOOK_SECRET || "dev-webhook-secret";
}

export function getWebhookUrl(): string | null {
  return process.env.GITHUB_WEBHOOK_URL || null;
}

export function verifyGitHubSignature(
  payload: Buffer,
  signatureHeader: string | undefined,
): boolean {
  if (!signatureHeader?.startsWith("sha256=")) return false;

  const secret = getWebhookSecret();
  const digest = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  const expected = `sha256=${digest}`;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader),
      Buffer.from(expected),
    );
  } catch {
    return false;
  }
}

export async function ensureRepoWebhook(params: {
  octokit: Octokit;
  owner: string;
  repo: string;
  repoDocId: string;
}): Promise<{ webhookActive: boolean; webhookId?: number }> {
  const webhookUrl = getWebhookUrl();
  if (!webhookUrl) {
    console.warn("GITHUB_WEBHOOK_URL not set — skipping webhook registration");
    return { webhookActive: false };
  }

  const { octokit, owner, repo, repoDocId } = params;
  const secret = getWebhookSecret();

  const connectedRepo = await ConnectedRepo.findById(repoDocId).lean();
  if (!connectedRepo) {
    throw new Error("Connected repository not found");
  }

  if (connectedRepo.webhookId) {
    try {
      await octokit.repos.updateWebhook({
        owner,
        repo,
        hook_id: connectedRepo.webhookId,
        config: {
          url: webhookUrl,
          content_type: "json",
          secret,
          insecure_ssl: webhookUrl.startsWith("http://") ? "1" : "0",
        },
        events: ["pull_request"],
        active: true,
      });

      await ConnectedRepo.updateOne(
        { _id: repoDocId },
        { webhookActive: true },
      );

      return { webhookActive: true, webhookId: connectedRepo.webhookId };
    } catch (error) {
      console.error("Failed to update webhook, creating a new one:", error);
    }
  }

  const hook = await octokit.repos.createWebhook({
    owner,
    repo,
    config: {
      url: webhookUrl,
      content_type: "json",
      secret,
      insecure_ssl: webhookUrl.startsWith("http://") ? "1" : "0",
    },
    events: ["pull_request"],
    active: true,
  });

  await ConnectedRepo.updateOne(
    { _id: repoDocId },
    {
      webhookActive: true,
      webhookId: hook.data.id,
    },
  );

  return { webhookActive: true, webhookId: hook.data.id };
}

export function mapGitHubPRActionToTrigger(action: string): string | null {
  switch (action) {
    case "opened":
    case "reopened":
      return "pr_opened";
    case "synchronize":
      return "pr_updated";
    default:
      return null;
  }
}
