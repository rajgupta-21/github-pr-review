import { Request, Response } from "express";
import { UserModel } from "../schema/user.schema";
import { getOctokit } from "../services/octokit.service";
export async function FetchPrByNo(req: Request, res: Response) {
  try {
    const { prNumber, userId, owner, repo } = req.params;
    if (!prNumber || !userId || !owner || !repo) {
      return res.status(400).json({
        message: "missing credentials",
        action: "credentials missing",
      });
    }
    const user = UserModel.findById(userId);
    const octokit = getOctokit(user.githubAccessToken);
    if (!octokit) {
      return res
        .status(404)
        .json({ message: "Login first", action: "login required" });
    }
    const PullRequest = await octokit.rest.pulls.get({
      owner: owner,
      repo: repo,
      pull_number: prNumber,
    });

    if (!PullRequest) {
      return res
        .status(400)
        .json({ message: "no pr found ", action: "failure" });
    }
    const pr = PullRequest.data;

    return res
      .status(200)
      .json({ message: "found PR", pr, action: "successfull" });
  } catch (error) {
    res.status(500).json({
      message: "somthing went worng please try again",
      action: "server failure",
    });
  }
}
