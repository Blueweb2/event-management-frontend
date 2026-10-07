"use client";

import {
  Check,
  FileText,
  ReceiptText,
  Send,
  UserRound,
  Utensils,
  ChevronRight,
} from "lucide-react";

type BookingProgressProps = {
  currentStep: number;
  onStepClick?: (stepNumber: number) => void;
};

const steps = [
  {
    number: 1,
    title: "Event",
    fullTitle: "Event Details",
    icon: FileText,
  },
  {
    number: 2,
    title: "Client",
    fullTitle: "Client Information",
    icon: UserRound,
  },
  {
    number: 3,
    title: "Food",
    fullTitle: "Food & Catering",
    icon: Utensils,
  },
  {
    number: 4,
    title: "Services",
    fullTitle: "Services & Equipment",
    icon: ReceiptText,
  },
  {
    number: 5,
    title: "Estimate",
    fullTitle: "Review & Final Estimate",
    icon: Send,
  },
];

export default function BookingProgress({
  currentStep,
  onStepClick,
}: BookingProgressProps) {
  const activeStepObj = steps.find((s) => s.number === currentStep) || steps[0];
  const ActiveIcon = activeStepObj.icon;
  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="rounded-2xl border border-[#e8e1d8] bg-white shadow-xs overflow-hidden">
      {/* ==========================================
          MOBILE VIEW (< 640px)
      ========================================== */}
      <div className="sm:hidden px-4 py-3.5 bg-gradient-to-b from-white to-[#faf8f5]">
        {/* Step Counter & Active Name */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#29241f] text-[#d8a86c] shadow-xs">
              <ActiveIcon size={16} />
            </span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#9A7B4F]">
                Step {currentStep} of {steps.length}
              </p>
              <h2 className="text-sm font-black text-[#29241f] leading-tight">
                {activeStepObj.fullTitle}
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="rounded-full bg-[#29241f]/5 px-2.5 py-1 text-[10px] font-bold text-[#29241f]">
              {Math.round((currentStep / steps.length) * 100)}% Complete
            </span>
          </div>
        </div>

        {/* Segmented Interactive Step Pills */}
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {steps.map((step) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;

            return (
              <button
                type="button"
                key={step.number}
                onClick={() => {
                  if (onStepClick && step.number < currentStep) {
                    onStepClick(step.number);
                  }
                }}
                disabled={step.number > currentStep}
                className="group flex flex-col items-center gap-1 cursor-pointer disabled:cursor-default"
                aria-label={`Step ${step.number}: ${step.title}`}
              >
                <div
                  className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                    isCompleted
                      ? "bg-emerald-600"
                      : isCurrent
                      ? "bg-[#29241f]"
                      : "bg-gray-200"
                  }`}
                />
                <span
                  className={`text-[9px] font-bold transition ${
                    isCurrent
                      ? "text-[#29241f]"
                      : isCompleted
                      ? "text-emerald-700"
                      : "text-gray-400"
                  }`}
                >
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==========================================
          TABLET & DESKTOP VIEW (>= 640px)
      ========================================== */}
      <div className="hidden sm:block mx-auto max-w-4xl px-6 py-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;

            return (
              <div
                key={step.number}
                className="relative flex flex-1 flex-col items-center"
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-5 w-full -translate-y-1/2 px-2">
                    <div
                      className={`h-0.5 w-full transition-all duration-300 ${
                        currentStep > step.number
                          ? "bg-[#29241f]"
                          : "bg-gray-200"
                      }`}
                    />
                  </div>
                )}

                {/* Circle Icon */}
                <button
                  type="button"
                  onClick={() => {
                    if (onStepClick && step.number < currentStep) {
                      onStepClick(step.number);
                    }
                  }}
                  disabled={step.number > currentStep}
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 transition-all duration-200 shadow-2xs ${
                    isCompleted
                      ? "border-emerald-600 bg-emerald-600 text-white cursor-pointer hover:bg-emerald-700"
                      : isCurrent
                      ? "border-[#29241f] bg-[#29241f] text-white shadow-md scale-105"
                      : "border-gray-200 bg-white text-gray-400 cursor-default"
                  }`}
                >
                  {isCompleted ? (
                    <Check size={18} strokeWidth={3} />
                  ) : (
                    <Icon size={17} strokeWidth={2} />
                  )}
                </button>

                {/* Label */}
                <div className="mt-2 text-center">
                  <p
                    className={`text-xs font-bold transition ${
                      isCurrent
                        ? "text-[#29241f]"
                        : isCompleted
                        ? "text-emerald-800"
                        : "text-gray-400"
                    }`}
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