"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { UserDashboard} from "@/components/user-dashboard"
import { AdminDashboard } from "@/components/admin-dashboard"
import { ClientsPage } from "@/components/clients-page"
import { FacturePage } from "@/components/facture-page"
import { JournalPage } from "@/components/journal-page"
import { SettingsPage } from "@/components/settings-page"
import {StockPage } from "@/components/stock"

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
  createdBy: string
  userRole: "user" | "admin"
  discountAmount?: number
  discountType?: "percentage" | "fixed"
  vatNumber?: string
  notes?: string
}

export default function Home() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const rawPage = searchParams.get("page")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<"user" | "admin">("admin")
  const [userData, setUserData] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState("home")
  const [clientsData, setClientsData] = useState<Client[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [prefilledClient, setPrefilledClient] = useState<Client | null>(null)
  const [journalSearchTerm, setJournalSearchTerm] = useState("")

  // Load data from backend on authentication
  useEffect(() => {
    if (!isAuthenticated || !userData) return

    const loadData = async () => {
      try {
        console.log(`Loading data for ${userRole}: ${userData.email}`)

        // Load invoices from backend
        const invoicesResponse = await fetch("/api/invoices")
        const invoicesResult = await invoicesResponse.json()

        if (invoicesResult.success) {
          setInvoices(invoicesResult.data)
          console.log(`Loaded ${invoicesResult.data.length} invoices`)
        } else {
          console.log("Failed to load invoices:", invoicesResult.error)
          setInvoices([])
        }

        // Load contacts for users (admin manages users, not contacts)
        if (userRole === "user") {
          const contactsResponse = await fetch("/api/contacts")
          const contactsResult = await contactsResponse.json()

          if (contactsResult.success) {
            setClientsData(contactsResult.data)
            console.log(`Loaded ${contactsResult.data.length} contacts`)
          } else {
            console.log("Failed to load contacts:", contactsResult.error)
            setClientsData([])
          }
        } else {
          setClientsData([])
        }

        setIsDataLoaded(true)
      } catch (error) {
        console.log("Error loading data:", error)
        setInvoices([])
        setClientsData([])
        setIsDataLoaded(true)
      }
    }

    loadData()
  }, [isAuthenticated, userData, userRole])

  const handleLogin = (role: "user" | "admin", data: any) => {
    console.log("Login successful, setting user data:", role, data.email)
    setUserRole(role)
    setUserData(data)
    setIsAuthenticated(true)
    setCurrentPage("home")
  }

  const handleLogout = () => {
    console.log("Logging out user")
    setIsAuthenticated(false)
    setUserRole("admin")
    setUserData(null)
    router.push("/?page=home")
    setInvoices([])
    setClientsData([])
    setIsDataLoaded(false)
  }

  const handlePageChange = (page: string) => {
    if (!isAuthenticated) return

    if (page === "clients" && userRole !== "user") {
      console.log("Access denied: Clients page is user only")
      return
    }

    router.push(`/?page=${page}`)
  }

  const handleInvoiceCreate = (newInvoice: Invoice) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        try {
          const invoiceWithUser = {
            ...newInvoice,
            createdBy: userData.email,
            userRole: userRole,
          }

          const updatedInvoices = [invoiceWithUser, ...invoices]
          setInvoices(updatedInvoices)
          router.push("/?page=journal")
          resolve()
        } catch (error) {
          reject(error)
        }
      }, 1000)
    })
  }

  const handleInvoiceUpdate = (updatedInvoices: Invoice[]) => {
    setInvoices(updatedInvoices)
  }

  const handleInvoiceDelete = (invoiceId: string) => {
    const updatedInvoices = invoices.filter((inv) => inv.id !== invoiceId)
    setInvoices(updatedInvoices)
  }

  const handleClientUpdate = (updatedClients: Client[]) => {
    if (userRole === "user") {
      setClientsData(updatedClients)
    }
  }

  const handleClientDelete = (clientId: string) => {
    if (userRole === "user") {
      const updatedClients = clientsData.filter((client) => client.id !== clientId)
      setClientsData(updatedClients)
    }
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "clients":
        if (userRole === "user") {
          return (
            <ClientsPage
              userEmail={userData?.email}
              userRole={userRole}
              onCreateInvoice={handleCreateInvoiceForClient}
              onViewInvoices={handleViewClientInvoices}
            />
          )
        } else {
          router.push("/?page=home")
          return <AdminDashboard />
        }
      case "facture":
        return (
          <FacturePage
            clients={userRole === "user" ? clientsData : []}
            onInvoiceCreate={handleInvoiceCreate}
            onInvoiceUpdate={handleInvoiceUpdate}
            editInvoice={editingInvoice}
            prefilledClient={prefilledClient}
            userEmail={userData?.email}
            userRole={userRole}
          />
        )
      case "journal":
        return (
          <JournalPage
            invoices={invoices}
            onInvoiceUpdate={setInvoices}
            onInvoiceDelete={handleInvoiceDelete}
            onInvoiceEdit={handleInvoiceEdit}
            userRole={userRole}
            userData={userData}
            searchTerm={journalSearchTerm}
          />
        )
      case "stock":
        return <StockPage userRole={userRole} />
      case "settings":
        return <SettingsPage userRole={userRole} userEmail={userData?.email} />
      case "help":
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Help Center</h2>
            <p className="text-gray-600">Help documentation coming soon...</p>
          </div>
        )
      case "home":
      default:
        return userRole === "user" ? <UserDashboard /> : <AdminDashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole={userRole} currentPage={currentPage} onPageChange={handlePageChange} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userRole={userRole} userData={userData} onLogout={handleLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">{renderCurrentPage()}</main>
      </div>
    </div>
  )
}
