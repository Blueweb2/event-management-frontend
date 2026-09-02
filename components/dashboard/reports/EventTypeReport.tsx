import {
  Cake,
  CalendarHeart,
  Building2,
  Heart,
  Users,
} from "lucide-react";

import { eventTypeReports } from "./constants";

const icons = {
  Wedding: Heart,
  Engagement: CalendarHeart,
  Birthday: Cake,
  "Corporate Event": Building2,
  "Family Function": Users,
};

export default function EventTypeReport() {
  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
      <div className="border-b border-[#eee8e1] p-5">
        <h2 className="text-base font-bold text-[#29241f]">
          Events by Type
        </h2>

        <p className="mt-1 text-xs text-[#8d847b]">
          See which event types are most popular.
        </p>
      </div>

      <div className="divide-y divide-[#eee8e1]">
        {eventTypeReports.map((item) => {
          const Icon =
            icons[item.type as keyof typeof icons] ?? CalendarHeart;

          return (
            <div
              key={item.type}
              className="p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
                  <Icon size={16} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-xs font-semibold text-[#29241f]">
                      {item.type}
                    </p>

                    <span className="text-xs font-bold text-[#5f574f]">
                      {item.count}
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eee8e1]">
                    <div
                      className="h-full rounded-full bg-[#b8894b]"
                      style={{
                        width: `${item.percentage}%`,
                      }}
                    />
                  </div>

                  <p className="mt-1 text-[10px] text-[#9b938a]">
                    {item.percentage}% of all events
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}