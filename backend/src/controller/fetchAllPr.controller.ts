import { Request, Response } from "express";
import { ConnectedRepo } from "../schema/ConnectedRepository.schema";
import { PrModel } from "../schema/Pr.schema";
import { UserModel } from "../schema/user.schema";
import { getOctokit } from "../services/octokit.service";

export async function FetchAllUserPr(req: Request, res: Response) {
  try {
    const { userName, repoName, userId } = req.params;

    if (!userName || !repoName || !userId) {
      return res.status(400).json({
        message: "Missing required parameters: userName, repoName, userId",
        action: "Missing Fields",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user?.githubAccessToken) {
      return res.status(401).json({
        message: "GitHub account not connected. Please login first",
        action: "login required",
      });
    }

    const octokit = getOctokit(user.githubAccessToken);
    if (!octokit) {
      return res.status(401).json({
        message: "Failed to authenticate with GitHub",
        action: "auth failed",
      });
    }

    // Fetch all PRs from GitHub
    const allPrsResponse = await octokit.rest.pulls.list({
      owner: userName,
      repo: repoName,
      state: "all",
      per_page: 100,
    });

    if (!allPrsResponse || !allPrsResponse.data) {
      return res.status(404).json({
        message: "Could not fetch PRs from GitHub",
        action: "fetch failed",
      });
    }

    // Find the connected repository to get repoId
    const connectedRepo = await ConnectedRepo.findOne({
      userId,
      owner: userName,
      name: repoName,
    });

    if (!connectedRepo) {
      return res.status(404).json({
        message: "Repository not connected. Please connect it first",
        action: "repo not connected",
      });
    }

    // Store each PR in database
    const storedPrs = [];
    const errors = [];

    for (const githubPr of allPrsResponse.data) {
      try {
        const prData = {
          repoId: connectedRepo._id,
          githubPrId: githubPr.id,
          githubPrNumber: githubPr.number,
          title: githubPr.title,
          body: githubPr.body,
          state: githubPr.state,
          merged: githubPr.merged,
          draft: githubPr.draft,
          author: {
            login: githubPr.user?.login,
            id: githubPr.user?.id,
            avatarUrl: githubPr.user?.avatar_url,
          },
          sourceBranch: githubPr.head?.ref,
          targetBranch: githubPr.base?.ref,
          headSha: githubPr.head?.sha,
          baseSha: githubPr.base?.sha,
          githubUrl: githubPr.html_url,
          diffUrl: githubPr.diff_url,
          patchUrl: githubPr.patch_url,
          commits: githubPr.commits,
          additions: githubPr.additions,
          deletions: githubPr.deletions,
          changedFiles: githubPr.changed_files,
          createdAtGithub: githubPr.created_at,
          updatedAtGithub: githubPr.updated_at,
          closedAtGithub: githubPr.closed_at,
          mergedAtGithub: githubPr.merged_at,
        };

        // Upsert PR (update if exists, create if not)
        const savedPr = await PrModel.findOneAndUpdate(
          {
            repoId: connectedRepo._id,
            githubPrNumber: githubPr.number,
          },
          prData,
          { upsert: true, returnDocument: "after" },
        );

        storedPrs.push(savedPr);
      } catch (error) {
        errors.push({
          prNumber: githubPr.number,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    res.status(200).json({
      message: `Successfully fetched and stored ${storedPrs.length} PRs`,
      totalPrs: allPrsResponse.data.length,
      storedCount: storedPrs.length,
      prs: storedPrs,
      errors: errors.length > 0 ? errors : undefined,
      action: "success",
    });
  } catch (error) {
    console.error("FetchAllUserPr error:", error);
    return res.status(500).json({
      message: "Something went wrong. Please try again",
      action: "server failure",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
}
