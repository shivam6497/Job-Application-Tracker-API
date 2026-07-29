import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.route.js";
import jobRoutes from "./routes/job.route.js";
import cookieParser from "cookie-parser";


const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL as string,
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use(errorHandler);

export default app;