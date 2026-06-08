import { Router } from "express";
import { fecthChangedFilesForPr } from "../controller/fetchFilesChangeByPRnumber.controller";
const router = Router();

router.get(
  "/files-changed/:owner/:repo/:pull_number/:userId",
  fecthChangedFilesForPr,
);

export default router;
