"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { AdminDashboard } from "@/components/admin-dashboard"
import { UserDashboard } from "@/components/user-dashboard"
import { ClientsPage } from "@/components/clients-page"
import { FacturePage } from "@/components/facture-page"
import { JournalPage } from "@/components/journal-page"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: "Active" | "Inactive" | "Pending"
  projects: number
  lastActivity: string
}

interface PaymentHistory {
  id: string
  amount: number
  date: string
  method: string
  note?: string
}

interface Invoice {
  id: string
  number: string
  clientName: string
  clientId: string
  clientCompany: string
  clientEmail: string
  clientPhone: string
  status: "paid" | "partial" | "pending" | "refunded" | "cancelled"
  totalAmount: number
  subtotalAmount: number
  taxAmount: number
  taxRate: number
  paidAmount: number
  currency: string
  createdDate: string
  dueDate: string
  items: Array<{
    id: string
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  paymentHistory: PaymentHistory[]
}

// Local Storage Keys
const STORAGE_KEYS = {
  INVOICES: "client_facturation_invoices",
  CLIENTS: "client_facturation_clients",
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<"admin" | "user">("user")
  const [userData, setUserData] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState("home")

  // Shared client data across components
  const [clientsData, setClientsData] = useState<Client[]>([])

  // Invoice management state with persistent storage
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadStoredData = () => {
      try {
        console.log("Loading stored data...")

        // Load invoices
        const storedInvoices = localStorage.getItem(STORAGE_KEYS.INVOICES)
        if (storedInvoices) {
          const parsedInvoices = JSON.parse(storedInvoices)
          console.log("Loaded invoices from storage:", parsedInvoices)
          setInvoices(parsedInvoices)
        } else {
          console.log("No stored invoices found, using empty array")
          setInvoices([])
        }

        // Load clients
        const storedClients = localStorage.getItem(STORAGE_KEYS.CLIENTS)
        if (storedClients) {
          const parsedClients = JSON.parse(storedClients)
          console.log("Loaded clients from storage:", parsedClients)
          setClientsData(parsedClients)
        }

        setIsDataLoaded(true)
      } catch (error) {
        console.error("Error loading stored data:", error)
        setInvoices([])
        setIsDataLoaded(true)
      }
    }

    loadStoredData()
  }, [])

  // Save invoices to localStorage whenever invoices change (but only after initial load)
  useEffect(() => {
    if (isDataLoaded) {
      try {
        console.log("Saving invoices to storage:", invoices)
        localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices))
      } catch (error) {
        console.error("Error saving invoices to localStorage:", error)
      }
    }
  }, [invoices, isDataLoaded])

  // Save clients to localStorage whenever clients change
  useEffect(() => {
    if (clientsData.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clientsData))
      } catch (error) {
        console.error("Error saving clients to localStorage:", error)
      }
    }
  }, [clientsData])

  const handleLogin = (role: "admin" | "user", data: any) => {
    setUserRole(role)
    setUserData(data)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserRole("user")
    setUserData(null)
    setCurrentPage("home")
    // Note: We don't clear localStorage on logout to persist data
  }

  const handlePageChange = (page: string) => {
    setCurrentPage(page)
  }

  const handleInvoiceCreate = (newInvoice: Invoice) => {
    return new Promise((resolve) => setTimeout(resolve, 1000))
      .then(() => {
        // Add the new invoice to the list
        const updatedInvoices = [newInvoice, ...invoices]
        console.log("Creating new invoice:", newInvoice)
        console.log("Updated invoices list:", updatedInvoices)
        setInvoices(updatedInvoices)

        // Switch to journal page to show the created invoice
        setCurrentPage("journal")

        return Promise.resolve()
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }

  const handleInvoiceUpdate = (updatedInvoices: Invoice[]) => {
    console.log("Updating invoices:", updatedInvoices)
    setInvoices(updatedInvoices)
  }

  const handleInvoiceDelete = (invoiceId: string) => {
    console.log("Deleting invoice with ID:", invoiceId)
    const updatedInvoices = invoices.filter((inv) => inv.id !== invoiceId)
    console.log("Invoices after deletion:", updatedInvoices)
    setInvoices(updatedInvoices)
  }

  const handleClientUpdate = (updatedClients: Client[]) => {
    console.log("Updating clients:", updatedClients)
    setClientsData(updatedClients)
  }

  const handleClientDelete = (clientId: string) => {
    console.log("Deleting client with ID:", clientId)
    const updatedClients = clientsData.filter((client) => client.id !== clientId)
    console.log("Clients after deletion:", updatedClients)
    setClientsData(updatedClients)
  }

  // Clear all data function (for debugging)
  const clearAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.INVOICES)
    localStorage.removeItem(STORAGE_KEYS.CLIENTS)
    setInvoices([])
    console.log("All data cleared from localStorage")
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "clients":
        return (
          <ClientsPage clients={clientsData} onClientUpdate={handleClientUpdate} onClientDelete={handleClientDelete} />
        )
      case "facture":
        return <FacturePage clients={clientsData} onInvoiceCreate={handleInvoiceCreate} />
      case "journal":
        return (
          <JournalPage
            invoices={invoices}
            onInvoiceUpdate={handleInvoiceUpdate}
            onInvoiceDelete={handleInvoiceDelete}
          />
        )
      case "home":
      default:
        return userRole === "admin" ? <AdminDashboard /> : <UserDashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole={userRole} currentPage={currentPage} onPageChange={handlePageChange} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userRole={userRole} userData={userData} onLogout={handleLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {renderCurrentPage()}

          {/* Debug Panel - Remove this in production */}
          
        </main>
      </div>
    </div>
  )
}
