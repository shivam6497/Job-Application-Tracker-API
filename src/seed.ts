// src/seed.ts
import mongoose from "mongoose";
import { config } from "dotenv";
config();

import { Job } from "./models/job.model.js";

const TARGET_USER_ID = new mongoose.Types.ObjectId();

async function seed() {
  await mongoose.connect(process.env.DATABASE_URL!);
  console.log("Connected");

  await Job.deleteMany({});
console.log("Cleared existing jobs");

  const jobs = [];
  for (let i = 0; i < 50000; i++) {
    jobs.push({
      user: i % 100 === 0 ? TARGET_USER_ID : new mongoose.Types.ObjectId(),
      company: `Company ${i}`,
      role: `Engineer ${i}`,
      status: i % 3 === 0 ? "pending" : i % 3 === 1 ? "interview" : "declined",
    });
  }

  await Job.insertMany(jobs);
  console.log(`Seeded 50000 jobs. Target user ID: ${TARGET_USER_ID}`);
  process.exit(0);
}

seed().catch(console.error);
