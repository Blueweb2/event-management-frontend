"use client";

import {
  Check,
  FileText,
  ReceiptText,
  Send,
  UserRound,
  Utensils,
} from "lucide-react";

type BookingProgressProps = {
  currentStep: number;
};

const steps = [
  {
    number: 1,
    title: "Event",
    icon: FileText,
  },
  {
    number: 2,
    title: "Client",
    icon: UserRound,
  },
  {
    number: 3,
    title: "Food",
    icon: Utensils,
  },
  {
    number: 4,
    title: "Services",
    icon: ReceiptText,
  },
  {
    number: 5,
    title: "Estimate",
    icon: Send,
  },
];

export default function BookingProgress({
  currentStep,
}: BookingProgressProps) {
  return (
    <div className="border-b border-[var(--border)] bg-white">
      <div className="mx-auto max-w-4xl px-3 py-3 sm:px-6 sm:py-7">
        <div className="flex items-start justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;

            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;

            return (
              <div
                key={step.number}
                className="relative flex flex-1 flex-col items-center"
              >
                {/* Connector */}
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-5 w-full -translate-y-1/2">
                    <div
                      className={[
                        "h-0.5 w-full transition-all duration-300",
                        currentStep > step.number
                          ? "bg-[var(--sage-dark)]"
                          : "bg-gray-200",
                      ].join(" ")}
                    />
                  </div>
                )}

                {/* Circle */}
                <div
                  className={[
                    "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center",
                    "rounded-full border-2 transition-all duration-200",
                    isCompleted
                      ? "border-[var(--sage-dark)] bg-[var(--sage-dark)] text-white"
                      : isCurrent
                        ? "border-[#b49a6a] bg-[#b49a6a] text-white"
                        : "border-gray-200 bg-white text-gray-400",
                  ].join(" ")}
                >
                  {isCompleted ? (
                    <Check size={17} strokeWidth={2.5} />
                  ) : (
                    <Icon size={17} strokeWidth={1.8} />
                  )}
                </div>

                {/* Label */}
                <div className="mt-2 text-center">
                  <p
                    className={[
                      "text-[10px] font-medium sm:text-xs",
                      isCurrent || isCompleted
                        ? "text-[var(--sage-dark)]"
                        : "text-gray-400",
                    ].join(" ")}
                  >
                    {step.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}