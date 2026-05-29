import axios from "axios";
import { Request, Response } from "express";

export default async function GithubUser(req: Request, res: Response) {
  try {
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
  } catch (error) {
    return res.status(500).json({ message: "Somthing went wrong" });
  }
}
