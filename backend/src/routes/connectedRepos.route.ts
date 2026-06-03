import { Router } from "express";
import { ConnectedRepos } from "../controller/connectedRepos.controller";
import authMiddleware from "../middleware/auth.middleware";
const router = Router();

router.get("/connected", authMiddleware, ConnectedRepos);

export default router;
