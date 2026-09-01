import {
  ClipboardList,
  ChefHat,
  CheckCircle2,
  Users,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Tell Us About Your Event",
    description:
      "Choose your event type, date, location, and expected number of guests.",
    icon: ClipboardList,
  },
  {
    number: "02",
    title: "Choose Your Package",
    description:
      "Select a package and customize your food, services, setup, and other requirements.",
    icon: Users,
  },
  {
    number: "03",
    title: "We Prepare Everything",
    description:
      "Our manager coordinates the food, staff, duties, setup, and all event requirements.",
    icon: ChefHat,
  },
  {
    number: "04",
    title: "Enjoy Your Event",
    description:
      "Our team takes care of the execution so you can focus on enjoying your special day.",
    icon: CheckCircle2,
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-[var(--cream)] py-16 sm:py-20 lg:py-24"
    >
      {/* Decorative Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[var(--sage-light)]/40 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-[#eadbd5]/30 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <div className="mx-auto max-w-2xl text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--sage)]" />

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sage-dark)]">
              How It Works
            </p>
          </div>

          <h2
            className={[
              "mt-4",
              "text-3xl font-semibold tracking-tight",
              "text-[var(--sage-dark)]",
              "sm:text-4xl lg:text-5xl",
            ].join(" ")}
          >
            Planning your event
            <span className="font-normal italic text-[var(--sage)]">
              {" "}is simple
            </span>
          </h2>

          <p className="mt-4 text-base leading-7 text-[var(--taupe)]">
            From your first selection to the final celebration,
            our team takes care of every important detail.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-12 lg:mt-16">

          {/* Connecting Line - Desktop */}
          <div
            aria-hidden="true"
            className="absolute left-[12.5%] right-[12.5%] top-8 hidden h-px bg-[var(--border)] lg:block"
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="group relative"
                >
                  {/* Card */}
                  <div
                    className={[
                      "relative h-full",
                      "rounded-2xl",
                      "border border-[var(--border)]",
                      "bg-white",
                      "p-6",
                      "shadow-sm",
                      "transition-all duration-300",
                      "hover:-translate-y-1",
                      "hover:shadow-xl hover:shadow-[var(--sage-dark)]/8",
                    ].join(" ")}
                  >

                    {/* Number + Icon */}
                    <div className="flex items-center justify-between">

                      {/* Icon */}
                      <div
                        className={[
                          "flex h-14 w-14 items-center justify-center",
                          "rounded-2xl",
                          "bg-[var(--sage-light)]",
                          "text-[var(--sage-dark)]",
                          "transition-all duration-300",
                          "group-hover:bg-[var(--sage-dark)]",
                          "group-hover:text-white",
                        ].join(" ")}
                      >
                        <Icon
                          size={23}
                          strokeWidth={1.8}
                        />
                      </div>

                      {/* Step Number */}
                      <span
                        className={[
                          "text-3xl font-semibold",
                          "tracking-tight",
                          "text-[var(--sage-light)]",
                          "transition-colors duration-300",
                          "group-hover:text-[var(--sage)]",
                        ].join(" ")}
                      >
                        {step.number}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="mt-6">

                      <h3 className="text-lg font-semibold leading-6 text-[var(--sage-dark)]">
                        {step.title}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-[var(--taupe)]">
                        {step.description}
                      </p>
                    </div>

                    {/* Mobile / Tablet Arrow */}
                    {index < steps.length - 1 && (
                      <div className="mt-5 flex items-center lg:hidden">
                        <div className="h-px flex-1 bg-[var(--border)]" />

                        <ArrowRight
                          size={15}
                          className="mx-3 text-[var(--sage)]"
                        />

                        <div className="h-px flex-1 bg-[var(--border)]" />
                      </div>
                    )}
                  </div>

                  {/* Desktop Connector Dot */}
                  {index < steps.length - 1 && (
                    <div
                      aria-hidden="true"
                      className={[
                        "absolute -right-2 top-8 z-10",
                        "hidden h-4 w-4",
                        "rounded-full",
                        "border-4 border-[var(--cream)]",
                        "bg-[var(--sage)]",
                        "lg:block",
                      ].join(" ")}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Message */}
        <div
          className={[
            "mx-auto mt-12 max-w-3xl",
            "rounded-2xl",
            "border border-[var(--border)]",
            "bg-[var(--ivory)]",
            "px-5 py-4",
            "text-center",
            "sm:mt-14 sm:px-8 sm:py-5",
          ].join(" ")}
        >
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
            <CheckCircle2
              size={18}
              className="shrink-0 text-[var(--sage)]"
            />

            <p className="text-sm text-[var(--taupe)]">
              You tell us what you need.
              <span className="font-semibold text-[var(--sage-dark)]">
                {" "}We take care of the rest.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}