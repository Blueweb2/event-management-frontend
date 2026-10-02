import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";

import Button from "@/components/ui/Button";

interface BookingNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  loading?: boolean;
  submitLabel?: string;
  submitIcon?: React.ReactNode;
}

export default function BookingNavigation({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  loading = false,
  submitLabel,
  submitIcon,
}: BookingNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <>
      {/* ==========================================
          MOBILE STICKY ACTION BAR (< 640px)
      ========================================== */}
      <div className="fixed inset-x-0 bottom-0 z-30 sm:hidden border-t border-[#e8e1d8] bg-white/95 px-4 py-3 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-2.5">
          {!isFirstStep && (
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="flex h-12 items-center justify-center gap-1.5 rounded-2xl border border-[#d8cfc4] bg-[#faf8f5] px-4 text-xs font-bold text-[#29241f] active:scale-95 transition disabled:opacity-50"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          )}

          {isLastStep ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading}
              className="flex-1 flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#29241f] px-5 text-xs font-extrabold text-white shadow-md active:scale-95 transition disabled:opacity-60"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                submitIcon || <Sparkles size={16} className="text-[#d8a86c]" />
              )}
              <span>{submitLabel || "Create Estimate"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              disabled={loading}
              className="flex-1 flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#29241f] px-5 text-xs font-extrabold text-white shadow-md active:scale-95 transition disabled:opacity-60"
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ==========================================
          DESKTOP INLINE ACTION BAR (>= 640px)
      ========================================== */}
      <div className="mt-8 hidden sm:flex items-center justify-between gap-3 border-t border-[#e8e1d8] pt-6">
        {/* Back */}
        {!isFirstStep ? (
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onBack}
            disabled={loading}
            icon={<ArrowLeft size={17} />}
          >
            Back
          </Button>
        ) : (
          <div />
        )}

        {/* Continue / Submit */}
        {isLastStep ? (
          <Button
            type="button"
            size="md"
            onClick={onSubmit}
            loading={loading}
            disabled={loading}
            icon={submitIcon || <Check size={17} />}
          >
            {submitLabel || "Submit Booking"}
          </Button>
        ) : (
          <Button
            type="button"
            size="md"
            onClick={onNext}
            disabled={loading}
            icon={<ArrowRight size={17} />}
          >
            Continue
          </Button>
        )}
      </div>
    </>
  );
}