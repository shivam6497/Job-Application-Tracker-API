// src/explain.ts
import mongoose from "mongoose";
import { config } from "dotenv";
config();

import { Job } from "./models/job.model.js";

async function explain() {
  await mongoose.connect(process.env.DATABASE_URL!);
  console.log("Connected");

  const result: any = await Job.find({ 
    user: new mongoose.Types.ObjectId("6a5675acca1286f020078d63"),
    status: "pending" 
  }).explain("executionStats");

  const indexes = await Job.collection.indexes();
  console.log(indexes);
  console.log("Stage:", result.executionStats.executionStages.stage);
  console.log("Docs Examined:", result.executionStats.totalDocsExamined);
  console.log("Docs Returned:", result.executionStats.nReturned);
  console.log("Time (ms):", result.executionStats.executionTimeMillis);

  process.exit(0);
}

explain().catch(console.error);