import { Request, Response } from "express";
import { ConnectedRepo } from "../schema/ConnectedRepository.schema";

export async function ConnectedRepos(req: Request, res: Response) {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
        action: "unauthorized",
      });
    }

    const connectedRepos = await ConnectedRepo.find({ userId }).lean();

    return res.status(200).json({
      message:
        connectedRepos.length > 0
          ? "Connected repositories found"
          : "No repositories connected yet",
      connectedRepos,
      action: "success",
    });
  } catch (error) {
    console.error("ConnectedRepos Error:", error);

    return res.status(500).json({
      message: "Something went wrong. Please try again.",
      action: "failure",
    });
  }
}
