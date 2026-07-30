import mongoose, { Query } from "mongoose";
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
import { success } from "zod";

export async function setJob(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { company, role, status, notes, appliedDate } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const jobData = {
      company,
      role,
      status,
      notes,
      appliedDate: appliedDate ? new Date(appliedDate) : new Date(),
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
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const filter: Record<string, any> = { user: userId };
    if (status && ["Applied", "Interview", "Offer", "Rejected"].includes(status)) {
      filter.status = status;
    }
    if (search && search.trim() !== "") {
      filter.$or = [
        { company: { $regex: search.trim(), $options: "i" } },
        { role: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const cachedJobList = await getCachedJobList(page, limit, status ?? "all", search ?? "");
    if (cachedJobList) {
      const total = await Job.countDocuments(filter);
      res.status(200).json({
        success: true,
        source: "cache",
        jobs: cachedJobList,
        total,
      });
      return;
    }

    const skip = (page - 1) * limit;
    const [jobs, total] = await Promise.all([
      Job.find(filter).skip(skip).limit(limit).lean(),
      Job.countDocuments(filter),
    ]);

    await setCachedJobList(page, limit, jobs, status ?? "all", search ?? "");
    res.status(200).json({
      success: true,
      source: "database",
      jobs,
      total,
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

export async function getJobStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId as string;

    if(!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const stats = await Job.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$status", count: { $sum : 1 } } }
    ]);

    const result = {
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
    };

    stats.forEach((s) => {
      if(s._id in result) {
        result[s._id as keyof typeof result] = s.count;
      }
    });

    res.status(200).json({
      success: true,
      stats: result,
    });
  } catch (err) {
    next(err);
  }
}