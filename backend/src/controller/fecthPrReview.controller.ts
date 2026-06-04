import { Request, Response } from "express";

export async function fectchPrOfRepo(req: Request, res: Response) {
  try {
    const { userName, repoName } = req.body;
    if (!userName || !repoName) {
      return res.status(400).json({
        message: "username and repository name are required",
        action: "failure",
      });
    }
    const response = await fetch(
      `https://api.github.com/repos/${userName}/${repoName}/pulls`,
      {
        method: "GET",
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
    if (!response.ok) {
      return res
        .status(400)
        .json({ message: "couldnt fetch PR", action: "failure" });
    }
    const data = await response.json();

    return res
      .status(200)
      .json({ message: "Successfully fetched PR", data, action: "success" });
  } catch (error) {
    return res.status(500).json({
      message: "something went wrong please try again",
      action: "server failure",
    });
  }
}
