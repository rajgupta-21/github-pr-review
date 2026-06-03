import { Request, Response } from "express";
import { ConnectedRepo } from "../schema/ConnectedRepository.schema";

export async function ConnectRepo(req: Request, res: Response) {
  try {
    const { repoId, owner, fullName } = req.body;

    const userId = req.user?._id;
    console.log("repoID:", repoId);
    console.log("owner:", owner);
    console.log("fullName:", fullName);
    console.log("userId:", userId);
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

    const connectedRepo = await ConnectedRepo.create({
      userId,
      repoId,
      owner,
      fullName,
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
