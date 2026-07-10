import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import jobRoutes from "./routes/job.route.js";
import "./jobs/emailWorker.js";


const PORT = Number(process.env.PORT);

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);


async function startServer() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

startServer();
