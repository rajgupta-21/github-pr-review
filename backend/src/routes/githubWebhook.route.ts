import { Router } from "express";
import { ConnectedRepo } from "../schema/ConnectedRepository.schema";
import {
  mapGitHubPRActionToTrigger,
  verifyGitHubSignature,
} from "../services/githubWebhook.service";
import { executeWorkflow } from "../services/workflowExecutor.service";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const payload = req.body as Buffer;
    const signature = req.headers["x-hub-signature-256"] as string | undefined;
    const event = req.headers["x-github-event"] as string | undefined;

    if (!verifyGitHubSignature(payload, signature)) {
      return res.status(401).json({ message: "Invalid webhook signature" });
    }

    const data = JSON.parse(payload.toString());

    if (event !== "pull_request") {
      return res.status(200).json({ message: "Event ignored" });
    }

    const trigger = mapGitHubPRActionToTrigger(data.action);
    if (!trigger) {
      return res
        .status(200)
        .json({ message: `PR action '${data.action}' ignored` });
    }

    const repoId = data.repository?.id;
    const prNumber = data.pull_request?.number;

    if (!repoId || !prNumber) {
      return res.status(400).json({ message: "Invalid pull_request payload" });
    }

    const connectedRepos = await ConnectedRepo.find({
      repoId,
      webhookActive: true,
      connected: true,
    }).lean();

    const results = [];

    for (const connectedRepo of connectedRepos) {
      const hasWorkflow = (connectedRepo.workflow?.nodes?.length || 0) > 0;

      if (!hasWorkflow) continue;

      try {
        const result = await executeWorkflow({
          connectedRepo: connectedRepo as Parameters<
            typeof executeWorkflow
          >[0]["connectedRepo"],
          trigger,
          prNumber,
        });

        results.push({
          userId: connectedRepo.userId,
          connectedRepoId: connectedRepo.repoId,
          status: result.status,
          trigger: result.trigger,
          prNumber: result.prNumber,
          steps: result.steps,
        });

        console.log(
          `[Workflow] ${connectedRepo.fullName}#${prNumber} (${trigger}): ${result.status}`,
        );
      } catch (error) {
        console.error(
          `[Workflow] Failed for repo ${connectedRepo.repoId}:`,
          error,
        );
        results.push({
          userId: connectedRepo.userId,
          repoId: connectedRepo.repoId,
          status: "failed",
          error: error instanceof Error ? error.message : "Execution failed",
        });
      }
    }

    return res.status(200).json({
      message: "Webhook processed",
      executions: results.length,
      results,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({ message: "Webhook processing failed" });
  }
});

export default router;
