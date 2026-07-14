// src/createIndex.ts
import mongoose from "mongoose";
import { config } from "dotenv";
config();

import { Job } from "./models/job.model.js";

async function createIndex() {
  await mongoose.connect(process.env.DATABASE_URL!);
  console.log("Connected");

  await Job.collection.createIndex({ user: 1 , status: 1 });
  console.log("Index created on user and status fields");

  process.exit(0);
}

createIndex().catch(console.error);