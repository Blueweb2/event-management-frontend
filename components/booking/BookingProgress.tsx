"use client";

import {
  Check,
  FileText,
  ReceiptText,
  Send,
  UserRound,
} from "lucide-react";

type BookingProgressProps = {
  currentStep: number;
};

const steps = [
  {
    number: 1,
    title: "Event Details",
    icon: FileText,
  },
  {
    number: 2,
    title: "Client Details",
    icon: UserRound,
  },
  {
    number: 3,
    title: "Services & Items",
    icon: ReceiptText,
  },
  {
    number: 4,
    title: "Estimate Preview",
    icon: Send,
  },
];

export default function BookingProgress({
  currentStep,
}: BookingProgressProps) {
  return (
    <div className="border-b border-[var(--border)] bg-white">
      <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-7">
        <div className="flex items-start justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;

            const isCompleted =
              currentStep > step.number;

            const isCurrent =
              currentStep === step.number;

            return (
              <div
                key={step.number}
                className="flex flex-1 items-start"
              >
                {/* Step + Label */}
                <div className="flex min-w-0 flex-1 flex-col items-center">
                  {/* Circle */}
                  <div
                    className={[
                      "flex h-10 w-10 shrink-0 items-center justify-center",
                      "rounded-full border-2 transition-all duration-200",
                      isCompleted
                        ? "border-[var(--sage-dark)] bg-[var(--sage-dark)] text-white"
                        : isCurrent
                          ? "border-[#b49a6a] bg-[#b49a6a] text-white"
                          : "border-gray-200 bg-white text-gray-400",
                    ].join(" ")}
                  >
                    {isCompleted ? (
                      <Check
                        size={17}
                        strokeWidth={2.5}
                      />
                    ) : (
                      <Icon
                        size={17}
                        strokeWidth={1.8}
                      />
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

                    <p
                      className={[
                        "mt-0.5 hidden text-[10px] sm:block",
                        isCurrent
                          ? "text-[var(--sage)]"
                          : "text-gray-400",
                      ].join(" ")}
                    >
                      Step {step.number}
                    </p>
                  </div>
                </div>

                {/* Connector */}
                {index < steps.length - 1 && (
                  <div className="mt-5 flex flex-1 items-center px-1 sm:px-3">
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}