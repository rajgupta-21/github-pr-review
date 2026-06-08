import { Request, Response } from "express";
import { UserModel } from "../schema/user.schema";
import { getOctokit } from "../services/octokit.service";

export async function FetchAllUserPr(req: Request, res: Response) {
  try {
    const { userName, repoName, userId } = req.params;
    if (!userName || !repoName || !userId) {
      return res
        .status(400)
        .json({ message: "credentials missing", action: "Missing Fields" });
    }
    const user = await UserModel.findById(userId);

    if (!user?.githubAccessToken) {
      return res.status(401).json({
        message: "GitHub account not connected",
      });
    }
    const octokit = getOctokit(user.githubAccessToken);
    const allPrs = await octokit.rest.pulls.list({
      owner: userName,
      repo: repoName,
      state: "all",
    });
    if (!allPrs) {
      return res
        .status(400)
        .json({ message: "coudnt fetch Pr", action: "Try Again" });
    }
    res.status(200).json({
      message: "successfully fetched Prs",
      allPrs: allPrs.data,
      action: "success",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "something went wrong", action: "server failure" });
  }
}
