import Link from "next/link";
import {
  Bell,
  UserRound,
} from "lucide-react";

import { currentStaff } from "./constants";

export default function StaffHeader() {
  return (
    <header className="border-b border-[#e8e1d8] pb-5">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/staff"
          className="flex min-w-0 items-center gap-3"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f1e8dc] text-[#9a6c37]">
            <UserRound size={19} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#29241f]">
              {currentStaff.name}
            </p>

            <p className="truncate text-xs text-[#8d847b]">
              {currentStaff.role}
            </p>
          </div>
        </Link>

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e3dbd2] bg-white text-[#756d64] transition hover:bg-[#f8f4ee]"
        >
          <Bell size={18} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#b8894b] ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}