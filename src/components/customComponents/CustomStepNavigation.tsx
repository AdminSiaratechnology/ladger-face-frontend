import React from 'react'
import { Button } from '../ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CustomStepNavigationProps {
  currentStep: number
  totalSteps: number
  onNext?: () => void
  onPrevious?: () => void
  onSubmit?: () => void
  isLastStep?: boolean
  showPrevious?: boolean
  showNext?: boolean
  submitLabel?: string
  editing?: boolean
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
  submitLabel = 'Save Vendor',
  editing = false,
}) => {
  return (
    <div className="mt-6 md:mt-8 flex justify-between items-center pt-4 md:pt-6 border-t-2 border-gray-100">
      {/* Previous Button */}
      {showPrevious ? (
        <Button
          variant="outline"
          onClick={onPrevious}
          className="px-4 py-2.5 md:px-8 md:py-3 rounded-lg flex items-center gap-1 md:gap-2 border-2 hover:bg-gray-50 transition-all text-sm md:text-base"
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden xs:inline">Previous</span>
        </Button>
      ) : (
        <div /> // Keeps layout balanced if no Previous button
      )}

      {/* Step Info */}
      <div className="text-xs md:text-sm text-gray-500 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-full">
        <span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-blue-500 rounded-full animate-pulse" />
        Step {currentStep} of {totalSteps}
      </div>

      {/* Next / Submit Button */}
      {isLastStep ? (
        <Button
          onClick={onSubmit}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 md:px-8 md:py-3 rounded-lg flex items-center gap-1 md:gap-2 shadow-lg hover:shadow-xl transition-all text-sm md:text-base"
        >
          <span className="hidden xs:inline">
            {editing ? 'Update Vendor' : submitLabel}
          </span>
          <span className="xs:hidden">
            {editing ? 'Update' : 'Save'}
          </span>
        </Button>
      ) : showNext ? (
        <Button
          onClick={onNext}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 md:px-8 md:py-3 rounded-lg flex items-center gap-1 md:gap-2 shadow-lg hover:shadow-xl transition-all text-sm md:text-base"
        >
          <span className="hidden xs:inline">Next</span>
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
        </Button>
      ) : (
        <div /> // Keeps layout balanced if no Next button
      )}
    </div>
  )
}

export default CustomStepNavigation