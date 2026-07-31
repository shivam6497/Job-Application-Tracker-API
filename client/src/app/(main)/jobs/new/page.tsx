"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

const STATUS_OPTIONS = ["Applied", "Interview", "Offer", "Rejected"];

export default function NewJobPage() {
  const router = useRouter();

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [appliedDate, setAppliedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await api.post("/api/v1/jobs", {
        company,
        role,
        status,
        notes,
        appliedDate,
      });
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8]">

      {/* Nav */}
      <nav className="border-b border-[#DDD8CF] px-4 sm:px-6 py-4 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-sm text-[#6B6B6B] hover:text-[#1C1C1C] transition-colors"
        >
          ← Applications
        </Link>
        <span className="text-[#DDD8CF]">/</span>
        <span className="text-sm text-[#1C1C1C]">New</span>
      </nav>

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <h2 className="font-serif text-2xl text-[#1C1C1C] tracking-tight mb-8">
          Add application
        </h2>

        <form onSubmit={onSubmit} className="space-y-6">

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-[#6B6B6B]">Company</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Stripe"
              required
              className="bg-transparent border border-[#DDD8CF] rounded-sm px-3 py-2.5 text-sm text-[#1C1C1C] placeholder:text-[#B8B3A8] focus:outline-none focus:border-[#6B7B5E] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-[#6B6B6B]">Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Backend Engineer"
              required
              className="bg-transparent border border-[#DDD8CF] rounded-sm px-3 py-2.5 text-sm text-[#1C1C1C] placeholder:text-[#B8B3A8] focus:outline-none focus:border-[#6B7B5E] transition-colors"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs uppercase tracking-widest text-[#6B6B6B]">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-[#F5F0E8] border border-[#DDD8CF] rounded-sm px-3 py-2.5 text-sm text-[#1C1C1C] focus:outline-none focus:border-[#6B7B5E] transition-colors appearance-none cursor-pointer"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs uppercase tracking-widest text-[#6B6B6B]">Date applied</label>
              <input
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="bg-transparent border border-[#DDD8CF] rounded-sm px-3 py-2.5 text-sm text-[#1C1C1C] focus:outline-none focus:border-[#6B7B5E] transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-[#6B6B6B]">
              Notes{" "}
              <span className="normal-case tracking-normal text-[#B8B3A8]">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Referral, job link, anything worth noting..."
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
              disabled={isLoading}
              className="bg-[#6B7B5E] hover:bg-[#5C6B50] text-white text-sm px-5 py-2.5 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save application"}
            </button>
            <Link
              href="/dashboard"
              className="text-sm px-5 py-2.5 border border-[#DDD8CF] rounded-sm text-[#1C1C1C] hover:bg-[#F0EBE0] transition-colors text-center"
            >
              Cancel
            </Link>
          </div>

        </form>
      </main>
    </div>
  );
}
