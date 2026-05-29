import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import { UserModel } from "../schema/user.schema";

const router = Router();

router.get("/me", authMiddleware, async (req: any, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select(
      "-password -githubAccessToken -__v",
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      authenticated: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user",
    });
  }
});

export default router;
