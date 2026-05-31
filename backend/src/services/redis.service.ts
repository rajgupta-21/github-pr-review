import dotenv from "dotenv";
import Redis from "ioredis";
dotenv.config();

const redis = new Redis(process.env.REDIS_URL!);

redis.on("connect", () => {
  console.log("Successfully connected to Redis");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

export default redis;
