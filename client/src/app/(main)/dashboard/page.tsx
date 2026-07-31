"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import type { Job, Stats } from "@/types/index";

const STATUS_STYLES: Record<string, string> = {
  Applied: "bg-[#E8EDE3] text-[#4A5E3A]",
  Interview: "bg-[#F0EAD6] text-[#7A6020]",
  Offer: "bg-[#E3EDE8] text-[#2D6048]",
  Rejected: "bg-[#EDE3E3] text-[#7A3A3A]",
};

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    Applied: 0,
    Interview: 0,
    Offer: 0,
    Rejected: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchJobs(page, statusFilter, search);
    fetchStats();
  }, [page, statusFilter, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/api/v1/jobs/stats");
      setStats(data.stats);
    } catch (err) {
      console.log("err");
    }
  };

  const fetchJobs = async (p: number, status: string, q: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("limit", "10");
      if (status !== "all") params.set("status", status);
      if (q.trim() !== "") params.set("search", q.trim());
      const { data } = await api.get(`/api/v1/jobs?${params.toString()}`);
      setJobs(data.jobs);
      setTotal(data.total ?? 0);
      setTotalPages(Math.ceil((data.total ?? 0) / 10));
    } catch (err: any) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Nav */}
      <nav className="border-b border-[#DDD8CF] px-4 sm:px-6 py-4 flex items-center justify-between">
        <h1 className="font-serif text-xl text-[#1C1C1C] tracking-tight">
          Job Tracker
        </h1>
        <div className="flex items-center gap-3 sm:gap-5">
          <span className="text-sm text-[#6B6B6B] hidden sm:block">
            {user?.name}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-[#6B6B6B] hover:text-[#1C1C1C] transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Page header */}
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="font-serif text-2xl text-[#1C1C1C] tracking-tight">
              Applications
            </h2>
            <p className="text-sm text-[#6B6B6B] mt-0.5">{total} total</p>
          </div>
          <a
            href="/jobs/new"
            className="bg-[#6B7B5E] hover:bg-[#5C6B50] text-white text-sm px-3 sm:px-4 py-2 rounded-sm transition-colors"
          >
            + Add job
          </a>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by company or role..."
            className="w-full bg-transparent border border-[#DDD8CF] rounded-sm px-3 py-2.5 pr-8 text-sm text-[#1C1C1C] placeholder:text-[#B8B3A8] focus:outline-none focus:border-[#6B7B5E] transition-colors"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8B3A8] hover:text-[#6B6B6B] transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="border border-[#DDD8CF] rounded-sm px-4 py-4 bg-[#FAF7F2]">
            <p className="text-xs uppercase tracking-widest text-[#6B6B6B] mb-1">
              Applied
            </p>
            <p className="font-serif text-3xl text-[#1C1C1C]">
              {stats.Applied}
            </p>
          </div>
          <div className="border border-[#DDD8CF] rounded-sm px-4 py-4 bg-[#FAF7F2]">
            <p className="text-xs uppercase tracking-widest text-[#6B6B6B] mb-1">
              Interview
            </p>
            <p className="font-serif text-3xl text-[#7A6020]">
              {stats.Interview}
            </p>
          </div>
          <div className="border border-[#DDD8CF] rounded-sm px-4 py-4 bg-[#FAF7F2]">
            <p className="text-xs uppercase tracking-widest text-[#6B6B6B] mb-1">
              Offer
            </p>
            <p className="font-serif text-3xl text-[#2D6048]">{stats.Offer}</p>
          </div>
          <div className="border border-[#DDD8CF] rounded-sm px-4 py-4 bg-[#FAF7F2]">
            <p className="text-xs uppercase tracking-widest text-[#6B6B6B] mb-1">
              Rejected
            </p>
            <p className="font-serif text-3xl text-[#7A3A3A]">
              {stats.Rejected}
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {["all", "Applied", "Interview", "Offer", "Rejected"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`text-xs px-3 py-1.5 rounded-sm border transition-colors ${
                statusFilter === s
                  ? "bg-[#6B7B5E] text-white border-[#6B7B5E]"
                  : "border-[#DDD8CF] text-[#6B6B6B] hover:bg-[#F0EBE0]"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>

        {/* Table — desktop */}
        {isLoading ? (
          <p className="text-sm text-[#6B6B6B]">Loading...</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block border border-[#DDD8CF] rounded-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#DDD8CF] bg-[#F0EBE0]">
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-[#6B6B6B] font-normal">
                      Company
                    </th>
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-[#6B6B6B] font-normal">
                      Role
                    </th>
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-[#6B6B6B] font-normal">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-[#6B6B6B] font-normal">
                      Applied
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, i) => (
                    <tr
                      key={job._id}
                      className={`border-b border-[#DDD8CF] hover:bg-[#F0EBE0] transition-colors last:border-b-0 ${i % 2 === 0 ? "" : "bg-[#FAF7F2]"}`}
                    >
                      <td className="px-4 py-3.5 text-[#1C1C1C] font-medium">
                        {job.company}
                      </td>
                      <td className="px-4 py-3.5 text-[#3C3C3C]">{job.role}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-sm font-medium ${STATUS_STYLES[job.status] ?? "bg-[#E8E3DD] text-[#5C5C5C]"}`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[#6B6B6B] tabular-nums">
                        {new Date(job.appliedDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <a
                          href={`/jobs/${job._id}`}
                          className="text-xs text-[#6B7B5E] hover:text-[#5C6B50] underline underline-offset-2"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                  {jobs.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-12 text-center text-sm text-[#6B6B6B]"
                      >
                        No applications yet.{" "}
                        <a
                          href="/jobs/new"
                          className="text-[#6B7B5E] underline underline-offset-2"
                        >
                          Add your first one.
                        </a>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {jobs.length === 0 && (
                <p className="text-center text-sm text-[#6B6B6B] py-12">
                  No applications yet.{" "}
                  <a
                    href="/jobs/new"
                    className="text-[#6B7B5E] underline underline-offset-2"
                  >
                    Add your first one.
                  </a>
                </p>
              )}
              {jobs.map((job) => (
                <a
                  key={job._id}
                  href={`/jobs/${job._id}`}
                  className="block border border-[#DDD8CF] rounded-sm px-4 py-4 bg-[#FAF7F2] hover:bg-[#F0EBE0] transition-colors"
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium text-[#1C1C1C]">
                      {job.company}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-sm font-medium ${STATUS_STYLES[job.status] ?? "bg-[#E8E3DD] text-[#5C5C5C]"}`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <p className="text-sm text-[#3C3C3C]">{job.role}</p>
                  <p className="text-xs text-[#6B6B6B] mt-2 tabular-nums">
                    {new Date(job.appliedDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </a>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-xs text-[#6B6B6B]">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
                className="text-xs px-3 py-1.5 border border-[#DDD8CF] rounded-sm text-[#1C1C1C] hover:bg-[#F0EBE0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
                className="text-xs px-3 py-1.5 border border-[#DDD8CF] rounded-sm text-[#1C1C1C] hover:bg-[#F0EBE0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
