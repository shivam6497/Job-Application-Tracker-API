import mongoose from "mongoose";
import {
  getCachedJob,
  setCachedJob,
  getCachedJobList,
  setCachedJobList,
  invalidateJobCache,
  invalidateJobListCache,
} from "../cache/job.cache.js";
import type { Request, Response, NextFunction } from "express";
import { Job, type IJob } from "../models/job.model.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import { scheduleFollowUpEmail } from "../jobs/emailQueue.js";

export async function setJob(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { company, role, status, notes } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
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
    next(error);
  }
}

export async function getJob(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const jobId = req.params.id as string;
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
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
      throw new AppError("Job not found", 404);
    }
    await setCachedJob(jobId, job);
    res.status(200).json({
      success: true,
      source: "database",
      job: job,
    });
  } catch (error) {
    next(error);
  }
}

export async function getJobList(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
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
    next(error);
  }
}

export async function updateJob(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const jobId = req.params.id as string;
    const userId = req.user?.userId as string;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const updateJob = await Job.findOneAndUpdate(
      { _id: jobId, user: userId },
      req.body,
      { new: true, runValidators: true },
    );

    if (!updateJob) {
      throw new AppError("Job not found", 404);
    }

    await Promise.all([invalidateJobCache(jobId), invalidateJobListCache()]);

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job: updateJob,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteJob(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const jobId = req.params.id as string;
    const userId = req.user?.userId as string;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const deleteJob = await Job.findOneAndDelete({ _id: jobId, user: userId });
    if (!deleteJob) {
      throw new AppError("Job not found", 404);
    }

    await Promise.all([invalidateJobCache(jobId), invalidateJobListCache()]);

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}
