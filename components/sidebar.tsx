"use client"

import { useState } from "react"
import { Home, Users, FileText, BookOpen, Settings, BoxIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { HelpDropdown } from "@/components/help-dropdown"
import { TutorialOverlay } from "@/components/tutorial-overlay"
import { LearnMoreModal } from "@/components/learn-more-modal"
import { useTranslations } from 'next-intl'
interface SidebarProps {
  userRole: "user" | "admin" | null
  currentPage: string
  onPageChange: (page: string) => void
}

export function Sidebar({ userRole, currentPage, onPageChange }: SidebarProps) {
  const t  = useTranslations("sidebare")
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showLearnMore, setShowLearnMore] = useState(false)

  const menuItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      available: true,
    },
    {
      id: "clients",
      label: "Clients",
      icon: Users,
      available: userRole === "user",
    },
    {
      id: "facture",
      label: "Invoice",
      icon: FileText,
      available: true,
    },
    {
      id: "journal",
      label: "Journal",
      icon: BookOpen,
      available: true,
    },
    {
      id: "stock",
      label: "Stock",
      icon: BoxIcon,
      available: userRole === "user",
    },
  ]

  const bottomMenuItems = [
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      available: true,
    },
  ]

  const handleShowTutorial = () => {
    setShowTutorial(true)
  }

  const handleCheckUpdates = () => {
    setShowUpdateModal(true)
  }

  const handleLearnMore = () => {
    setShowLearnMore(true)
  }

  const handleTutorialSkip = () => {
    setShowTutorial(false)
    onPageChange("home")
  }

  return (
    <>
      <div className="bg-white w-64 min-h-screen shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm"> CF</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{t("Client Facturation")}</h1>
              <p className="text-xs text-gray-500 capitalize">{userRole} {t("Dashboard")}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems
              .filter((item) => item.available)
              .map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onPageChange(item.id)}
                      className={cn(
                        "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors",
                        currentPage === item.id
                          ? "bg-orange-100 text-orange-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{t(item.label)}</span>
                    </button>
                  </li>
                )
              })}
          </ul>
        </nav>

        <div className="p-4 border-t">
          <ul className="space-y-2">
            {bottomMenuItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onPageChange(item.id)}
                    className={cn(
                      "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors",
                      currentPage === item.id
                        ? "bg-orange-100 text-orange-700 font-medium"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{t(item.label)}</span>
                  </button>
                </li>
              )
            })}

            <li>
              <HelpDropdown
                onShowTutorial={handleShowTutorial}
                onLearnMore={handleLearnMore}
              />
            </li>
          </ul>
        </div>
      </div>

      {/* Modals and Overlays */}

      <TutorialOverlay isOpen={showTutorial} onClose={() => setShowTutorial(false)} onSkip={handleTutorialSkip} />

      <LearnMoreModal isOpen={showLearnMore} onClose={() => setShowLearnMore(false)} />
    </>
  )
}
