"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Download, BookOpen, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface HelpDropdownProps {
  onShowTutorial: () => void
  onLearnMore: () => void
}

export function HelpDropdown({ onShowTutorial, onLearnMore }: HelpDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "u") {
        event.preventDefault()
        setIsOpen(false)
      }
      if (event.ctrlKey && event.key === "t") {
        event.preventDefault()
        onShowTutorial()
        setIsOpen(false)
      }
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [ onShowTutorial])

  const menuItems = [
    
    {
      label: "Show Tutorial",
      shortcut: "Ctrl+T",
      icon: BookOpen,
      onClick: () => {
        onShowTutorial()
        setIsOpen(false)
      },
    },
    {
      label: "Learn More",
      shortcut: "",
      icon: ExternalLink,
      onClick: () => {
        onLearnMore()
        setIsOpen(false)
      },
    },
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors",
          isOpen ? "bg-orange-100 text-orange-700 font-medium" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        )}
      >
        <span className="flex items-center space-x-3">
          <BookOpen className="w-5 h-5" />
          <span>Help</span>
        </span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={index}
                onClick={item.onClick}
                className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{item.label}</span>
                </span>
                {item.shortcut && <span className="text-xs text-gray-400 font-mono">{item.shortcut}</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}