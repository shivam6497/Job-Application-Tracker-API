import { z } from "zod";

export const createJobSchema = z.object({
    company: z.string().min(1, "Company name is required"),
    role: z.string().min(1, "Role is required"),
    status: z.enum(["interview", "declined", "pending"]),
    notes: z.string().optional(),
});

export const updateJobSchema = createJobSchema.partial();