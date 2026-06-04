import { Router } from "express";
import { fectchPrOfRepo } from "../controller/fecthPrReview.controller";
const router = Router();

router.get("/pull-request/:userName/:repoName", fectchPrOfRepo);
export default router;
