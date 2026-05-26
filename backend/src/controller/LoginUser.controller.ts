import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../schema/user.schema";
dotenv.config();

export default async function LoginUser(req: Request, res: Response) {
  try {
    console.log(process.env.JWT_SECRET);
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({ message: "please enter credentials" });
    }
    const checkExistingUser = await UserModel.findOne({ email }).select(
      "+password",
    );

    if (!checkExistingUser) {
      return res
        .status(401)
        .json({ message: "Please register an account first" });
    }
    /* compare hash */
    const decrypt = await bcrypt.compare(password, checkExistingUser.password);
    if (!decrypt) {
      return res.status(401).json({ message: "Wrong Credentials" });
    }
    const payload = {
      id: checkExistingUser._id,
      email: checkExistingUser.email,
    };
    /* Session implmentation  */
    console.log(process.env.JWT_SECRET);
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });

    /**
    cookies implmented 
    **/
    res.cookie("token", token, {
      sameSite: "lax",
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Succesfully Logged in" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "somthing went wrong",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
