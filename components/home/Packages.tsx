import {
  Check,
  Crown,
  Gem,
  Sparkles,
  ArrowRight,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

interface EventPackage {
  name: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  popular?: boolean;
}

const packages: EventPackage[] = [
  {
    name: "Starter",
    description:
      "A simple and practical choice for intimate and smaller gatherings.",
    icon: Sparkles,
    features: [
      "Basic food selection",
      "Standard event setup",
      "Serving staff",
      "Basic event assistance",
    ],
  },
  {
    name: "Medium",
    description:
      "A well-balanced package for comfortable and memorable celebrations.",
    icon: Crown,
    popular: true,
    features: [
      "Expanded food selection",
      "Complete venue setup",
      "Serving staff",
      "Event coordination",
      "Additional requirements",
    ],
  },
  {
    name: "Premium",
    description:
      "A complete event experience with personalized service and attention.",
    icon: Gem,
    features: [
      "Premium food selection",
      "Complete event setup",
      "Dedicated staff",
      "Full event coordination",
      "Customized requirements",
    ],
  },
];

export default function Packages() {
  return (
    <section
      id="packages"
      className="relative overflow-hidden bg-[var(--ivory)] py-16 sm:py-20 lg:py-24"
    >
      {/* Decorative Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-[var(--sage-light)]/40 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-[#eadbd5]/40 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <div className="mx-auto max-w-2xl text-center">

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--sage)]" />

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sage-dark)]">
              Our Packages
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
            Choose what suits
            <span className="block font-normal italic text-[var(--sage)]">
              your event.
            </span>
          </h2>

          {/* Description */}
          <p className="mt-4 text-base leading-7 text-[var(--taupe)]">
            Choose a package based on your event requirements,
            then customize the guest count, food, services,
            and other details during booking.
          </p>
        </div>

        {/* Packages */}
        <div className="mt-12 grid gap-6 lg:mt-14 lg:grid-cols-3 lg:items-stretch">
          {packages.map((pkg) => {
            const Icon = pkg.icon;

            return (
              <div
                key={pkg.name}
                className={[
                  "group relative flex flex-col",
                  "rounded-2xl",
                  "border",
                  "bg-white",
                  "p-6 sm:p-7",
                  "transition-all duration-300",
                  "hover:-translate-y-1",
                  "hover:shadow-xl hover:shadow-[var(--sage-dark)]/10",
                  pkg.popular
                    ? "border-[var(--sage)] shadow-lg shadow-[var(--sage-dark)]/10"
                    : "border-[var(--border)]",
                ].join(" ")}
              >

                {/* Popular Badge */}
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--sage-dark)] px-4 py-1.5 text-xs font-semibold text-white shadow-md">
                      <Crown size={13} />
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Top Content */}
                <div className="flex items-start justify-between">

                  {/* Icon */}
                  <div
                    className={[
                      "flex h-13 w-13 items-center justify-center",
                      "rounded-2xl",
                      "bg-[var(--sage-light)]",
                      "text-[var(--sage-dark)]",
                      "transition-all duration-300",
                      "group-hover:bg-[var(--sage-dark)]",
                      "group-hover:text-white",
                    ].join(" ")}
                  >
                    <Icon
                      size={24}
                      strokeWidth={1.7}
                    />
                  </div>

                  {/* Package Label */}
                  <span className="rounded-full bg-[var(--cream)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--taupe)]">
                    One Event
                  </span>
                </div>

                {/* Package Name */}
                <h3 className="mt-6 text-2xl font-semibold text-[var(--sage-dark)]">
                  {pkg.name}
                </h3>

                {/* Description */}
                <p className="mt-2 min-h-[72px] text-sm leading-6 text-[var(--taupe)]">
                  {pkg.description}
                </p>

                {/* Divider */}
                <div className="my-6 h-px bg-[var(--border)]" />

                {/* Includes */}
                <div>
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--sage-dark)]">
                    Package Includes
                  </p>

                  <ul className="space-y-3.5">
                    {pkg.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-[var(--taupe)]"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--sage-light)]">
                          <Check
                            size={12}
                            strokeWidth={2.5}
                            className="text-[var(--sage-dark)]"
                          />
                        </span>

                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Guest Customization */}
                <div className="mt-7 flex items-center gap-3 rounded-xl bg-[var(--cream)] px-4 py-3">
                  <Users
                    size={18}
                    className="shrink-0 text-[var(--sage)]"
                  />

                  <div>
                    <p className="text-xs font-semibold text-[var(--sage-dark)]">
                      Flexible Guest Count
                    </p>

                    <p className="mt-0.5 text-[11px] text-[var(--taupe)]">
                      Final cost is calculated based on your guests.
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href="/booking"
                  className={[
                    "group/cta mt-5 flex min-h-12 items-center justify-center gap-2",
                    "rounded-xl",
                    "text-sm font-semibold",
                    "transition-all duration-200",
                    pkg.popular
                      ? [
                          "bg-[var(--sage-dark)]",
                          "text-white",
                          "hover:bg-[var(--sage)]",
                        ].join(" ")
                      : [
                          "border border-[var(--border)]",
                          "bg-white",
                          "text-[var(--sage-dark)]",
                          "hover:border-[var(--sage)]",
                          "hover:bg-[var(--cream)]",
                        ].join(" "),
                  ].join(" ")}
                >
                  Choose {pkg.name}

                  <ArrowRight
                    size={17}
                    className="transition-transform duration-200 group-hover/cta:translate-x-1"
                  />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Bottom Information */}
        <div className="mx-auto mt-10 max-w-2xl text-center">
          <p className="text-xs leading-5 text-[var(--taupe)]">
            Package prices can vary depending on guest count,
            food selection, venue requirements, staffing, and
            additional services selected during booking.
          </p>
        </div>
      </div>
    </section>
  );
}