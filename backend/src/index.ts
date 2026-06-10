import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { Dbconnect } from "./db/db";
import connectedRepos from "./routes/connectedRepos.route";
import connectToRepoRoute from "./routes/connectToRepo.route";
import fetchAllUserPr from "./routes/fetchAllPrs.route";
import fetchFilesChanged from "./routes/fetchFilesChanged.route";
import fectchPrByNumber from "./routes/fetchPrByNumber.route";
import fecthPRRepoRoute from "./routes/fetchPrForRepo.route";
import githubRoute from "./routes/github.route";
import LoginRoute from "./routes/login.route";
import logoutRoute from "./routes/logout.route";
import RegisterRoute from "./routes/register.route";
import RepoDataFetch from "./routes/repoDataFetch.route";
import UserReposRoute from "./routes/repoFetchForUser.route";
import sessionRoute from "./routes/session.route";
import workflowRoute from "./routes/workflow.route";
const app = express();
Dbconnect();

const PORT = process.env.PORT;
if (!PORT) {
  console.log("PORT is missing in the env ");
  process.exit(0);
}
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

/*
Register Route
*/
app.use("/auth", RegisterRoute);

/**
Login Route 
**/
app.use("/auth", LoginRoute);
/* 
session route
*/
app.use("/auth", sessionRoute);
/*
Logout Route
*/
app.use("/auth", logoutRoute);
/*Github Route*/
app.use("/auth", githubRoute);
/** 
health route
**/
/*
Get User's Repo From Github
*/
app.use("/user", UserReposRoute);
/*Connect to repo route*/
app.use("/repo", connectToRepoRoute);
/*
connected repos 
*/
app.use("/repo", connectedRepos);
/*
fetch Connected Repo Data
*/
app.use("/user", RepoDataFetch);
/*Fetch PR for a Repo */
app.use("/repo", fecthPRRepoRoute);
/*Fetch  All PR for a Repo */
app.use("/repo", fetchAllUserPr);
/* Workflow persistence */
app.use("/user", workflowRoute);
/*Fetch  PR  by Number */
app.use("/user", fectchPrByNumber);
/*Fetch  filesChanged  by prNumber */
app.use("/pr", fetchFilesChanged);
app.get("/", (req, res) => {
  return res.json({
    message: "Server is healthy",
  });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
