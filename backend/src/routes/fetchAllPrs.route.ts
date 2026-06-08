import { Router } from "express";
import { FetchAllUserPr } from "../controller/fetchAllPr.controller";

const router = Router();

router.get("/pr-all/:userName/:repoName/:userId", FetchAllUserPr);
export default router;
