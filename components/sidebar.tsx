"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Home,
  Users,
  FileText,
  BookOpen,
  MessageSquare,
  BarChart3,
  Megaphone,
  CreditCard,
  Settings,
  HelpCircle,
} from "lucide-react"

interface SidebarProps {
  userRole: "admin" | "user"
  currentPage?: string
  onPageChange?: (page: string) => void
}

export function Sidebar({ userRole, currentPage = "home", onPageChange }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (item: string) => {
    setExpandedItems((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
  }

  const handlePageChange = (page: string) => {
    if (onPageChange) {
      onPageChange(page)
    }
  }

  const menuItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      active: currentPage === "home",
    },
    {
      id: "clients",
      label: "Clients",
      icon: Users,
      active: currentPage === "clients",
    },
    {
      id: "facture",
      label: "Facture",
      icon: FileText,
      active: currentPage === "facture",
    },
    {
      id: "journal",
      label: "Journal",
      icon: BookOpen,
      active: currentPage === "journal",
    },
    
  ]

  const helpItems = [
    {
      id: "setting",
      label: "Setting",
      icon: Settings,
      active: currentPage === "setting",
    },
    {
      id: "help",
      label: "Help",
      icon: HelpCircle,
      active: currentPage === "help",
    },
  ]

  return (
    <div className="w-64 bg-white shadow-lg h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CF</span>
          </div>
          <span className="text-xl font-bold text-gray-900">CLIENT FACTURATION</span>
        </div>
      </div>

      {/* General Menu */}
      <div className="flex-1 p-4">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">General Menu</h3>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.id}>
                <Button
                  variant={item.active ? "secondary" : "ghost"}
                  className={`w-full justify-start ${
                    item.active ? "bg-orange-50 text-orange-700 hover:bg-orange-100" : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => handlePageChange(item.id)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="flex-1 text-left">{item.label}</span>
                </Button>
              </div>
            ))}
          </nav>
        </div>

        {/* Help Center */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Help Center</h3>
          <nav className="space-y-1">
            {helpItems.map((item) => (
              <Button
                key={item.id}
                variant={item.active ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  item.active ? "bg-orange-50 text-orange-700 hover:bg-orange-100" : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => handlePageChange(item.id)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
              </Button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
