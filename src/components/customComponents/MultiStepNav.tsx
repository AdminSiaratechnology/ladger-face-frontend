import React, { useEffect, useRef } from 'react'

export interface Step {
  id: string
  label: string
}

export interface StepIcons {
  [key: string]: React.ReactNode
}

interface MultiStepNavProps {
  steps: Step[]
  currentStep: string
  onStepChange: (stepId: string) => void
  stepIcons: StepIcons
}

const MultiStepNav: React.FC<MultiStepNavProps> = ({ steps, currentStep, onStepChange, stepIcons }) => {
  const currentIndex = steps.findIndex(step => step.id === currentStep)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  // Scroll active step into view
  useEffect(() => {
    const currentStepRef = stepRefs.current[currentIndex]
    if (currentStepRef) {
      currentStepRef.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }
  }, [currentIndex])

  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-cyan-50 to-blue-50 px-3 py-3 rounded-lg overflow-x-auto shadow-sm scrollbar-hide min-h-[70px]">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div 
            ref={el => stepRefs.current[index] = el}
            className="flex flex-col items-center min-w-[70px] flex-1 scroll-mx-3"
          >
            <button
              onClick={() => onStepChange(step.id)}
              className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 ${
                index < currentIndex
                  ? 'bg-green-500 text-white shadow scale-105'
                  : index === currentIndex
                  ? 'bg-blue-500 text-white shadow-md scale-110 ring-2 ring-blue-200'
                  : 'bg-white text-gray-400 shadow border border-gray-200'
              }`}
            >
              {index < currentIndex ? (
                <svg 
                  className="w-3 h-3 flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <div className="flex items-center justify-center w-4 h-4">
                  {stepIcons[step.id]}
                </div>
              )}
            </button>
            <span
              className={`mt-1 text-xs font-medium text-center px-1 transition-colors whitespace-nowrap ${
                index === currentIndex
                  ? 'text-blue-600 font-semibold'
                  : index < currentIndex
                  ? 'text-green-600'
                  : 'text-gray-500'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 min-w-[15px] ${
                index < currentIndex ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export default MultiStepNav