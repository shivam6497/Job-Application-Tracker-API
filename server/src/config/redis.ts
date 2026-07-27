import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = new Redis(process.env.REDIS_HOST as string, {
    lazyConnect: true,
    retryStrategy(times) {
        if(times > 5) {
            console.log("Redis connection failed after 5 attempts. Exiting...");
            return null;
        }
        const delay = Math.min(times * 200, 1000);
        return delay;
    },
});

redisClient.on("connect", () => {
    console.log("Redis connected successfully");
});

redisClient.on("error", (err) => {
    console.log("Redis connection error:", err);
});

export const bullmqRedis = new Redis(process.env.REDIS_HOST as string, {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
        return Math.min(times * 200, 2000);
    },
});

bullmqRedis.on("connect", () => {
    console.log("BullMQ Redis connected successfully");
});

bullmqRedis.on("error", (err) => {
    console.log("BullMQ Redis connection error:", err);
});

export default redisClient;