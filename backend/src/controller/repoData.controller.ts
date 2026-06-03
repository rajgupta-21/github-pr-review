import { Request, Response } from "express";
import { ConnectedRepo } from "../schema/ConnectedRepository.schema";

export async function RespondRepoData(req: Request, res: Response) {
  try {
    const { repoId } = req.params;
    if (!repoId) {
      return res
        .status(401)
        .json({ message: "Missing Parameters", action: "failure" });
    }
    const fetchData = await ConnectedRepo.findOne({ repoId });
    if (!fetchData) {
      return res
        .status(401)
        .json({ message: "No repo found ", action: "failure" });
    }
    return res
      .status(200)
      .json({ message: "repo Found", fetchData, action: "success" });
  } catch (error) {
    return res.status(500).json({
      message: "somthing went wrong please try again",
      action: "server failure",
    });
  }
}
