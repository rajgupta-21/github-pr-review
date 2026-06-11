import { Request, Response } from "express";
import { ConnectedRepo } from "../schema/ConnectedRepository.schema";
import { PrModel } from "../schema/Pr.schema";
import { UserModel } from "../schema/user.schema";
import { getOctokit } from "../services/octokit.service";

export async function FetchPrByNo(req: Request, res: Response) {
  try {
    const { prNumber, userId, owner, repo } = req.params;

    if (!prNumber || !userId || !owner || !repo) {
      return res.status(400).json({
        message: "Missing required parameters: prNumber, userId, owner, repo",
        action: "credentials missing",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        action: "user not found",
      });
    }

    const octokit = getOctokit(user.githubAccessToken);
    if (!octokit) {
      return res.status(401).json({
        message: "GitHub authentication failed. Please login again",
        action: "login required",
      });
    }

    // Fetch PR from GitHub API
    const PullRequest = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });

    if (!PullRequest) {
      return res.status(404).json({
        message: "PR not found on GitHub",
        action: "failure",
      });
    }

    const githubPr = PullRequest.data;

    // Find the connected repository to get repoId
    const connectedRepo = await ConnectedRepo.findOne({
      userId,
      owner,
      name: repo,
    });

    if (!connectedRepo) {
      return res.status(404).json({
        message: "Repository not connected. Please connect it first",
        action: "repo not connected",
      });
    }

    const existingPr = await PrModel.findOne({
      repoId: connectedRepo._id,
      githubPrNumber: prNumber,
    });

    // Map GitHub PR response to schema fields
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

    let savedPr;
    if (existingPr) {
      savedPr = await PrModel.findByIdAndUpdate(existingPr._id, prData, {
        returnDocument: "after",
      });
      return res.status(200).json({
        message: "PR updated successfully",
        pr: savedPr,
        action: "updated",
      });
    } else {
      savedPr = await PrModel.create(prData);
      return res.status(201).json({
        message: "PR created and stored successfully",
        pr: savedPr,
        action: "created",
      });
    }
  } catch (error) {
    console.error("FetchPrByNo error:", error);
    res.status(500).json({
      message: "Something went wrong. Please try again",
      action: "server failure",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
}
