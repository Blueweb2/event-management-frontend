"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ScheduleRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/manager/duties?tab=calendar");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#9A7B4F]/10 text-[#9A7B4F]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
      <p className="text-xs font-medium text-gray-500">Redirecting to Operations Calendar...</p>
    </div>
  );
}