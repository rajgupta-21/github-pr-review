import { Router } from "express";
import LogoutController from "../controller/logout.controller";
const router = Router();

router.get("/logut", LogoutController);

export default router;
