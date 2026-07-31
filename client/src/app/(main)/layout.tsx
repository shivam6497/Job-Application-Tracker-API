"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) return router.replace("/login");
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <p className="font-serif text-lg text-[#1C1C1C] tracking-wide">
          Loading...
        </p>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
