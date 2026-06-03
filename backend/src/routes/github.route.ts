import axios from "axios";
import dotenv from "dotenv";
import { Router } from "express";
import { UserModel } from "../schema/user.schema";
import GenerateToken from "../utils/jwtSign.util";
dotenv.config();

const router = Router();

router.get("/github", async (req, res) => {
  const githubUrl =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${process.env.GITHUB_CLIENT_ID}` +
    `&scope=read:user user:email repo`;

  res.redirect(githubUrl);
});

router.get("/github/callback", async (req, res) => {
  try {
    const code = req.query.code as string;

    if (!code) {
      return res.status(400).json({
        message: "No code provided",
      });
    }

    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    const accessToken = tokenResponse.data.access_token;

    // Fetch GitHub user
    const githubUser = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const user = githubUser.data;

    let existingUser = await UserModel.findOne({
      githubId: user.id.toString(),
    });

    if (!existingUser) {
      existingUser = await UserModel.create({
        email: user.email,

        githubConnected: true,

        githubId: user.id.toString(),

        githubUsername: user.login,

        githubAvatarUrl: user.avatar_url,

        githubAccessToken: accessToken,

        plan: user.plan.name,
      });
    } else {
      existingUser.githubAccessToken = accessToken;
      await existingUser.save();
    }

    const jwtToken = GenerateToken({
      id: existingUser._id.toString(),
      email: existingUser.email,
    });

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.redirect("http://localhost:3000/dashboard");
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "OAuth failed",
    });
  }
});

export default router;
