import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { UserModel } from "../schema/user.schema";
export const RegisterUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "please enter all of the credentials" });
    }
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User Already Resgistered" });
    }
    const hashedPass = await bcrypt.hash(password, 10);
    const RegisteredUser = await UserModel.create({
      name,
      email,
      password: hashedPass,
    });
    const response = {
      _id: RegisteredUser._id,
      name: RegisteredUser.name,
      email: RegisteredUser.email,
      createdAt: RegisteredUser.createdAt,
    };
    return res
      .status(200)
      .json({ message: "successfully register a user", response });
  } catch (error) {
    return res.status(400).json({ message: "somthing went wrong" });
  }
};
