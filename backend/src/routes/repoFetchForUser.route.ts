import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import redis from "../services/redis.service";
import { Repos } from "../types/index.types";

const router = Router();

router.get("/repo", authMiddleware, async (req, res) => {
  try {
    const cacheKey = `repos:${req.user?.githubId}`;
    const cachedRepo = await redis.get(cacheKey);
    if (cachedRepo) {
      return res.status(200).json(JSON.parse(cachedRepo));
    }
    const response = await fetch(
      "https://api.github.com/user/repos?visibility=all&per_page=100",
      {
        headers: {
          Authorization: `Bearer ${req.user?.githubAccessToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    const repos = await response.json();

    const formattedRepos = repos.map((repo: Repos) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner.login,
      private: repo.private,
      defaultBranch: repo.default_branch,
      language: repo.language,
      htmlUrl: repo.html_url,
    }));
    await redis.set(cacheKey, JSON.stringify(formattedRepos), "EX", 300);
    res.status(200).json(formattedRepos);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

export default router;
