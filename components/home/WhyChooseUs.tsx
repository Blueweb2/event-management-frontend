import {
  Calculator,
  ClipboardCheck,
  Headset,
  Utensils,
  Users,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

interface Benefit {
  title: string;
  description: string;
  icon: LucideIcon;
}

const benefits: Benefit[] = [
  {
    title: "Flexible Packages",
    description:
      "Choose a package and customize it based on your event requirements.",
    icon: ClipboardCheck,
  },
  {
    title: "Food Planning",
    description:
      "Food requirements are planned according to your guest count and selected menu.",
    icon: Utensils,
  },
  {
    title: "Professional Staff",
    description:
      "Our team handles setup, serving, coordination, and other event duties.",
    icon: Users,
  },
  {
    title: "Clear Cost Planning",
    description:
      "Event expenses and requirements are carefully tracked for better cost control.",
    icon: Calculator,
  },
  {
    title: "Personal Assistance",
    description:
      "Our event managers coordinate your requirements from booking to completion.",
    icon: Headset,
  },
  {
    title: "Reliable Service",
    description:
      "We focus on making your event organized, comfortable, and memorable.",
    icon: ShieldCheck,
  },
];

export default function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-[var(--cream)] py-16 sm:py-20 lg:py-24">
      {/* Decorative Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-0 h-96 w-96 rounded-full bg-[var(--sage-light)]/40 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-[#eadbd5]/30 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16">

          {/* Left Content */}
          <div>
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3.5 py-1.5">
              <Sparkles
                size={13}
                className="text-[var(--sage)]"
              />

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sage-dark)]">
                Why Choose Us
              </p>
            </div>

            {/* Heading */}
            <h2
              className={[
                "mt-5",
                "text-3xl font-semibold tracking-tight",
                "text-[var(--sage-dark)]",
                "sm:text-4xl lg:text-5xl",
              ].join(" ")}
            >
              Everything you need for a
              <span className="block font-normal italic text-[var(--sage)]">
                beautifully managed event.
              </span>
            </h2>

            {/* Description */}
            <p className="mt-5 max-w-xl text-base leading-7 text-[var(--taupe)]">
              From choosing your package and food to coordinating
              staff and managing event requirements, we take care
              of the details so you can focus on your celebration.
            </p>

            {/* Highlight Box */}
            <div className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--sage-dark)] text-white">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <p className="font-semibold text-[var(--sage-dark)]">
                    One team. One event. Complete coordination.
                  </p>

                  <p className="mt-1.5 text-sm leading-6 text-[var(--taupe)]">
                    Your event manager coordinates the staff,
                    food, setup, duties, and requirements from
                    planning through completion.
                  </p>
                </div>
              </div>
            </div>

            {/* Small Stats */}
            <div className="mt-7 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-4">
                <p className="text-2xl font-semibold text-[var(--sage-dark)]">
                  100%
                </p>

                <p className="mt-1 text-xs text-[var(--taupe)]">
                  Personalized planning
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-4">
                <p className="text-2xl font-semibold text-[var(--sage-dark)]">
                  1 Team
                </p>

                <p className="mt-1 text-xs text-[var(--taupe)]">
                  From booking to event
                </p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className={[
                    "group relative",
                    "rounded-2xl",
                    "border border-[var(--border)]",
                    "bg-white",
                    "p-5 sm:p-6",
                    "transition-all duration-300",
                    "hover:-translate-y-1",
                    "hover:shadow-xl hover:shadow-[var(--sage-dark)]/10",
                  ].join(" ")}
                >
                  {/* Icon */}
                  <div className="flex items-start justify-between">
                    <div
                      className={[
                        "flex h-11 w-11 items-center justify-center",
                        "rounded-xl",
                        "bg-[var(--sage-light)]",
                        "text-[var(--sage-dark)]",
                        "transition-all duration-300",
                        "group-hover:bg-[var(--sage-dark)]",
                        "group-hover:text-white",
                      ].join(" ")}
                    >
                      <Icon
                        size={20}
                        strokeWidth={1.8}
                      />
                    </div>

                    <ArrowUpRight
                      size={17}
                      className={[
                        "text-[var(--border)]",
                        "transition-all duration-300",
                        "group-hover:-translate-y-0.5",
                        "group-hover:translate-x-0.5",
                        "group-hover:text-[var(--sage)]",
                      ].join(" ")}
                    />
                  </div>

                  {/* Content */}
                  <h3 className="mt-5 font-semibold text-[var(--sage-dark)]">
                    {benefit.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--taupe)]">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}