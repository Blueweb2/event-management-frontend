"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EstimatesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/manager/events?tab=estimates");
  }, [router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-sm text-gray-500">
        <div className="h-7 w-7 animate-spin rounded-full border-3 border-[#9A7B4F] border-t-transparent" />
        <p>Loading Proposals & Estimates...</p>
      </div>
    </div>
  );
}