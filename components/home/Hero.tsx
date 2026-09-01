import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  MapPin,
  Users,
  Utensils,
  Sparkles,
} from "lucide-react";

export default function Hero() {
  return (
    <section
      className={[
        "relative overflow-hidden",
        "bg-[var(--ivory)]",
      ].join(" ")}
    >
      {/* Decorative Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[var(--sage-light)]/50 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#eadbd5]/40 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid min-h-[calc(100vh-4rem)] items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">

          {/* =====================================================
              LEFT CONTENT
          ====================================================== */}
          <div className="max-w-2xl">

            {/* Eyebrow */}
            <div
              className={[
                "mb-6 inline-flex items-center gap-2",
                "rounded-full",
                "border border-[var(--border)]",
                "bg-white/70",
                "px-3.5 py-2",
                "text-xs font-semibold uppercase tracking-[0.12em]",
                "text-[var(--sage-dark)]",
                "shadow-sm",
              ].join(" ")}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--sage-light)]">
                <Sparkles
                  size={12}
                  className="text-[var(--sage-dark)]"
                />
              </span>

              Events made beautifully simple
            </div>

            {/* Heading */}
            <h1
              className={[
                "max-w-2xl",
                "text-4xl font-semibold leading-[1.08]",
                "tracking-[-0.035em]",
                "text-[var(--sage-dark)]",
                "sm:text-5xl",
                "lg:text-6xl",
                "xl:text-7xl",
              ].join(" ")}
            >
              Your Event.
              <span className="mt-1 block font-normal italic text-[var(--sage)]">
                Our Responsibility.
              </span>
            </h1>

            {/* Description */}
            <p
              className={[
                "mt-6 max-w-xl",
                "text-base leading-7",
                "text-[var(--taupe)]",
                "sm:text-lg sm:leading-8",
              ].join(" ")}
            >
              From intimate celebrations to grand occasions,
              tell us what you need, choose your package, and
              let our team handle the details from planning
              to execution.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">

              {/* Primary */}
              <Link
                href="/booking"
                className={[
                  "group inline-flex min-h-12 items-center justify-center gap-2",
                  "rounded-full",
                  "bg-[var(--sage-dark)]",
                  "px-6",
                  "text-sm font-semibold",
                  "text-white",
                  "shadow-lg shadow-[var(--sage-dark)]/15",
                  "transition-all duration-200",
                  "hover:-translate-y-0.5",
                  "hover:bg-[var(--sage)]",
                  "hover:shadow-xl",
                  "active:translate-y-0",
                ].join(" ")}
              >
                Plan Your Event

                <ArrowRight
                  size={18}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>

              {/* Secondary */}
              <Link
                href="#packages"
                className={[
                  "inline-flex min-h-12 items-center justify-center",
                  "rounded-full",
                  "border border-[var(--border)]",
                  "bg-white/70",
                  "px-6",
                  "text-sm font-semibold",
                  "text-[var(--sage-dark)]",
                  "transition-all duration-200",
                  "hover:border-[var(--sage)]",
                  "hover:bg-[var(--sage-light)]/50",
                ].join(" ")}
              >
                Explore Packages
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3">

              <div className="flex items-center gap-2 text-sm text-[var(--taupe)]">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--sage-light)]">
                  <CalendarDays
                    size={15}
                    className="text-[var(--sage-dark)]"
                  />
                </span>

                Flexible Event Planning
              </div>

              <div className="flex items-center gap-2 text-sm text-[var(--taupe)]">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eadbd5]">
                  <Users
                    size={15}
                    className="text-[var(--rose)]"
                  />
                </span>

                Any Event Size
              </div>
            </div>
          </div>

          {/* =====================================================
              RIGHT BOOKING PREVIEW
          ====================================================== */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">

            {/* Decorative Circle */}
            <div
              aria-hidden="true"
              className={[
                "absolute -right-8 -top-8",
                "h-24 w-24 rounded-full",
                "border border-[var(--sage)]/20",
                "sm:h-32 sm:w-32",
              ].join(" ")}
            />

            {/* Main Card */}
            <div
              className={[
                "relative",
                "rounded-[2rem]",
                "border border-[var(--border)]",
                "bg-white",
                "p-5",
                "shadow-[0_24px_70px_rgba(65,75,57,0.12)]",
                "sm:p-7",
              ].join(" ")}
            >

              {/* Card Header */}
              <div className="flex items-start justify-between gap-4">

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--sage)]">
                    Start Planning
                  </p>

                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--sage-dark)]">
                    Your Event
                  </h2>

                  <p className="mt-1 text-sm text-[var(--taupe)]">
                    Tell us a little about your celebration.
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--sage-light)] text-[var(--sage-dark)]">
                  <CalendarDays
                    size={21}
                    strokeWidth={1.7}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="my-6 h-px bg-[var(--border)]" />

              {/* Form Preview */}
              <div className="space-y-5">

                {/* Event Type */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--taupe)]">
                    Event Type
                  </label>

                  <div
                    className={[
                      "flex items-center justify-between",
                      "rounded-xl",
                      "border border-[var(--border)]",
                      "bg-[var(--ivory)]",
                      "px-4 py-3.5",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                        <Sparkles
                          size={16}
                          className="text-[var(--sage)]"
                        />
                      </span>

                      <span className="text-sm font-medium text-[var(--sage-dark)]">
                        Wedding
                      </span>
                    </div>

                    <ChevronDown
                      size={17}
                      className="text-[var(--taupe)]"
                    />
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--taupe)]">
                    Number of Guests
                  </label>

                  <div
                    className={[
                      "flex items-center justify-between",
                      "rounded-xl",
                      "border border-[var(--border)]",
                      "bg-[var(--ivory)]",
                      "px-4 py-3.5",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                        <Users
                          size={16}
                          className="text-[var(--sage)]"
                        />
                      </span>

                      <span className="text-sm text-[var(--taupe)]">
                        Guests
                      </span>
                    </div>

                    <span className="text-sm font-semibold text-[var(--sage-dark)]">
                      250
                    </span>
                  </div>
                </div>

                {/* Package */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--taupe)]">
                    Package
                  </label>

                  <div
                    className={[
                      "flex items-center gap-3",
                      "rounded-xl",
                      "border border-[var(--sage)]/30",
                      "bg-[var(--sage-light)]/60",
                      "px-4 py-3.5",
                    ].join(" ")}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                      <CheckCircle2
                        size={17}
                        className="text-[var(--sage-dark)]"
                      />
                    </span>

                    <div>
                      <p className="text-sm font-semibold text-[var(--sage-dark)]">
                        Premium Package
                      </p>

                      <p className="mt-0.5 text-xs text-[var(--taupe)]">
                        A complete event experience
                      </p>
                    </div>
                  </div>
                </div>

                {/* Food & Location Mini Cards */}
                <div className="grid grid-cols-2 gap-3">

                  <div className="rounded-xl border border-[var(--border)] bg-[var(--ivory)] p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                      <Utensils
                        size={15}
                        className="text-[var(--sage)]"
                      />
                    </div>

                    <p className="mt-2 text-xs font-medium text-[var(--taupe)]">
                      Food
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-[var(--sage-dark)]">
                      Custom Menu
                    </p>
                  </div>

                  <div className="rounded-xl border border-[var(--border)] bg-[var(--ivory)] p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                      <MapPin
                        size={15}
                        className="text-[var(--rose)]"
                      />
                    </div>

                    <p className="mt-2 text-xs font-medium text-[var(--taupe)]">
                      Location
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-[var(--sage-dark)]">
                      Your Venue
                    </p>
                  </div>
                </div>

                {/* Continue Button */}
                <Link
                  href="/booking"
                  className={[
                    "group flex min-h-12 w-full items-center justify-center gap-2",
                    "rounded-full",
                    "bg-[var(--sage-dark)]",
                    "text-sm font-semibold text-white",
                    "transition-all duration-200",
                    "hover:bg-[var(--sage)]",
                  ].join(" ")}
                >
                  Continue Booking

                  <ArrowRight
                    size={17}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>

            {/* Floating Confirmation Card */}
            <div
              className={[
                "absolute -bottom-5 -left-3",
                "hidden rounded-2xl",
                "border border-[var(--border)]",
                "bg-white p-3.5",
                "shadow-xl",
                "sm:flex sm:items-center sm:gap-3",
                "lg:-left-8",
              ].join(" ")}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--sage-light)]">
                <CheckCircle2
                  size={18}
                  className="text-[var(--sage-dark)]"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-[var(--sage-dark)]">
                  Everything organized
                </p>

                <p className="mt-0.5 text-[11px] text-[var(--taupe)]">
                  Food • Staff • Duties • Expenses
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Decorative Edge */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-px bg-[var(--border)]"
      />
    </section>
  );
}