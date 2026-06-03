import { Request, Response } from "express";
import { ConnectedRepo } from "../schema/ConnectedRepository.schema";

export async function ConnectRepo(req: Request, res: Response) {
  try {
    const { repoId, owner, fullName } = req.body;

    const userId = req.user?._id;
    if (!userId || !repoId || !owner || !fullName) {
      return res.status(400).json({
        message: "Missing required fields",
        action: "failure",
      });
    }

    const alreadyConnected = await ConnectedRepo.findOne({
      userId,
      repoId,
    });

    if (alreadyConnected) {
      return res.status(409).json({
        message: "Repository already connected",
        action: "failure",
      });
    }
    const response = await fetch(`https://api.github.com/repos/${fullName}`, {
      headers: {
        Authorization: `Bearer ${req.user?.githubAccessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    const repos = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: repos.message || "Failed to fetch repository data from GitHub",
        action: "failure",
      });
    }

    const connectedRepo = await ConnectedRepo.create({
      userId,

      repoId: repos.id,
      owner: repos.owner?.login || owner,

      fullName: repos.full_name,

      name: repos.name,
      description: repos.description,

      language: repos.language,

      defaultBranch: repos.default_branch,

      visibility: repos.private ? "private" : "public",

      repoUrl: repos.html_url,

      connected: true,
    });

    return res.status(201).json({
      message: "Repository connected successfully",
      action: "success",
      connectedRepo,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
      action: "failure",
    });
  }
}
