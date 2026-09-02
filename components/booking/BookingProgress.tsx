import { Check } from "lucide-react";
import { bookingSteps } from "./constants";

interface BookingProgressProps {
  currentStep: number;
}

export default function BookingProgress({
  currentStep,
}: BookingProgressProps) {
  return (
    <section className="border-b border-[#e8e1d8] bg-white">
      <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex items-start">
          {bookingSteps.map((step, index) => {
            const Icon = step.icon;

            const completed = currentStep > step.id;
            const active = currentStep === step.id;

            return (
              <div
                key={step.id}
                className="flex min-w-0 flex-1 items-start"
              >
                {/* Step */}
                <div className="flex min-w-0 flex-col items-center">
                  <div
                    className={[
                      "flex h-10 w-10 shrink-0 items-center justify-center",
                      "rounded-full border-2 transition-all duration-200",
                      completed
                        ? "border-[#b8894b] bg-[#b8894b] text-white"
                        : active
                          ? "border-[#b8894b] bg-[#fbf5ec] text-[#b8894b] shadow-sm"
                          : "border-[#ddd5cb] bg-white text-[#aaa198]",
                    ].join(" ")}
                  >
                    {completed ? (
                      <Check size={18} strokeWidth={2.5} />
                    ) : (
                      <Icon size={18} />
                    )}
                  </div>

                  <div className="mt-2 text-center">
                    <p
                      className={[
                        "text-[11px] font-semibold sm:text-xs",
                        active || completed
                          ? "text-[#8a6435]"
                          : "text-[#9b938a]",
                      ].join(" ")}
                    >
                      <span className="sm:hidden">
                        {step.shortTitle}
                      </span>

                      <span className="hidden sm:inline">
                        {step.title}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Connector */}
                {index < bookingSteps.length - 1 && (
                  <div
                    className={[
                      "mt-5 mx-2 h-0.5 flex-1 rounded-full transition-colors duration-300 sm:mx-4",
                      completed
                        ? "bg-[#b8894b]"
                        : "bg-[#e5ded5]",
                    ].join(" ")}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}