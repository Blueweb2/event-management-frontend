"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function SuperadminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/manager/staff?tab=managers");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#9A7B4F]/10 text-[#9A7B4F]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
      <p className="text-xs font-semibold text-gray-600">
        Redirecting to Staff Members & Department Managers console...
      </p>
    </div>
  );
}
