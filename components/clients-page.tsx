"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  FileText,
  Mail,
  Phone,
  Trash2,
  User,
  Building2,
  ArrowUpDown,
  Eye,
} from "lucide-react"

interface Client {
  id: string
  contact_id: string
  name: string
  email: string
  phone: string
  company: string
  status: "Active" | "Inactive" | "Pending"
  projects: number
  lastActivity: string
}

interface ClientsPageProps {
  userEmail?: string
  userRole?: string
  onCreateInvoice?: (client: Client) => void
  onViewInvoices?: (clientName: string) => void
}

export function ClientsPage({ userEmail, userRole, onCreateInvoice, onViewInvoices }: ClientsPageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [isEditClientOpen, setIsEditClientOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [clientsData, setClientsData] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sortBy, setSortBy] = useState<"name" | "status">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "Active" as "Active" | "Inactive" | "Pending",
  })

  // Load contacts on component mount
  useEffect(() => {
    if (userEmail && userRole === "user") {
      loadContacts()
    }
  }, [userEmail, userRole])

  const loadContacts = async () => {
    if (!userEmail || userRole !== "user") return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/contacts?userEmail=${encodeURIComponent(userEmail)}&userRole=${userRole}`)
      const result = await response.json()

      if (result.success) {
        setClientsData(result.data)
      } else {
        console.error("Failed to load contacts:", result.error)
      }
    } catch (error) {
      console.error("Error loading contacts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredClients = clientsData
    .filter(
      (client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.id.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        const comparison = a.name.localeCompare(b.name)
        return sortOrder === "asc" ? comparison : -comparison
      } else if (sortBy === "status") {
        const statusOrder = { Active: 1, Pending: 2, Inactive: 3 }
        const comparison = statusOrder[a.status] - statusOrder[b.status]
        return sortOrder === "asc" ? comparison : -comparison
      }
      return 0
    })

  const activeClients = clientsData.filter((client) => client.status === "Active").length

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200"
      case "Pending":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setIsEditClientOpen(true)
  }

  const handleCreateInvoice = (client: Client) => {
    if (onCreateInvoice) {
      onCreateInvoice(client)
    }
  }

  const handleViewInvoices = (client: Client) => {
    if (onViewInvoices) {
      onViewInvoices(client.name)
    }
  }

  const handleSendEmail = (email: string) => {
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, "_blank")
  }

  const handleCallClient = (phone: string) => {
    const cleanPhone = phone.replace(/[^\d]/g, "")
    window.open(`https://wa.me/${cleanPhone}`, "_blank")
  }

  const handleDeleteClient = async (clientId: string) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return

    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/contacts?userEmail=${encodeURIComponent(userEmail!)}&userRole=${userRole}&contactId=${clientId}`,
        {
          method: "DELETE",
        },
      )

      const result = await response.json()
      if (result.success) {
        await loadContacts() // Reload contacts
      } else {
        console.error("Failed to delete contact:", result.error)
      }
    } catch (error) {
      console.error("Error deleting contact:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingClient || !userEmail) return
    try {
      setIsLoading(true)
      const response = await fetch("/api/contacts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingClient.id,
          name: editingClient.name,
          email: editingClient.email,
          phone: editingClient.phone,
          company: editingClient.company,
          address: editingClient.address,
          status: editingClient.status,
        }),
      })
      const result = await response.json()
      if (result.success) {
        await loadContacts()
        setIsEditClientOpen(false)
        setEditingClient(null)
      } else {
        console.error("Failed to update contact:", result.error)
      }
    } catch (error) {
      console.error("Error updating contact:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.email || !newClient.phone || !newClient.company || !userEmail) return

    try {
      setIsLoading(true)
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Send the contact data directly, not nested in contactData
          name: newClient.name,
          email: newClient.email,
          phone: newClient.phone,
          company: newClient.company,
          status: newClient.status,
        }),
      })

      const result = await response.json()
      if (result.success) {
        await loadContacts()
        setNewClient({
          name: "",
          email: "",
          phone: "",
          company: "",
          status: "Active",
        })
        setIsAddClientOpen(false)
      } else {
        console.error("Failed to create contact:", result.error)
      }
    } catch (error) {
      console.error("Error creating contact:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (userRole !== "user") {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600">Contacts page is only available for users.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Repository</h1>
          <p className="text-gray-600 mt-1">Manage and search through your contact database</p>
        </div>
        <Dialog
          open={isAddClientOpen}
          onOpenChange={(open) => {
            setIsAddClientOpen(open)
            if (!open) {
              setNewClient({
                name: "",
                email: "",
                phone: "",
                company: "",
                status: "Active",
              })
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-gray-900 hover:bg-gray-800 text-white" disabled={isLoading}>
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
              <DialogDescription>Enter the contact information to add them to your database.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  className="col-span-3"
                  value={newClient.name}
                  onChange={(e) => setNewClient((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  className="col-span-3"
                  value={newClient.email}
                  onChange={(e) => setNewClient((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  className="col-span-3"
                  value={newClient.phone}
                  onChange={(e) => setNewClient((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company" className="text-right">
                  Company
                </Label>
                <Input
                  id="company"
                  className="col-span-3"
                  value={newClient.company}
                  onChange={(e) => setNewClient((prev) => ({ ...prev, company: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={newClient.status}
                  onValueChange={(value) =>
                    setNewClient((prev) => ({ ...prev, status: value as "Active" | "Inactive" | "Pending" }))
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddClientOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleAddClient} disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Contact"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={isEditClientOpen} onOpenChange={setIsEditClientOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Contact</DialogTitle>
              <DialogDescription>Update the contact information.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-id" className="text-right">
                  Contact ID
                </Label>
                <Input id="edit-id" className="col-span-3" value={editingClient?.id || ""} disabled />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  className="col-span-3"
                  value={editingClient?.name || ""}
                  onChange={(e) => setEditingClient((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  className="col-span-3"
                  value={editingClient?.email || ""}
                  onChange={(e) => setEditingClient((prev) => (prev ? { ...prev, email: e.target.value } : null))}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="edit-phone"
                  className="col-span-3"
                  value={editingClient?.phone || ""}
                  onChange={(e) => setEditingClient((prev) => (prev ? { ...prev, phone: e.target.value } : null))}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-company" className="text-right">
                  Company
                </Label>
                <Input
                  id="edit-company"
                  className="col-span-3"
                  value={editingClient?.company || ""}
                  onChange={(e) => setEditingClient((prev) => (prev ? { ...prev, company: e.target.value } : null))}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <Select
                  value={editingClient?.status}
                  onValueChange={(value) =>
                    setEditingClient((prev) =>
                      prev
                        ? {
                            ...prev,
                            status: value as "Active" | "Inactive" | "Pending",
                          }
                        : null,
                    )
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditClientOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleSaveEdit} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-center">
        {/* Total Contacts Card */}
        <Card className="rounded-lg shadow-sm w-80 h-40 mx-auto">
          <CardContent className="flex flex-col items-center justify-center p-2 h-full">
            <div className="w-10 h-10 bg-orange-500 rounded-md flex items-center justify-center mb-1">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-lg font-semibold text-gray-800">{clientsData.length}</div>
            <div className="text-xs text-gray-500">Total Contacts</div>
          </CardContent>
        </Card>

        {/* Active Contacts Card */}
        <Card className="rounded-lg shadow-sm w-80 h-40 mx-auto">
          <CardContent className="flex flex-col items-center justify-center p-2 h-full">
            <div className="w-10 h-10 bg-green-500 rounded-md flex items-center justify-center mb-1">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="text-lg font-semibold text-gray-900">{activeClients}</div>
            <div className="text-xs text-gray-500">Active Contacts</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Search Contacts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by contact ID, name, email, or company..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-4 mt-4 text-sm text-gray-600">
            <span>Total Contacts: {clientsData.length}</span>
            <span>•</span>
            <span>Showing: {filteredClients.length}</span>
            <span>•</span>
            <span>Active: {activeClients}</span>
          </div>
        </CardContent>
      </Card>

      {/* Contact Directory */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Contact Directory</CardTitle>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
                  <ArrowUpDown className="w-4 h-4" />
                  <span>Sort by {sortBy === "name" ? "Name" : "Status"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setSortBy("name")
                    setSortOrder("asc")
                  }}
                >
                  Name (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSortBy("name")
                    setSortOrder("desc")
                  }}
                >
                  Name (Z-A)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSortBy("status")
                    setSortOrder("asc")
                  }}
                >
                  Status (Active → Inactive)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSortBy("status")
                    setSortOrder("desc")
                  }}
                >
                  Status (Inactive → Active)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <div className="text-center py-4">Loading contacts...</div>}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Contact ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Company</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium text-gray-900">{client.contact_id}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="font-medium">{client.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span>{client.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{client.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-900">{client.company}</td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(client.status)}>{client.status}</Badge>
                    </td>
                    <td className="py-4 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isLoading}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClient(client)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Contact
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCreateInvoice(client)}>
                            <FileText className="mr-2 h-4 w-4 text-orange-500" />
                            <span className="text-orange-500">Create Invoice</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewInvoices(client)}>
                            <Eye className="mr-2 h-4 w-4 text-blue-500" />
                            <span className="text-blue-500">View Invoices</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendEmail(client.email)}>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCallClient(client.phone)}>
                            <Phone className="mr-2 h-4 w-4" />
                            Call Contact
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClient(client.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Contact
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredClients.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No contacts found</h3>
              <p className="text-gray-600">
                {clientsData.length === 0
                  ? "You haven't added any contacts yet. Click 'Add Contact' to get started."
                  : "No contacts match your current search."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
