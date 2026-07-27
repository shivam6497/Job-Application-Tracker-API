import mongoose, { Schema, Document } from "mongoose";

export interface IJob extends Document{
  company: string;
  role: string;
  status: "interview" | "declined" | "pending";
  appliedDate?: Date;
  notes?: string;
  user: mongoose.Types.ObjectId;
}

const jobSchema = new Schema<IJob>(
  {
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["interview", "declined", "pending"],
      default: "pending",
    },
    appliedDate: { type: Date, default: Date.now },
    notes: { type: String, trim: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  },
);

export const Job = mongoose.model<IJob>("Job", jobSchema);
