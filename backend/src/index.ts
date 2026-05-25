import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import { Dbconnect } from "./db/db";
import RegisterRoute from "./routes/register.route";
const app = express();
Dbconnect();

const PORT = process.env.PORT;
if (!PORT) {
  console.log("PORT is missing in the env ");
  process.exit(0);
}
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use("/auth", RegisterRoute);

app.get("/", (req, res) => {
  return res.json({
    message: "Hi From Server",
  });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
