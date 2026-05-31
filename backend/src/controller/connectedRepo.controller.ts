import { Request, Response } from "express";
import { ConnectedRepo } from "../schema/ConnectedRepository.schema";

export async function ConnectRepo(req: Request, res: Response) {
  try {
    const { userId, repoId, owner, fullName, connected } = req.params;
    if (!userId || !repoId || !owner || !fullName || !connected) {
      return res.status(400).json({
        message: "fields are missing please try again",
        action: "credentials missing",
      });
    }
    const alreadyConnected = await ConnectedRepo.findOne({ repoId });
    if (alreadyConnected) {
      return res
        .status(400)
        .json({ message: "Already Connected", action: "failure" });
    }
    const connectedRepo = await ConnectedRepo.create({
      userId,
      repoId,
      owner,
      fullName,
      connected,
    });
    return res.status(200).json({
      message: "Successfully connected repository",
      action: "success",
      connectedRepo,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Somthing went wrong", action: "failure", error });
  }
}
