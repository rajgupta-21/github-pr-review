import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import { ConnectedRepo } from "../schema/ConnectedRepository.schema";
import { getOctokit } from "../services/octokit.service";
import { ensureRepoWebhook } from "../services/githubWebhook.service";
import {
  executeWorkflow,
  workflowHasPREventTriggers,
} from "../services/workflowExecutor.service";
import {
  normalizeNodeType,
  nodeTypeToFunction,
} from "../utils/workflowNodeMapping";

const router = Router();

function deriveWorkflowDefinition(nodes: any[]) {
  return {
    name: "AI PR Automation Workflow",
    status: "active" as const,
    steps: nodes.map((node) => ({
      id: node.id,
      name: node.data?.label || "Step",
      type: normalizeNodeType(node.data?.nodeType),
      function:
        node.data?.workflow?.function ||
        nodeTypeToFunction(normalizeNodeType(node.data?.nodeType)),
      status: node.data?.workflow?.status || "ready",
    })),
  };
}

function remapNodeTypes(nodes: any[]) {
  return nodes.map((node: any) => ({
    ...node,
    type:
      node.data?.nodeType === "pr_opened" ||
      node.data?.nodeType === "pr_updated" ||
      node.data?.nodeType === "manual_trigger" ||
      node.data?.nodeType === "scheduled"
        ? "githubWebhook"
        : node.data?.nodeType === "code_review"
          ? "aiReview"
          : node.data?.nodeType === "security_scan"
            ? "securityScan"
            : "action",
  }));
}

router.get("/workflow", authMiddleware, async (req: any, res) => {
  try {
    const rawRepoId = req.query.repoId;
    const repoId = rawRepoId !== undefined ? Number(rawRepoId) : NaN;

    if (rawRepoId === undefined || Number.isNaN(repoId)) {
      return res.status(400).json({
        message:
          "repoId query parameter is required and must be a valid number",
      });
    }

    const connectedRepo = await ConnectedRepo.findOne({
      userId: req.user._id,
      repoId,
    })
      .select("workflow webhookActive")
      .lean();

    if (!connectedRepo) {
      return res.status(404).json({ message: "Workflow repo not found" });
    }

    const workflow = connectedRepo.workflow ?? {
      nodes: [],
      edges: [],
    };

    const updatedNodes = remapNodeTypes(workflow.nodes || []);

    res.status(200).json({
      workflow: {
        nodes: updatedNodes,
        edges: workflow.edges || [],
        definition: "definition" in workflow ? workflow.definition : undefined,
      },
      webhookActive: connectedRepo.webhookActive,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load workflow" });
  }
});

router.post("/workflow", authMiddleware, async (req: any, res) => {
  try {
    const { repoId, nodes, edges, workflow: clientDefinition } = req.body;
    const parsedRepoId = repoId !== undefined ? Number(repoId) : NaN;

    if (
      repoId === undefined ||
      Number.isNaN(parsedRepoId) ||
      !Array.isArray(nodes) ||
      !Array.isArray(edges)
    ) {
      return res.status(400).json({
        message:
          "repoId, nodes and edges are required and repoId must be a valid number",
      });
    }

    const definition =
      clientDefinition || deriveWorkflowDefinition(nodes);

    const connectedRepo = await ConnectedRepo.findOneAndUpdate(
      { userId: req.user._id, repoId: parsedRepoId },
      {
        workflow: {
          nodes,
          edges,
          definition,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after", runValidators: true },
    )
      .select("repoId name fullName owner workflow webhookActive webhookId")
      .lean();

    if (!connectedRepo) {
      return res.status(404).json({
        message: "Connected repository not found for this user",
      });
    }

    let webhookStatus = { webhookActive: connectedRepo.webhookActive };

    if (
      workflowHasPREventTriggers(nodes) &&
      req.user?.githubAccessToken
    ) {
      try {
        const octokit = getOctokit(req.user.githubAccessToken);
        webhookStatus = await ensureRepoWebhook({
          octokit,
          owner: connectedRepo.owner,
          repo: connectedRepo.name,
          repoDocId: String(connectedRepo._id),
        });
      } catch (webhookError) {
        console.error("Webhook registration failed:", webhookError);
      }
    }

    res.status(200).json({
      workflow: connectedRepo.workflow,
      webhookActive: webhookStatus.webhookActive,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save workflow" });
  }
});

router.post("/workflow/execute", authMiddleware, async (req: any, res) => {
  try {
    const {
      repoId,
      prNumber,
      trigger = "manual_trigger",
      nodes: clientNodes,
      edges: clientEdges,
    } = req.body;
    const parsedRepoId = repoId !== undefined ? Number(repoId) : NaN;
    const parsedPrNumber = prNumber !== undefined ? Number(prNumber) : NaN;

    if (
      Number.isNaN(parsedRepoId) ||
      Number.isNaN(parsedPrNumber) ||
      parsedPrNumber < 1
    ) {
      return res.status(400).json({
        message: "repoId and a valid prNumber are required",
      });
    }

    const connectedRepo = await ConnectedRepo.findOne({
      userId: req.user._id,
      repoId: parsedRepoId,
    }).lean();

    if (!connectedRepo) {
      return res.status(404).json({
        message: "Connected repository not found for this user",
      });
    }

    const repoForExecution = {
      ...connectedRepo,
      workflow: {
        ...(connectedRepo.workflow || {}),
        nodes:
          Array.isArray(clientNodes) && clientNodes.length > 0
            ? clientNodes
            : connectedRepo.workflow?.nodes || [],
        edges: Array.isArray(clientEdges)
          ? clientEdges
          : connectedRepo.workflow?.edges || [],
      },
    };

    const result = await executeWorkflow({
      connectedRepo: repoForExecution as Parameters<typeof executeWorkflow>[0]["connectedRepo"],
      trigger,
      prNumber: parsedPrNumber,
    });

    return res.status(200).json({
      message: "Workflow executed",
      result,
    });
  } catch (error) {
    console.error("Workflow execution error:", error);
    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "Workflow execution failed",
    });
  }
});

router.post("/workflow/webhook/enable", authMiddleware, async (req: any, res) => {
  try {
    const { repoId } = req.body;
    const parsedRepoId = repoId !== undefined ? Number(repoId) : NaN;

    if (Number.isNaN(parsedRepoId)) {
      return res.status(400).json({ message: "repoId is required" });
    }

    const connectedRepo = await ConnectedRepo.findOne({
      userId: req.user._id,
      repoId: parsedRepoId,
    }).lean();

    if (!connectedRepo) {
      return res.status(404).json({ message: "Repository not found" });
    }

    if (!req.user?.githubAccessToken) {
      return res.status(401).json({ message: "GitHub not connected" });
    }

    const octokit = getOctokit(req.user.githubAccessToken);
    const webhookStatus = await ensureRepoWebhook({
      octokit,
      owner: connectedRepo.owner,
      repo: connectedRepo.name,
      repoDocId: String(connectedRepo._id),
    });

    return res.status(200).json({
      message: "Webhook enabled",
      ...webhookStatus,
    });
  } catch (error) {
    console.error("Enable webhook error:", error);
    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to enable webhook",
    });
  }
});

export default router;
