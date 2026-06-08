import { Router } from "express";
import { FetchPrByNo } from "../controller/fecthPrByNumber.controller";

const router = Router();
router.get("/pull-request/:owner/:repo/:prNumber/:userId", FetchPrByNo);

export default router;
