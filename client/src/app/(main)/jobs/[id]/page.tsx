"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/axios";
import type { SingleJob } from "@/types/index";

const STATUS_OPTIONS = ["Applied", "Interview", "Offer", "Rejected"];

const STATUS_STYLES: Record<string, string> = {
  Applied: "bg-[#E8EDE3] text-[#4A5E3A]",
  Interview: "bg-[#F0EAD6] text-[#7A6020]",
  Offer: "bg-[#E3EDE8] text-[#2D6048]",
  Rejected: "bg-[#EDE3E3] text-[#7A3A3A]",
};

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [job, setJob] = useState<SingleJob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchJob();
  }, []);

  const fetchJob = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/api/v1/jobs/${id}`);
      setJob(data.job);
    } catch (err: any) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (!job) return;
    setCompany(job.company);
    setRole(job.role);
    setStatus(job.status);
    setNotes(job.notes ?? "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const { data } = await api.put(`/api/v1/jobs/${id}`, {
        company,
        role,
        status,
        notes,
      });
      setJob(data.job);
      setIsEditing(false);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/api/v1/jobs/${id}`);
      router.replace("/dashboard");
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <p className="font-serif text-lg text-[#1C1C1C] tracking-wide">
          Loading...
        </p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <p className="text-sm text-[#6B6B6B]">Job not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Nav */}
      <nav className="border-b border-[#DDD8CF] px-4 sm:px-6 py-4 flex items-center gap-3">
        <a
          href="/dashboard"
          className="text-sm text-[#6B6B6B] hover:text-[#1C1C1C] transition-colors"
        >
          ← Applications
        </a>
        <span className="text-[#DDD8CF]">/</span>
        <span className="text-sm text-[#1C1C1C] truncate max-w-[120px] sm:max-w-none">
          {job.company}
        </span>
      </nav>

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* ── VIEW MODE ── */}
        {!isEditing && (
          <div>
            <div className="flex items-start justify-between mb-8">
              <div className="flex-1 min-w-0 pr-4">
                <h2 className="font-serif text-2xl text-[#1C1C1C] tracking-tight">
                  {job.company}
                </h2>
                <p className="text-[#3C3C3C] mt-0.5">{job.role}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-sm font-medium shrink-0 mt-1 ${STATUS_STYLES[job.status] ?? "bg-[#E8E3DD] text-[#5C5C5C]"}`}
              >
                {job.status}
              </span>
            </div>

            <dl className="space-y-5">
              <div className="border-b border-[#DDD8CF] pb-5">
                <dt className="text-xs uppercase tracking-widest text-[#6B6B6B] mb-1">
                  Applied
                </dt>
                <dd className="text-sm text-[#1C1C1C]">
                  {new Date(job.appliedDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </dd>
              </div>

              {job.notes && (
                <div className="border-b border-[#DDD8CF] pb-5">
                  <dt className="text-xs uppercase tracking-widest text-[#6B6B6B] mb-1">
                    Notes
                  </dt>
                  <dd className="text-sm text-[#1C1C1C] leading-relaxed whitespace-pre-wrap break-words">
                    {job.notes}
                  </dd>
                </div>
              )}
            </dl>

            <div className="flex flex-wrap items-center gap-3 mt-8">
              <button
                onClick={handleEdit}
                className="text-sm px-4 py-2 bg-[#6B7B5E] hover:bg-[#5C6B50] text-white rounded-sm transition-colors"
              >
                Edit
              </button>

              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-sm px-4 py-2 border border-[#DDD8CF] rounded-sm text-[#7A3A3A] hover:bg-[#EDE3E3] transition-colors"
                >
                  Delete
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-[#6B6B6B]">Sure?</span>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-sm px-4 py-2 bg-[#EDE3E3] text-[#7A3A3A] hover:bg-[#E0D0D0] rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? "Deleting..." : "Yes, delete"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-sm px-4 py-2 border border-[#DDD8CF] rounded-sm text-[#6B6B6B] hover:bg-[#F0EBE0] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── EDIT MODE ── */}
        {isEditing && (
          <div>
            <h2 className="font-serif text-2xl text-[#1C1C1C] tracking-tight mb-8">
              Edit application
            </h2>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest text-[#6B6B6B]">
                  Company
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  className="bg-transparent border border-[#DDD8CF] rounded-sm px-3 py-2.5 text-sm text-[#1C1C1C] focus:outline-none focus:border-[#6B7B5E] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest text-[#6B6B6B]">
                  Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  className="bg-transparent border border-[#DDD8CF] rounded-sm px-3 py-2.5 text-sm text-[#1C1C1C] focus:outline-none focus:border-[#6B7B5E] transition-colors"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs uppercase tracking-widest text-[#6B6B6B]">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-[#F5F0E8] border border-[#DDD8CF] rounded-sm px-3 py-2.5 text-sm text-[#1C1C1C] focus:outline-none focus:border-[#6B7B5E] transition-colors appearance-none cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest text-[#6B6B6B]">
                  Notes{" "}
                  <span className="normal-case tracking-normal text-[#B8B3A8]">
                    (optional)
                  </span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="bg-transparent border border-[#DDD8CF] rounded-sm px-3 py-2.5 text-sm text-[#1C1C1C] placeholder:text-[#B8B3A8] focus:outline-none focus:border-[#6B7B5E] transition-colors resize-none"
                />
              </div>

              {error && (
                <p className="text-xs text-[#A0522D] border border-[#DDD8CF] bg-[#FBF7F2] px-3 py-2 rounded-sm">
                  {error}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#6B7B5E] hover:bg-[#5C6B50] text-white text-sm px-5 py-2.5 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-sm px-5 py-2.5 border border-[#DDD8CF] rounded-sm text-[#1C1C1C] hover:bg-[#F0EBE0] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
