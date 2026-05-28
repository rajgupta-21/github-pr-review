import dotenv from "dotenv";
import { Request, Response } from "express";
dotenv.config();

export default function LogoutController(req: Request, res: Response) {
  try {
    const token = req.headers.cookie;
    if (!token) {
      return res
        .status(400)
        .json({ message: "user is not logged in", action: "Failed" });
    }
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "prodcution",
      sameSite: "lax",
    });
    return res
      .status(200)
      .send({ message: "Logout Successfull", action: "successfull" });
  } catch (error) {
    return res.status(500).json({ messsage: "internal server error" });
  }
}
