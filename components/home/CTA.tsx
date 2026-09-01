import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Sparkles,
} from "lucide-react";

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-[var(--cream)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      {/* Decorative Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-[var(--sage-light)]/50 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-[#eadbd5]/50 blur-3xl"
      />

      <div
        className={[
          "relative mx-auto max-w-7xl overflow-hidden",
          "rounded-[2rem]",
          "border border-[var(--sage-dark)]/10",
          "bg-[var(--sage-dark)]",
          "shadow-2xl shadow-[var(--sage-dark)]/10",
        ].join(" ")}
      >
        {/* Decorative Circles */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border border-white/10"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[var(--sage)]/20 blur-2xl"
        />

        {/* Content */}
        <div className="relative px-6 py-14 text-center sm:px-10 sm:py-16 lg:px-16 lg:py-20">

          {/* Icon */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[var(--sage-light)] ring-1 ring-white/10">
            <CalendarCheck
              size={27}
              strokeWidth={1.7}
            />
          </div>

          {/* Eyebrow */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5">
            <Sparkles
              size={13}
              className="text-[var(--sage-light)]"
            />

            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/75">
              Let's Create Something Special
            </span>
          </div>

          {/* Heading */}
          <h2
            className={[
              "mx-auto mt-5 max-w-3xl",
              "text-3xl font-semibold tracking-tight",
              "text-white",
              "sm:text-4xl lg:text-5xl",
            ].join(" ")}
          >
            Ready to plan your
            <span className="block font-normal italic text-[var(--sage-light)]">
              perfect event?
            </span>
          </h2>

          {/* Description */}
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
            Tell us about your event, choose a package,
            select your food and requirements, and let our
            team take care of the planning and execution.
          </p>

          {/* CTA */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">

            <Link
              href="/booking"
              className={[
                "inline-flex min-h-12 items-center justify-center gap-2",
                "rounded-xl",
                "bg-[var(--ivory)]",
                "px-7",
                "text-sm font-semibold",
                "text-[var(--sage-dark)]",
                "shadow-lg shadow-black/10",
                "transition-all duration-200",
                "hover:-translate-y-0.5",
                "hover:bg-white",
                "hover:shadow-xl",
              ].join(" ")}
            >
              Start Planning Your Event

              <ArrowRight
                size={18}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>

            <Link
              href="#packages"
              className={[
                "inline-flex min-h-12 items-center justify-center",
                "rounded-xl",
                "border border-white/15",
                "bg-white/5",
                "px-7",
                "text-sm font-medium",
                "text-white/85",
                "transition-all duration-200",
                "hover:bg-white/10",
                "hover:text-white",
              ].join(" ")}
            >
              Explore Packages
            </Link>
          </div>

          {/* Trust Text */}
          <div className="mt-8 flex flex-col items-center justify-center gap-2 text-xs text-white/45 sm:flex-row sm:gap-5">
            <span>✓ Customized event planning</span>
            <span className="hidden sm:block">•</span>
            <span>✓ Flexible guest counts</span>
            <span className="hidden sm:block">•</span>
            <span>✓ Food & setup management</span>
          </div>
        </div>
      </div>
    </section>
  );
}