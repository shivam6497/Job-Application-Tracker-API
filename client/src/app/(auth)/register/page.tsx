"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await register(name, email, password);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <h1 className="font-serif text-3xl text-[#1C1C1C] mb-1 tracking-tight">
            Create account
          </h1>
          <p className="text-sm text-[#6B6B6B]">
            Start tracking applications today.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-[#6B6B6B]">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="bg-transparent border border-[#DDD8CF] rounded-sm px-3 py-2.5 text-sm text-[#1C1C1C] placeholder:text-[#B8B3A8] focus:outline-none focus:border-[#6B7B5E] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-[#6B6B6B]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="bg-transparent border border-[#DDD8CF] rounded-sm px-3 py-2.5 text-sm text-[#1C1C1C] placeholder:text-[#B8B3A8] focus:outline-none focus:border-[#6B7B5E] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-[#6B6B6B]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-transparent border border-[#DDD8CF] rounded-sm px-3 py-2.5 pr-10 text-sm text-[#1C1C1C] placeholder:text-[#B8B3A8] focus:outline-none focus:border-[#6B7B5E] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8B3A8] hover:text-[#6B6B6B] transition-colors"
              >
                {showPassword ? (
                  // eye-off
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  // eye
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-[#A0522D] border border-[#DDD8CF] bg-[#FBF7F2] px-3 py-2 rounded-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#6B7B5E] hover:bg-[#5C6B50] text-white text-sm py-2.5 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="mt-8 text-xs text-[#6B6B6B] text-center">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-[#6B7B5E] underline underline-offset-2 hover:text-[#5C6B50]"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
