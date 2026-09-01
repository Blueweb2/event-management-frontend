import {
  Quote,
  Star,
  Sparkles,
} from "lucide-react";

const reviews = [
  {
    name: "Anjali & Family",
    event: "Wedding",
    review:
      "The entire event was handled beautifully. The food, setup, and staff service were excellent.",
  },
  {
    name: "Rahul",
    event: "Birthday Celebration",
    review:
      "Everything was well organized from start to finish. We could enjoy the event without worrying about the arrangements.",
  },
  {
    name: "Meera",
    event: "Engagement",
    review:
      "The team understood exactly what we wanted and made the celebration very special for our family.",
  },
];

export default function Reviews() {
  return (
    <section
      id="reviews"
      className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24"
    >
      {/* Decorative Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-10 h-80 w-80 rounded-full bg-[var(--sage-light)]/40 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 bottom-0 h-72 w-72 rounded-full bg-[#eadbd5]/30 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--cream)] px-3.5 py-1.5">
            <Sparkles
              size={13}
              className="text-[var(--sage)]"
            />

            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sage-dark)]">
              Customer Reviews
            </span>
          </div>

          <h2
            className={[
              "mt-4",
              "text-3xl font-semibold tracking-tight",
              "text-[var(--sage-dark)]",
              "sm:text-4xl lg:text-5xl",
            ].join(" ")}
          >
            Loved by families,
            <span className="block font-normal italic text-[var(--sage)]">
              remembered forever.
            </span>
          </h2>

          <p className="mt-4 text-base leading-7 text-[var(--taupe)]">
            We believe the best measure of a successful event
            is how our customers remember it.
          </p>
        </div>

        {/* Reviews */}
        <div className="mt-12 grid gap-6 md:grid-cols-3 lg:mt-14">
          {reviews.map((review) => (
            <article
              key={review.name}
              className={[
                "group relative flex flex-col",
                "rounded-2xl",
                "border border-[var(--border)]",
                "bg-[var(--ivory)]",
                "p-6 sm:p-7",
                "transition-all duration-300",
                "hover:-translate-y-1",
                "hover:bg-white",
                "hover:shadow-xl hover:shadow-[var(--sage-dark)]/10",
              ].join(" ")}
            >
              {/* Quote Icon */}
              <div className="flex items-start justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--sage-light)] text-[var(--sage-dark)]">
                  <Quote
                    size={21}
                    strokeWidth={1.7}
                  />
                </div>

                {/* Rating */}
                <div className="flex items-center gap-0.5 rounded-full bg-white px-2.5 py-1.5 shadow-sm">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      size={13}
                      strokeWidth={1.5}
                      className="fill-[#D4A84F] text-[#D4A84F]"
                    />
                  ))}
                </div>
              </div>

              {/* Review */}
              <p
                className={[
                  "mt-6 flex-1",
                  "text-sm leading-7",
                  "text-[var(--taupe)]",
                ].join(" ")}
              >
                “{review.review}”
              </p>

              {/* Customer */}
              <div className="mt-7 border-t border-[var(--border)] pt-5">

                <div className="flex items-center gap-3">

                  {/* Avatar */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--sage-dark)] text-sm font-semibold text-white">
                    {review.name.charAt(0)}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[var(--sage-dark)]">
                      {review.name}
                    </p>

                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-[var(--sage)]" />

                      <p className="text-xs text-[var(--taupe)]">
                        {review.event}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Trust Message */}
        <div className="mt-10 flex flex-col items-center justify-center gap-2 text-center sm:flex-row">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={15}
                strokeWidth={1.5}
                className="fill-[#D4A84F] text-[#D4A84F]"
              />
            ))}
          </div>

          <span className="hidden text-[var(--border)] sm:block">
            •
          </span>

          <p className="text-xs text-[var(--taupe)]">
            Every celebration deserves thoughtful planning.
          </p>
        </div>
      </div>
    </section>
  );
}