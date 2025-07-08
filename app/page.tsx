"use client"

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

const getStorageKeys = (userRole: "user" | "admin", userEmail: string) => ({
  INVOICES: `client_facturation_invoices_${userRole}_${userEmail}`,
  CLIENTS: `client_facturation_clients_${userRole}`,
})

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<"user" | "admin">("admin")
  const [userData, setUserData] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState("home")
  const [clientsData, setClientsData] = useState<Client[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  // Load data from localStorage on component mount
  useEffect(() => {
    if (!isAuthenticated || !userData) return

    const loadStoredData = () => {
      try {
        console.log(`Loading stored data for ${userRole}: ${userData.email}`)

        const storageKeys = getStorageKeys(userRole, userData.email)

        // Load invoices
        const storedInvoices = localStorage.getItem(storageKeys.INVOICES)
        if (storedInvoices) {
          const parsedInvoices = JSON.parse(storedInvoices)
          setInvoices(parsedInvoices)
        } else {
          setInvoices([])
        }

        // Load clients (user only)
        if (userRole === "user") {
          const storedClients = localStorage.getItem(storageKeys.CLIENTS)
          if (storedClients) {
            const parsedClients = JSON.parse(storedClients)
            setClientsData(parsedClients)
          } else {
            const defaultClients: Client[] = [
              {
                id: "CLT-001",
                name: "John Smith",
                email: "john.smith@email.com",
                phone: "+1 (555) 123-4567",
                company: "Tech Solutions Inc",
                status: "Active",
                projects: 3,
                lastActivity: "2 days ago",
              },
              {
                id: "CLT-002",
                name: "Sarah Johnson",
                email: "sarah.j@company.com",
                phone: "+1 (555) 234-5678",
                company: "Marketing Pro",
                status: "Active",
                projects: 2,
                lastActivity: "1 week ago",
              },
              {
                id: "CLT-003",
                name: "Michael Brown",
                email: "m.brown@business.com",
                phone: "+1 (555) 345-6789",
                company: "Digital Dynamics",
                status: "Pending",
                projects: 1,
                lastActivity: "3 days ago",
              },
              {
                id: "CLT-004",
                name: "Emily Davis",
                email: "emily@startup.io",
                phone: "+1 (555) 456-7890",
                company: "INVERNI BW",
                status: "Active",
                projects: 5,
                lastActivity: "Today",
              },
              {
                id: "CLT-005",
                name: "Robert Wilson",
                email: "r.wilson@corp.com",
                phone: "+1 (555) 567-8901",
                company: "EVBALT Corp",
                status: "Inactive",
                projects: 1,
                lastActivity: "2 months ago",
              },
              {
                id: "CLT-006",
                name: "Lisa Anderson",
                email: "lisa@agency.com",
                phone: "+1 (555) 678-9012",
                company: "STATUE TEMPUR",
                status: "Active",
                projects: 4,
                lastActivity: "5 days ago",
              },
            ]
            setClientsData(defaultClients)
            localStorage.setItem(storageKeys.CLIENTS, JSON.stringify(defaultClients))
          }
        } else {
          setClientsData([])
        }

        setIsDataLoaded(true)
      } catch (error) {
        console.error("Error loading stored data:", error)
        setInvoices([])
        setIsDataLoaded(true)
      }
    }

    loadStoredData()
  }, [isAuthenticated, userData, userRole])

  // Save invoices to localStorage
  useEffect(() => {
    if (isDataLoaded && isAuthenticated && userData) {
      try {
        const storageKeys = getStorageKeys(userRole, userData.email)
        localStorage.setItem(storageKeys.INVOICES, JSON.stringify(invoices))
      } catch (error) {
        console.error("Error saving invoices to localStorage:", error)
      }
    }
  }, [invoices, isDataLoaded, isAuthenticated, userData, userRole])

  // Save clients to localStorage
  useEffect(() => {
    if (clientsData.length > 0 && userRole === "user" && userData) {
      try {
        const storageKeys = getStorageKeys(userRole, userData.email)
        localStorage.setItem(storageKeys.CLIENTS, JSON.stringify(clientsData))
      } catch (error) {
        console.error("Error saving clients to localStorage:", error)
      }
    }
  }, [clientsData, userRole, userData])

  const handleLogin = (role: "user" | "admin", data: any) => {
    setUserRole(role)
    setUserData(data)
    setIsAuthenticated(true)
    setCurrentPage("home")
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserRole("admin")
    setUserData(null)
    setCurrentPage("home")
    setInvoices([])
    setClientsData([])
    setIsDataLoaded(false)
  }

  const handlePageChange = (page: string) => {
    if (page === "clients" && userRole !== "user") {
      console.log("Access denied: Clients page is user only")
      return
    }
    setCurrentPage(page)
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
          setCurrentPage("journal")
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
              clients={clientsData}
              onClientUpdate={handleClientUpdate}
              onClientDelete={handleClientDelete}
            />
          )
        } else {
          setCurrentPage("home")
          return  <AdminDashboard />
        }
      case "facture":
        return <FacturePage clients={userRole === "user" ? clientsData : []} onInvoiceCreate={handleInvoiceCreate} />
      case "journal":
        return (
          <JournalPage
            invoices={invoices}
            onInvoiceUpdate={handleInvoiceUpdate}
            onInvoiceDelete={handleInvoiceDelete}
            userRole={userRole}
            userData={userData}
          />
        )
      case "settings":
        return <SettingsPage userRole={userRole} />
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
