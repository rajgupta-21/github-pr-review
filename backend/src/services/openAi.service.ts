import dotenv from "dotenv";
import OpenAI from "openai";
dotenv.config();

export const openAi = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});
