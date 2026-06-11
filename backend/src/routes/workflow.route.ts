import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import { ConnectedRepo } from "../schema/ConnectedRepository.schema";

const router = Router();

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
      .select("workflow")
      .lean();

    if (!connectedRepo) {
      return res.status(404).json({ message: "Workflow repo not found" });
    }

    res.status(200).json({
      workflow: connectedRepo.workflow || { nodes: [], edges: [] },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load workflow" });
  }
});

router.post("/workflow", authMiddleware, async (req: any, res) => {
  try {
    const { repoId, nodes, edges } = req.body;
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

    const connectedRepo = await ConnectedRepo.findOneAndUpdate(
      { userId: req.user._id, repoId: parsedRepoId },
      {
        workflow: {
          nodes,
          edges,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after", runValidators: true },
    )
      .select("repoId name fullName workflow")
      .lean();

    if (!connectedRepo) {
      return res.status(404).json({
        message: "Connected repository not found for this user",
      });
    }

    res.status(200).json({ workflow: connectedRepo.workflow });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save workflow" });
  }
});

export default router;
