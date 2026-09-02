"use client";

import {
  CalendarPlus,
  CheckCircle2,
  FileText,
  MessageSquare,
  CircleDollarSign,
  UserRound,
  Clock3,
} from "lucide-react";

export type CustomerActivityType =
  | "booking"
  | "payment"
  | "completed"
  | "note"
  | "contact"
  | "customer";

export interface CustomerActivity {
  id: string;
  type: CustomerActivityType;
  title: string;
  description: string;
  date: string;
  time?: string;
  user?: string;
}

interface CustomerActivityTimelineProps {
  activities?: CustomerActivity[];
}

const defaultActivities: CustomerActivity[] = [
  {
    id: "ACT-001",
    type: "booking",
    title: "New booking created",
    description:
      "Wedding Celebration booking was created with the Premium package.",
    date: "Sep 5, 2026",
    time: "11:30 AM",
    user: "Manager",
  },
  {
    id: "ACT-002",
    type: "payment",
    title: "Payment received",
    description:
      "Advance payment of ₹40,000 was received for BK-001.",
    date: "Sep 5, 2026",
    time: "12:15 PM",
    user: "Manager",
  },
  {
    id: "ACT-003",
    type: "note",
    title: "Customer note added",
    description:
      "Customer prefers traditional Kerala-style decoration.",
    date: "Sep 5, 2026",
    time: "1:20 PM",
    user: "Manager",
  },
  {
    id: "ACT-004",
    type: "contact",
    title: "Customer contacted",
    description:
      "Customer was contacted regarding the upcoming event requirements.",
    date: "Sep 4, 2026",
    time: "4:10 PM",
    user: "Staff",
  },
  {
    id: "ACT-005",
    type: "completed",
    title: "Previous event completed",
    description:
      "Engagement Ceremony was successfully completed.",
    date: "Jun 20, 2026",
    time: "9:30 PM",
    user: "Staff",
  },
];

const activityConfig: Record<
  CustomerActivityType,
  {
    icon: typeof CalendarPlus;
    iconClass: string;
    bgClass: string;
  }
> = {
  booking: {
    icon: CalendarPlus,
    iconClass: "text-[#a7773f]",
    bgClass: "bg-[#f7efe4]",
  },
  payment: {
    icon: CircleDollarSign,
    iconClass: "text-[#557555]",
    bgClass: "bg-[#edf5ed]",
  },
  completed: {
    icon: CheckCircle2,
    iconClass: "text-[#557555]",
    bgClass: "bg-[#edf5ed]",
  },
  note: {
    icon: FileText,
    iconClass: "text-[#8d6d4d]",
    bgClass: "bg-[#f4eee7]",
  },
  contact: {
    icon: MessageSquare,
    iconClass: "text-[#756d64]",
    bgClass: "bg-[#f1eeeb]",
  },
  customer: {
    icon: UserRound,
    iconClass: "text-[#756d64]",
    bgClass: "bg-[#f1eeeb]",
  },
};

export default function CustomerActivityTimeline({
  activities = defaultActivities,
}: CustomerActivityTimelineProps) {
  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
          <Clock3 size={19} />
        </div>

        <div>
          <h2 className="text-base font-semibold text-[#29241f]">
            Activity Timeline
          </h2>

          <p className="mt-0.5 text-sm text-[#8d847b]">
            Recent activity and customer interactions
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-6">
        {activities.length > 0 ? (
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute bottom-5 left-5 top-5 w-px bg-[#e8e1d8]" />

            <div className="space-y-7">
              {activities.map((activity) => {
                const config = activityConfig[activity.type];
                const Icon = config.icon;

                return (
                  <div
                    key={activity.id}
                    className="relative flex gap-4"
                  >
                    {/* Icon */}
                    <div
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bgClass}`}
                    >
                      <Icon
                        size={17}
                        className={config.iconClass}
                      />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <h3 className="text-sm font-semibold text-[#29241f]">
                          {activity.title}
                        </h3>

                        <span className="shrink-0 text-xs text-[#9b938a]">
                          {activity.date}
                          {activity.time && ` • ${activity.time}`}
                        </span>
                      </div>

                      <p className="mt-1 text-sm leading-6 text-[#756d64]">
                        {activity.description}
                      </p>

                      {activity.user && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-[#9b938a]">
                          <UserRound size={13} />
                          <span>{activity.user}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#ded5cb] bg-[#fdfbf8] px-5 py-10 text-center">
            <Clock3
              size={25}
              className="mx-auto text-[#b9b0a7]"
            />

            <p className="mt-3 text-sm font-medium text-[#756d64]">
              No activity yet
            </p>

            <p className="mt-1 text-xs text-[#9b938a]">
              Customer activity will appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}