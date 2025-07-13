"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, ArrowRight, ArrowLeft } from "lucide-react"

interface TutorialStep {
  id: number
  title: string
  description: string
  emoji: string
  illustration: string
}

interface TutorialOverlayProps {
  isOpen: boolean
  onClose: () => void
  onSkip: () => void
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Hello!",
    description:
      "Thank you for giving me a chance. Let me show you how to create beautiful invoices in just 3 simple steps",
    emoji: "👋",
    illustration: "🎯",
  },
  {
    id: 2,
    title: "Step 1: Manage Your Clients",
    description:
      "Start by adding your clients in the 'Clients' section. You can store all their important information here.",
    emoji: "👥",
    illustration: "📋",
  },
  {
    id: 3,
    title: "Step 2: Create an Invoice",
    description: "Use the 'Invoice' section to quickly create professional invoices with all the necessary details.",
    emoji: "📄",
    illustration: "✨",
  },
  {
    id: 4,
    title: "Step 3: Track Your Invoices",
    description: "The 'Journal' allows you to track all your invoices, their status and payment history.",
    emoji: "📊",
    illustration: "📈",
  },
  {
    id: 5,
    title: "Congratulations!",
    description: "You're now ready to use Client Facturation like a pro! Feel free to explore all the features.",
    emoji: "🎉",
    illustration: "🚀",
  },
]

export function TutorialOverlay({ isOpen, onClose, onSkip }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)

  if (!isOpen) return null

  const step = tutorialSteps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === tutorialSteps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      onClose()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSkip = () => {
    setCurrentStep(0)
    onSkip()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Tutorial content */}
      <div className="relative bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Illustration */}
          <div className="mb-6">
            <div className="text-8xl mb-4">{step.illustration}</div>
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-200 to-purple-200 rounded-full flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full flex items-center justify-center">
                <span className="text-4xl">{step.emoji}</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{step.title}</h2>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto">{step.description}</p>

          {/* Progress dots */}
          <div className="flex justify-center space-x-2 mb-8">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep ? "bg-orange-500" : index < currentStep ? "bg-orange-300" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={handleSkip} className="text-gray-500 hover:text-gray-700">
              {isFirstStep ? "Skip" : "Back"}
            </Button>

            <div className="flex space-x-3">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}

              <Button onClick={handleNext} className="bg-orange-500 hover:bg-orange-600 text-white px-6">
                {isLastStep ? "Finish" : "Next"}
                {!isLastStep && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
