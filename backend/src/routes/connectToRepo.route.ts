import { Router } from "express";
import { ConnectRepo } from "../controller/connectedRepo.controller";
import authMiddleware from "../middleware/auth.middleware";
const router = Router();

router.post("/connect", authMiddleware, ConnectRepo);
export default router;
