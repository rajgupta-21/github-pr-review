import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { Dbconnect } from "./db/db";
import LoginRoute from "./routes/login.route";
import logoutRoute from "./routes/logout.route";
import RegisterRoute from "./routes/register.route";
import sessionRoute from "./routes/session.route";
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
/** 
health route
**/
app.get("/", (req, res) => {
  return res.json({
    message: "Server is healthy",
  });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
