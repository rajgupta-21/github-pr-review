import { Router } from "express";
import { AiReviewForPR } from "../controller/apicallForPrReview.controller";
const router = Router();

router.get("/ai-review", AiReviewForPR);
export default router;
