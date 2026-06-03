import { Request, Response } from "express";
import { ConnectedRepo } from "../schema/ConnectedRepository.schema";

export async function ConnectedRepos(req: Request, res: Response) {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        message: "unauthorized",
        action: "unauthorized",
      });
    }
    const connectedRepos = await ConnectedRepo.find({ userId });
    if (connectedRepos.length === 0) {
      return res
        .status(404)
        .json({ message: "no repositories connected yet", action: "notFound" });
    }
    res.status(200).json({
      message: "connected repos found ",
      connectedRepos,
      action: "success",
    });
  } catch (error) {
    return res.status(500).json({
      message: "somthing went wrong please try again",
      action: "failure",
    });
  }
}
