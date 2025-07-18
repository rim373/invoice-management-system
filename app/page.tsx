"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { UserDashboard } from "@/components/user-dashboard"
import { AdminDashboard } from "@/components/admin-dashboard"
import { ClientsPage } from "@/components/clients-page"
import { FacturePage } from "@/components/facture-page"
import { JournalPage } from "@/components/journal-page"
import { SettingsPage } from "@/components/settings-page"
import { StockPage } from "@/components/stock"
import { getCurrentUser, logoutUser, startActivityTracking, stopActivityTracking, checkAuthStatus } from "@/lib/auth" // Import checkAuthStatus

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
  const [isLoadingAuth, setIsLoadingAuth] = useState(true) // New loading state for auth

  // Initial authentication check on component mount
  useEffect(() => {
    const authenticate = async () => {
      setIsLoadingAuth(true)
      const user = await checkAuthStatus(
        (user) => {
          setIsAuthenticated(true)
          setUserRole(user.role)
          setUserData(user)
          startActivityTracking(
            () => {
              console.warn("Session will expire soon due to inactivity.")
            },
            () => {
              console.log("Logging out due to inactivity.")
              handleLogout()
            },
            async () => {
              // This callback is for the periodic check
              const currentUser = await getCurrentUser()
              if (!currentUser) {
                console.log("Session expired or invalid during periodic check, logging out.")
                handleLogout()
              }
            },
          )
        },
        () => {
          setIsAuthenticated(false)
          setUserRole("admin") // Default role if not authenticated
          setUserData(null)
          stopActivityTracking()
        },
      )
      setIsLoadingAuth(false)
    }

    authenticate()

    // Cleanup on unmount
    return () => {
      stopActivityTracking()
    }
  }, [])

  // Load data from backend on authentication
  useEffect(() => {
    if (!isAuthenticated || !userData || isLoadingAuth) return // Wait for auth to load

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
  }, [isAuthenticated, userData, userRole, isLoadingAuth]) // Add isLoadingAuth to dependencies

  const handleLogin = (role: "user" | "admin", data: any) => {
    console.log("Login successful, setting user data:", role, data.email)
    setUserRole(role)
    setUserData(data)
    setIsAuthenticated(true)
    setCurrentPage("home")
    startActivityTracking(
      () => {
        console.warn("Session will expire soon due to inactivity.")
      },
      () => {
        console.log("Logging out due to inactivity.")
        handleLogout()
      },
      async () => {
        // This callback is for the periodic check
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          console.log("Session expired or invalid during periodic check, logging out.")
          handleLogout()
        }
      },
    )
  }

  const handleLogout = async () => {
    console.log("Logging out user")
    await logoutUser() // Call the logout function from lib/auth.ts
    setIsAuthenticated(false)
    setUserRole("admin")
    setUserData(null)
    setCurrentPage("home")
    setInvoices([])
    setClientsData([])
    setIsDataLoaded(false)
    setEditingInvoice(null)
    setPrefilledClient(null)
    setJournalSearchTerm("")
    stopActivityTracking()
  }

  const handlePageChange = (page: string) => {
    if (page === "clients" && userRole !== "user") {
      console.log("Access denied: Clients page is user only")
      return
    }
    console.log("Changing page to:", page)
    setCurrentPage(page)

    // Clear editing invoice and prefilled client when changing pages
    if (page !== "facture") {
      setEditingInvoice(null)
      setPrefilledClient(null)
    }

    // Clear journal search when leaving journal page
    if (page !== "journal") {
      setJournalSearchTerm("")
    }
  }

  const handleCreateInvoiceForClient = (client: Client) => {
    console.log("Creating invoice for client:", client.name)
    setPrefilledClient(client)
    setEditingInvoice(null)
    setCurrentPage("facture")
  }

  const handleViewClientInvoices = (clientName: string) => {
    console.log("Viewing invoices for client:", clientName)
    setJournalSearchTerm(clientName)
    setCurrentPage("journal")
  }

  const handleInvoiceCreate = async (newInvoice: Invoice) => {
    try {
      // Remove the invoice number from the data since it will be generated by the backend
      const { number, ...invoiceDataWithoutNumber } = newInvoice

      console.log("Creating new invoice...")
      console.log("Invoice data being sent:", invoiceDataWithoutNumber)
      console.log("User data:", { email: userData.email, role: userRole })

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: userData.email,
          userRole: userRole,
          invoiceData: invoiceDataWithoutNumber,
        }),
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", response.headers)

      const result = await response.json()
      console.log("Response result:", result)

      if (result.success) {
        console.log("Invoice created successfully with number:", result.data.number)

        // Add the new invoice to the existing invoices list instead of refetching
        setInvoices((prevInvoices) => [result.data, ...prevInvoices])

        // Reset form states
        setEditingInvoice(null)
        setPrefilledClient(null)
        setCurrentPage("journal")
      } else {
        console.error("API returned error:", result.error)
        throw new Error(result.error || "Failed to create invoice")
      }
    } catch (error) {
      console.error("Error creating invoice:", error)
      throw error
    }
  }
  const handleInvoiceUpdate = async (updatedInvoice: Invoice) => {
    try {
      console.log("Updating invoice:", updatedInvoice.number)
      const response = await fetch("/api/invoices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: userData.email,
          userRole: userRole,
          invoiceData: updatedInvoice,
        }),
      })

      const result = await response.json()
      if (result.success) {
        // Reload invoices
        const invoicesResponse = await fetch("/api/invoices")
        const invoicesResult = await invoicesResponse.json()

        if (invoicesResult.success) {
          setInvoices(invoicesResult.data)
        }

        console.log("Invoice updated successfully, redirecting to journal")
        setEditingInvoice(null)
        setPrefilledClient(null)
        setCurrentPage("journal")
      } else {
        throw new Error(result.error || "Failed to update invoice")
      }
    } catch (error) {
      console.log("Error updating invoice:", error)
      throw error
    }
  }

  const handleInvoiceEdit = (invoice: Invoice) => {
    console.log("Setting invoice for editing:", invoice.number)
    setEditingInvoice(invoice)
    setPrefilledClient(null)
    setCurrentPage("facture")
  }

  const handleInvoiceDelete = async (invoiceId: string) => {
    try {
      console.log("Deleting invoice:", invoiceId)
      const response = await fetch(`/api/invoices?invoiceId=${invoiceId}`, {
        method: "DELETE",
      })

      const result = await response.json()
      if (result.success) {
        // Remove from local state
        const updatedInvoices = invoices.filter((inv) => inv.id !== invoiceId)
        setInvoices(updatedInvoices)
        console.log("Invoice deleted successfully")
      } else {
        console.log("Failed to delete invoice:", result.error)
      }
    } catch (error) {
      console.log("Error deleting invoice:", error)
    }
  }

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading authentication...</p>
      </div>
    )
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
          setCurrentPage("home")
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
