import { Worker } from "bullmq";
import bullmqRedis from "../config/redis.js";
import resend from "../config/mailer.js";
import dotenv from "dotenv";

dotenv.config();

const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    const { company, role, email } = job.data;

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM!,
      to: email,
      subject: `Follow up — ${role} at ${company}`,
      html: `
        <h2>Hey! 👋</h2>
        <p>You applied for <strong>${role}</strong> at <strong>${company}</strong> 7 days ago.</p>
        <p>Have you heard back? It might be a good time to follow up!</p>
        <br/>
        <p>Good luck! 🚀</p>
      `,
    });
    if (error) {
      console.error("Email sending failed:", error);
      throw new Error(error.message); // throw so BullMQ retries
    }

    console.log(`Follow up email sent to ${email} for ${company}`, data);
  },
  {
    connection: bullmqRedis as any,
    concurrency: 10,
  },
);

emailWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

export default emailWorker;
