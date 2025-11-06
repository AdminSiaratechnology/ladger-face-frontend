import React, { useState } from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface CustomStepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onPrevious?: () => void;
  onSubmit?: () => Promise<void> | void;
  isLastStep?: boolean;
  showPrevious?: boolean;
  showNext?: boolean;
  submitLabel?: string;
  editing?: boolean;
}

const CustomStepNavigation: React.FC<CustomStepNavigationProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSubmit,
  isLastStep = false,
  showPrevious = true,
  showNext = true,
  submitLabel = "Save Vendor",
  editing = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setShowProgress(true);

    try {
      await onSubmit?.();

      // Keep progress bar visible briefly for a smooth finish
      await new Promise((resolve) => setTimeout(resolve, 500));
      setShowProgress(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 🌈 Sleek Infinite Moving Bar */}
      {showProgress && (
        <div className="fixed top-0 left-0 w-full h-1.5 bg-gray-200 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-blue-500 animate-progressFlow" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/50 to-blue-400/0 animate-shimmer" />
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6 md:mt-8 relative w-full">
        <div className="flex justify-between items-center pt-4 md:pt-6 border-t-2 border-gray-100">
          {/* Previous */}
          {showPrevious ? (
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={isSubmitting}
              className="px-4 py-2.5 md:px-8 md:py-3 rounded-lg flex items-center gap-1 md:gap-2 border-2 hover:bg-gray-50 transition-all text-sm md:text-base"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden xs:inline">Previous</span>
            </Button>
          ) : (
            <div />
          )}

          {/* Step Info */}
          <div className="text-xs md:text-sm text-gray-500 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-full">
            <span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-blue-500 rounded-full animate-pulse" />
            Step {currentStep} of {totalSteps}
          </div>

          {/* Next / Submit */}
          <div className="flex items-center gap-2">
            {!isLastStep && showNext && (
              <Button
                onClick={onNext}
                disabled={isSubmitting}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 md:px-8 md:py-3 rounded-lg flex items-center gap-1 md:gap-2 shadow-lg hover:shadow-xl transition-all text-sm md:text-base"
              >
                <span className="hidden xs:inline">Next</span>
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            )}

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              } bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 md:px-8 md:py-3 rounded-lg flex items-center gap-1 md:gap-2 shadow-lg hover:shadow-xl transition-all text-sm md:text-base`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span className="hidden xs:inline">
                    {editing ? "Update" : submitLabel}
                  </span>
                  <span className="xs:hidden">{editing ? "Update" : "Save"}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomStepNavigation;
