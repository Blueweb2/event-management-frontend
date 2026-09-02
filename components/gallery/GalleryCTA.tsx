import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
} from "lucide-react";

export default function GalleryCTA() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-[#d9c5aa] bg-[#f5eee5]">
        <div className="px-6 py-12 text-center sm:px-10 sm:py-16">
          {/* Icon */}
          <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-xl bg-[#b8894b] text-white">
            <CalendarCheck size={24} />
          </div>

          {/* Heading */}
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#29241f] sm:text-4xl">
            Planning your own celebration?
          </h2>

          {/* Description */}
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#756d64] sm:text-base">
            Tell us about your event and let our team help
            you create something memorable.
          </p>

          {/* Button */}
          <Link
            href="/booking"
            className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#b8894b] px-6 text-sm font-semibold text-white transition hover:bg-[#9f733d] focus:outline-none focus:ring-2 focus:ring-[#b8894b]/30 focus:ring-offset-2"
          >
            Start Planning
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}