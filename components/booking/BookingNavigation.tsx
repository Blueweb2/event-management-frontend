import {
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";

import Button from "@/components/ui/Button";

interface BookingNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  loading?: boolean;
}

export default function BookingNavigation({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  loading = false,
}: BookingNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="mt-8 flex items-center justify-between gap-3 border-t border-gray-200 pt-6">
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
          icon={<Check size={17} />}
        >
          Submit Booking
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
  );
}