import { Router } from "express";
import {
    setJob,
    getJob,
    getJobList,
    updateJob,
    deleteJob
} from "../controllers/job.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { createJobSchema, updateJobSchema } from "../validators/job.validator.js";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createJobSchema), setJob);
router.get("/", getJobList);
router.get("/:id", getJob);
router.put("/:id", validate(updateJobSchema), updateJob);
router.delete("/:id", deleteJob);

export default router;


