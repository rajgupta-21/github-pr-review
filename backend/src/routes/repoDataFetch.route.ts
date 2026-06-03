import { Router } from "express";
import { RespondRepoData } from "../controller/repoData.controller";
const router = Router();

router.get("/repo/:repoId", RespondRepoData);

export default router;
