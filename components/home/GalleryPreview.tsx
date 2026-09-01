import Link from "next/link";
import { ArrowRight, Images, Sparkles } from "lucide-react";

const gallery = [
  {
    title: "Wedding Celebration",
    category: "Wedding",
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Beautiful Reception",
    category: "Wedding",
    image:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Birthday Celebration",
    category: "Birthday",
    image:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Event Setup",
    category: "Decoration",
    image:
      "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1200&q=85",
  },
];

export default function GalleryPreview() {
  return (
    <section
      id="gallery"
      className="relative overflow-hidden bg-[var(--cream)] py-16 sm:py-20 lg:py-24"
    >
      {/* Decorative Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-0 h-80 w-80 rounded-full bg-[var(--sage-light)]/40 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 bottom-0 h-72 w-72 rounded-full bg-[#eadbd5]/40 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

          <div className="max-w-2xl">

            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3.5 py-1.5">
              <Sparkles
                size={13}
                className="text-[var(--sage)]"
              />

              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sage-dark)]">
                Our Work
              </span>
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
              Moments we've helped
              <span className="block font-normal italic text-[var(--sage)]">
                create.
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-base leading-7 text-[var(--taupe)]">
              A glimpse into celebrations, gatherings, and
              special moments we've helped bring to life.
            </p>
          </div>

          {/* Desktop Gallery Link */}
          <Link
            href="/gallery"
            className={[
              "hidden items-center gap-2",
              "text-sm font-semibold",
              "text-[var(--sage-dark)]",
              "transition-colors",
              "hover:text-[var(--sage)]",
              "sm:inline-flex",
            ].join(" ")}
          >
            View Full Gallery

            <ArrowRight
              size={17}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Gallery */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-4 lg:grid-cols-4">

          {gallery.map((item, index) => (
            <Link
              key={item.title}
              href="/gallery"
              className={[
                "group relative overflow-hidden",
                "rounded-2xl",
                "border border-[var(--border)]",
                "bg-white",
                "shadow-sm",
                "transition-all duration-300",
                "hover:-translate-y-1",
                "hover:shadow-xl hover:shadow-[var(--sage-dark)]/10",
                index === 0
                  ? "col-span-2 row-span-2 aspect-square"
                  : "aspect-square",
              ].join(" ")}
            >
              {/* Image */}
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className={[
                  "h-full w-full object-cover",
                  "transition-transform duration-700",
                  "group-hover:scale-105",
                ].join(" ")}
              />

              {/* Image Overlay */}
              <div
                className={[
                  "absolute inset-0",
                  "bg-gradient-to-t",
                  "from-black/75 via-black/10 to-transparent",
                  "opacity-80",
                  "transition-opacity duration-300",
                  "group-hover:opacity-100",
                ].join(" ")}
              />

              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">

                <div className="flex items-center justify-between gap-3">

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70 sm:text-xs">
                      {item.category}
                    </p>

                    <p
                      className={[
                        "mt-1 font-semibold text-white",
                        index === 0
                          ? "text-base sm:text-lg"
                          : "text-sm sm:text-base",
                      ].join(" ")}
                    >
                      {item.title}
                    </p>
                  </div>

                  {/* Hover Arrow */}
                  <div
                    className={[
                      "flex h-8 w-8 shrink-0 items-center justify-center",
                      "rounded-full",
                      "bg-white/15",
                      "text-white",
                      "backdrop-blur-sm",
                      "opacity-0",
                      "translate-y-2",
                      "transition-all duration-300",
                      "group-hover:translate-y-0",
                      "group-hover:opacity-100",
                    ].join(" ")}
                  >
                    <ArrowRight size={15} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile Gallery Link */}
        <div className="mt-7 flex justify-center sm:hidden">
          <Link
            href="/gallery"
            className={[
              "inline-flex min-h-11 items-center justify-center gap-2",
              "rounded-xl",
              "border border-[var(--border)]",
              "bg-white",
              "px-5",
              "text-sm font-semibold",
              "text-[var(--sage-dark)]",
              "shadow-sm",
              "transition-all duration-200",
              "hover:bg-[var(--ivory)]",
            ].join(" ")}
          >
            <Images size={17} />

            Explore Full Gallery

            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Bottom Note */}
        <div className="mt-8 hidden items-center justify-center gap-2 text-center sm:flex">
          <Images
            size={15}
            className="text-[var(--sage)]"
          />

          <p className="text-xs text-[var(--taupe)]">
            Explore weddings, birthdays, corporate events,
            decorations, and more.
          </p>
        </div>
      </div>
    </section>
  );
}