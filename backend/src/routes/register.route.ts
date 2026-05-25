import { Router } from "express";
import { RegisterUser } from "../controller/user.controller";
const router = Router();

router.post("/register", RegisterUser);
export default router;
