import {
  Cake,
  Church,
  Gift,
  Heart,
  PartyPopper,
  Users,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";

interface EventType {
  name: string;
  description: string;
  icon: LucideIcon;
}

const eventTypes: EventType[] = [
  {
    name: "Weddings",
    description:
      "Beautifully planned celebrations filled with meaningful moments.",
    icon: Heart,
  },
  {
    name: "Birthdays",
    description:
      "Memorable celebrations thoughtfully planned for every age.",
    icon: Cake,
  },
  {
    name: "Engagements",
    description:
      "Celebrate the beginning of your journey with a special gathering.",
    icon: Gift,
  },
  {
    name: "Corporate Events",
    description:
      "Professional gatherings, meetings, celebrations, and team events.",
    icon: Users,
  },
  {
    name: "Religious Events",
    description:
      "Respectfully organized gatherings with carefully managed details.",
    icon: Church,
  },
  {
    name: "Private Functions",
    description:
      "Personalized celebrations designed around your requirements.",
    icon: PartyPopper,
  },
];

export default function EventTypes() {
  return (
    <section
      id="events"
      className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24"
    >
      {/* Decorative Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-10 h-80 w-80 rounded-full bg-[var(--sage-light)]/40 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 bottom-10 h-72 w-72 rounded-full bg-[#eadbd5]/30 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <div className="mx-auto max-w-2xl text-center">

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--ivory)] px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--sage)]" />

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sage-dark)]">
              Events We Handle
            </p>
          </div>

          {/* Heading */}
          <h2
            className={[
              "mt-4",
              "text-3xl font-semibold tracking-tight",
              "text-[var(--sage-dark)]",
              "sm:text-4xl lg:text-5xl",
            ].join(" ")}
          >
            Whatever the occasion,
            <span className="font-normal italic text-[var(--sage)]">
              {" "}we're ready.
            </span>
          </h2>

          {/* Description */}
          <p className="mt-4 text-base leading-7 text-[var(--taupe)]">
            From intimate gatherings to large celebrations,
            choose the event you're planning and we'll help
            you take care of the rest.
          </p>
        </div>

        {/* Event Cards */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          {eventTypes.map((event) => {
            const Icon = event.icon;

            return (
              <div
                key={event.name}
                className={[
                  "group relative overflow-hidden",
                  "rounded-2xl",
                  "border border-[var(--border)]",
                  "bg-[var(--cream)]",
                  "p-6",
                  "transition-all duration-300",
                  "hover:-translate-y-1",
                  "hover:border-[var(--sage)]/40",
                  "hover:shadow-xl hover:shadow-[var(--sage-dark)]/8",
                ].join(" ")}
              >
                {/* Top Accent */}
                <div
                  aria-hidden="true"
                  className={[
                    "absolute left-0 top-0 h-1 w-0",
                    "bg-[var(--sage)]",
                    "transition-all duration-300",
                    "group-hover:w-full",
                  ].join(" ")}
                />

                {/* Icon + Arrow */}
                <div className="flex items-start justify-between">

                  {/* Icon */}
                  <div
                    className={[
                      "flex h-12 w-12 items-center justify-center",
                      "rounded-xl",
                      "bg-[var(--sage-light)]",
                      "text-[var(--sage-dark)]",
                      "transition-all duration-300",
                      "group-hover:bg-[var(--sage-dark)]",
                      "group-hover:text-white",
                    ].join(" ")}
                  >
                    <Icon
                      size={22}
                      strokeWidth={1.7}
                    />
                  </div>

                  {/* Arrow */}
                  <div
                    className={[
                      "flex h-8 w-8 items-center justify-center",
                      "rounded-full",
                      "border border-[var(--border)]",
                      "text-[var(--taupe)]",
                      "opacity-0",
                      "translate-x-1 -translate-y-1",
                      "transition-all duration-300",
                      "group-hover:translate-x-0",
                      "group-hover:translate-y-0",
                      "group-hover:opacity-100",
                    ].join(" ")}
                  >
                    <ArrowUpRight
                      size={15}
                      strokeWidth={1.8}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="mt-6">

                  <h3 className="text-lg font-semibold text-[var(--sage-dark)]">
                    {event.name}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--taupe)]">
                    {event.description}
                  </p>
                </div>

                {/* Bottom Link */}
                <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-[var(--sage)]">
                  Plan this event

                  <ArrowUpRight
                    size={13}
                    className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <p className="text-sm text-[var(--taupe)]">
            Don't see your event type?
            <span className="ml-1 font-medium text-[var(--sage-dark)]">
              We can create a custom plan for you.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}