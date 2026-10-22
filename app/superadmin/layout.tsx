"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ShieldCheck } from "lucide-react";

interface SuperAdminLayoutProps {
  children: ReactNode;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const router = useRouter();
  const { user, token, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!token) {
        router.push("/login?redirect=%2Fmanager%2Fstaff%3Ftab%3Dmanagers");
        return;
      }

      const role = (user?.role || "").toLowerCase();
      if (role === "superadmin") {
        router.replace("/manager/staff?tab=managers");
        return;
      }
      if (role === "staff") {
        router.replace("/staff");
        return;
      }
      router.replace("/manager");
    }
  }, [loading, token, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F7F3]">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#9A7B4F] to-[#D2B47A] p-0.5 shadow-md shadow-[#9A7B4F]/20">
          <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white">
            <ShieldCheck className="h-7 w-7 text-[#9A7B4F] animate-pulse" />
          </div>
        </div>
        <div>
          <p className="text-sm font-black text-[#29241f] tracking-wide">
            AUTHENTICATING ACCESS
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Redirecting to Staff Members Hub...
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
