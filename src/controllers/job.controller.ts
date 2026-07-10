import mongoose from "mongoose";
import redisClient from "../config/redis.js";
import {
  getCachedJob,
  setCachedJob,
  getCachedJobList,
  setCachedJobList,
  invalidateJobCache,
  invalidateJobListCache,
} from "../cache/job.cache.js";
import type { Request, Response } from "express";
import { Job, type IJob } from "../models/job.model.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { scheduleFollowUpEmail } from "../jobs/emailQueue.js";

export async function setJob(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { company, role, status, notes } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const jobData = {
      company,
      role,
      status,
      notes,
      appliedDate: new Date(),
      user: new mongoose.Types.ObjectId(userId),
    };

    const job = await Job.create(jobData);

    await invalidateJobListCache();

    await scheduleFollowUpEmail(
      job._id.toString(),
      company,
      role,
      req.user?.email!,
    );
    res.status(201).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function getJob(req: AuthRequest, res: Response): Promise<void> {
  try {
    const jobId = req.params.id as string;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const cachedJob = await getCachedJob(jobId);
    if (cachedJob) {
      res.status(200).json({
        success: true,
        source: "cache",
        job: cachedJob,
      });
      return;
    }

    const job = await Job.findOne({ _id: jobId, user: userId });
    if (!job) {
      res.status(404).json({
        success: false,
        message: "Job not found",
      });
      return;
    }
    await setCachedJob(jobId, job);
    res.status(200).json({
      success: true,
      source: "database",
      job: job,
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function getJobList(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user?.userId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const cachedJobList = await getCachedJobList(page, limit);
    if (cachedJobList) {
      res.status(200).json({
        success: true,
        source: "cache",
        jobs: cachedJobList,
      });
      return;
    }

    const skip = (page - 1) * limit;
    const [jobs, total] = await Promise.all([
      Job.find({ user: userId }).skip(skip).limit(limit).lean(),
      Job.countDocuments({ user: userId }),
    ]);

    await setCachedJobList(page, limit, jobs);
    res.status(200).json({
      success: true,
      source: "database",
      jobs: jobs,
      total: total,
    });
  } catch (error) {
    console.error("Error fetching job list:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function updateJob(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const jobId = req.params.id as string;
    const userId = req.user?.userId as string;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const updateJob = await Job.findOneAndUpdate(
      { _id: jobId, user: userId },
      req.body,
      { new: true, runValidators: true },
    );

    if (!updateJob) {
      res.status(404).json({
        success: false,
        message: "Job not found",
      });
      return;
    }

    await Promise.all([invalidateJobCache(jobId), invalidateJobListCache()]);

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job: updateJob,
    });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function deleteJob(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const jobId = req.params.id as string;
    const userId = req.user?.userId as string;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const deleteJob = await Job.findOneAndDelete({ _id: jobId, user: userId });
    if (!deleteJob) {
      res.status(404).json({
        success: false,
        message: "Job not found",
      });
      return;
    }

    await Promise.all([invalidateJobCache(jobId), invalidateJobListCache()]);

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
