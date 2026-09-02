import {
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

import { currentStaff } from "@/components/staff/constants";

export default function StaffProfilePage() {
  return (
    <main className="py-5 sm:py-6">
      <div className="border-b border-[#e8e1d8] pb-6">
        <p className="text-sm font-semibold text-[#9a6c37]">
          Staff Portal
        </p>

        <h1 className="mt-1 text-2xl font-bold text-[#29241f] sm:text-3xl">
          My Profile
        </h1>

        <p className="mt-2 text-sm text-[#756d64]">
          View your staff account information.
        </p>
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
        <div className="bg-[#f7efe4] p-6">
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#a7773f] shadow-sm">
              <UserRound size={32} />
            </div>

            <div className="mt-4 sm:ml-5 sm:mt-0">
              <h2 className="text-xl font-bold text-[#29241f]">
                {currentStaff.name}
              </h2>

              <p className="mt-1 text-sm text-[#756d64]">
                {currentStaff.role}
              </p>

              <span className="mt-3 inline-flex rounded-full bg-[#edf5ed] px-3 py-1 text-xs font-semibold text-[#557555]">
                {currentStaff.employmentType} ·{" "}
                {currentStaff.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          <Info
            icon={<Phone size={17} />}
            label="Phone"
            value={currentStaff.phone}
          />

          <Info
            icon={<Mail size={17} />}
            label="Email"
            value={currentStaff.email}
          />

          <Info
            icon={<MapPin size={17} />}
            label="Location"
            value={currentStaff.location}
          />

          <Info
            icon={<UserRound size={17} />}
            label="Joined"
            value={currentStaff.joinedDate}
          />
        </div>
      </section>
    </main>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#fbf8f4] p-4">
      <div className="flex items-center gap-2 text-[#a7773f]">
        {icon}

        <span className="text-xs font-semibold uppercase tracking-wide text-[#9b938a]">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold text-[#403a34]">
        {value}
      </p>
    </div>
  );
}