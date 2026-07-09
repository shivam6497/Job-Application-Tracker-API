import { Router } from "express";
import {
    setJob,
    getJob,
    getJobList,
    updateJob,
    deleteJob
} from "../controllers/job.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
