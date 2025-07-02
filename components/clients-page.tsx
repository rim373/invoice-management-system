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
} from "lucide-react"

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

// Add these props to the ClientsPage component:
interface ClientsPageProps {
  clients?: Client[]
  onClientUpdate?: (clients: Client[]) => void
  onClientDelete?: (clientId: string) => void
}

export function ClientsPage({ clients: externalClients, onClientUpdate, onClientDelete }: ClientsPageProps = {}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [isEditClientOpen, setIsEditClientOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  // Replace the existing clientsData useState with:
  const [clientsData, setClientsData] = useState<Client[]>([])

  // Add useEffect to sync with external clients:
  useEffect(() => {
    if (externalClients) {
      console.log("ClientsPage received clients:", externalClients)
      setClientsData(externalClients)
    }
  }, [externalClients])

  const [sortBy, setSortBy] = useState<"name" | "status">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "Active" as "Active" | "Inactive" | "Pending",
  })

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

  const handleSendEmail = (email: string) => {
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, "_blank")
  }

  const handleCallClient = (phone: string) => {
    const cleanPhone = phone.replace(/[^\d]/g, "")
    window.open(`https://wa.me/${cleanPhone}`, "_blank")
  }

  // Replace the handleDeleteClient function:
  const handleDeleteClient = (clientId: string) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      const updatedClients = clientsData.filter((client) => client.id !== clientId)
      setClientsData(updatedClients)

      // Notify parent component about the deletion
      if (onClientDelete) {
        onClientDelete(clientId)
      }

      if (onClientUpdate) {
        onClientUpdate(updatedClients)
      }
    }
  }

  // Replace the handleSaveEdit function:
  const handleSaveEdit = () => {
    if (editingClient) {
      const updatedClients = clientsData.map((client) => (client.id === editingClient.id ? editingClient : client))
      setClientsData(updatedClients)

      // Notify parent component about the update
      if (onClientUpdate) {
        onClientUpdate(updatedClients)
      }

      setIsEditClientOpen(false)
      setEditingClient(null)
    }
  }

  // Replace the handleAddClient function:
  const handleAddClient = () => {
    if (newClient.name && newClient.email && newClient.phone && newClient.company) {
      const clientId = `CLT-${String(clientsData.length + 1).padStart(3, "0")}`
      const client: Client = {
        id: clientId,
        name: newClient.name,
        email: newClient.email,
        phone: newClient.phone,
        company: newClient.company,
        status: newClient.status,
        projects: 0,
        lastActivity: "Just added",
      }

      const updatedClients = [...clientsData, client]
      setClientsData(updatedClients)

      // Notify parent component about the addition
      if (onClientUpdate) {
        onClientUpdate(updatedClients)
      }

      setNewClient({
        name: "",
        email: "",
        phone: "",
        company: "",
        status: "Active",
      })
      setIsAddClientOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Repository</h1>
          <p className="text-gray-600 mt-1">Manage and search through your client database</p>
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
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>Enter the client information to add them to your database.</DialogDescription>
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
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleAddClient}>
                Add Client
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={isEditClientOpen} onOpenChange={setIsEditClientOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Client</DialogTitle>
              <DialogDescription>Update the client information.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-id" className="text-right">
                  Client ID
                </Label>
                <Input id="edit-id" className="col-span-3" value={editingClient?.id || ""} disabled />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input id="edit-name" className="col-span-3" value={editingClient?.name || ""} disabled />
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
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">{clientsData.length}</div>
              <div className="text-sm text-gray-600 mt-1">Total Clients</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">{activeClients}</div>
              <div className="text-sm text-gray-600 mt-1">Active Clients</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">
                {clientsData.reduce((sum, client) => sum + client.projects, 0)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Projects</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Search Clients</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by client ID, name, email, or company..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-4 mt-4 text-sm text-gray-600">
            <span>Total Clients: {clientsData.length}</span>
            <span>•</span>
            <span>Showing: {filteredClients.length}</span>
            <span>•</span>
            <span>Active: {activeClients}</span>
          </div>
        </CardContent>
      </Card>

      {/* Client Directory */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Client Directory</CardTitle>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Client ID</th>
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
                    <td className="py-4 px-4 font-medium text-gray-900">{client.id}</td>
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
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClient(client)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Client
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4 text-orange-500" />
                            <span className="text-orange-500">Facture</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendEmail(client.email)}>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCallClient(client.phone)}>
                            <Phone className="mr-2 h-4 w-4" />
                            Call Client
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClient(client.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
