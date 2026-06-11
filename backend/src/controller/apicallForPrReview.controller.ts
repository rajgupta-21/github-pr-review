import { Request, Response } from "express";
import { UserModel } from "../schema/user.schema";
import { getOctokit } from "../services/octokit.service";
import { generatePRReview } from "../utils/genrateResponse";

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

    const octokit = getOctokit(getUser.githubAccessToken);

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

    const pullRequest = await octokit.rest.pulls.get({
      owner,
      repo: repoName,
      pull_number: pullNumber,
    });

    const files = await octokit.rest.pulls.listFiles({
      owner,
      repo: repoName,
      pull_number: pullNumber,
    });

    const reviewPayload = {
      title: pullRequest.data.title,
      description: pullRequest.data.body,

      files: files.data
        .filter((file) => file.patch)
        .map((file) => ({
          filename: file.filename,
          status: file.status,
          patch: file.patch,
        })),
    };

    const aiReview = await generatePRReview(reviewPayload, context);

    return res.status(200).json({
      message: "AI review generated successfully",
      action: "success",
      review: JSON.parse(aiReview || "{}"),
    });
  } catch (error) {
    console.error("AI Review Error:", error);

    return res.status(500).json({
      message: "Something went wrong please try again",
      action: "server failure",
    });
  }
}
