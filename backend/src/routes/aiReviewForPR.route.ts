import { Router } from "express";
import { AiReviewForPR } from "../controller/apicallForPrReview.controller";
const router = Router();

router.post("/ai-review", AiReviewForPR);
export default router;
