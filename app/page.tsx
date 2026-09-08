import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0b0b0a] text-white">
      <section className="relative flex min-h-screen items-center overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/images/event-hero.jpg')",
          }}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/65" />

        {/* Subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/30" />

        {/* Content */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20 sm:px-10 lg:px-16">
          <div className="max-w-2xl">
            {/* Logo / Brand */}
            <p className="mb-10 text-center text-2xl font-light tracking-[0.35em] sm:text-3xl lg:text-left">
              PIRCELLO
            </p>

            {/* Heading */}
            <h1 className="text-5xl font-light leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Extraordinary
              <br />
              <span className="italic">Events</span>
              <br />
              Effortlessly
            </h1>

            {/* Description */}
            <p className="mt-7 max-w-lg text-base leading-7 text-white/70 sm:text-lg">
              Plan, manage, estimate, and deliver exceptional events with
              everything your team needs in one place.
            </p>

            {/* Divider */}
            <div className="my-8 h-px w-24 bg-[#c9a96e]" />

            {/* CTA */}
            <Link
              href="/login"
              className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#d2b47a] px-10 text-sm font-semibold text-[#17130d] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#e0c58f] hover:shadow-xl"
            >
              Get Started
            </Link>

            {/* Sign in */}
            <p className="mt-6 text-sm text-white/60">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-[#d2b47a] transition-colors hover:text-white"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom text */}
        <div className="absolute bottom-8 left-0 right-0 z-10">
          <p className="text-center text-xs tracking-[0.25em] text-white/50">
            PLAN &nbsp;·&nbsp; MANAGE &nbsp;·&nbsp; ESTIMATE &nbsp;·&nbsp; DELIVER
          </p>
        </div>
      </section>
    </main>
  );
}