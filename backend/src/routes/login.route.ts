import { Router } from "express";
import LoginUser from "../controller/LoginUser.controller";
const router = Router();

router.post("/login", LoginUser);

export default router;
