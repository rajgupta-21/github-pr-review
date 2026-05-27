import { Request, Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
const router = Router();

router.get("/me", authMiddleware, (req: Request, res) => {
  res.status(200).json({
    authenticated: true,
    user: req.user,
  });
});

export default router;
