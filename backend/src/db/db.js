import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

export async function Dbconnect() {
  const URL = process.env.MONGO_URL;
  if (!URL) {
    console.log("URL NOT FOUND");
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("successfully connected to Db");
  } catch (error) {
    console.log("somthing went wrong while connecting to Db");
    process.exit(1);
  }
}
