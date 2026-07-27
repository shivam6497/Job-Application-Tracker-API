import { Queue } from "bullmq";
import { bullmqRedis } from "../config/redis.js";

export const emailQueue = new Queue("email-queue", { connection: bullmqRedis as any });

export const scheduleFollowUpEmail = async(
    jobId: string,
    company: string,
    role: string,
    email: string
) => {
    await emailQueue.add(
        "follow-up-email",
        {
            jobId,
            company,
            role,
            email,
        },
        {
            delay: 7 * 24 * 60 * 60 * 1000,
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 1000,
            },
        }
    );

    console.log(`Follow up email scheduled for ${company} - ${role}`);
};