import { Request, Response } from "express";
import { UserModel } from "../schema/user.schema";
import { getOctokit } from "../services/octokit.service";
import { runAIReview } from "../services/prContext.service";

export async function AiReviewForPR(req: Request, res: Response) {
  try {
    const { userId, owner, repoName, pr_Number, context } = req.body;

    if (!userId || !owner || !repoName || !pr_Number) {
      return res.status(400).json({
        message: "Missing credentials",
        action: "missing credentials",
      });
    }

    const getUser = await UserModel.findById(userId);

    if (!getUser) {
      return res.status(404).json({
        message: "User doesn't exist",
        action: "failure",
      });
    }

    const octokit = getOctokit(getUser.githubAccessToken!);

    if (!octokit) {
      return res.status(401).json({
        message: "Failed to authenticate GitHub",
        action: "failure",
      });
    }

    const pullNumber = Number(pr_Number);

    if (Number.isNaN(pullNumber)) {
      return res.status(400).json({
        message: "Invalid PR Number",
        action: "failure",
      });
    }

    const review = await runAIReview(
      {
        userId: String(userId),
        owner,
        repo: repoName,
        repoId: 0,
        prNumber: pullNumber,
        octokit,
      },
      context,
    );

    return res.status(200).json({
      message: "AI review generated successfully",
      action: "success",
      review,
    });
  } catch (error) {
    console.error("AI Review Error:", error);

    return res.status(500).json({
      message: "Something went wrong please try again",
      action: "server failure",
    });
  }
}
