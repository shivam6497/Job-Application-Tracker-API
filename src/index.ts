import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.route.js";
import jobRoutes from "./routes/job.route.js";


const app = express();
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use(errorHandler);

export default app;