"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Mail, Phone, User, MoreHorizontal } from "lucide-react"
import { useState } from "react"

type Client = {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: string
  access: number
}

const initialClients: Client[] = [
  {
    id: "CLT-004",
    name: "Emily Davis",
    email: "emily@startup.io",
    phone: "+15554567890",
    company: "INVERNI BW",
    status: "Active",
    access: 0,
  },
]

export function AdminDashboard() {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [search, setSearch] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editClientIndex, setEditClientIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<Client>({
    id: "",
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "Active",
    access: 0,
  })

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddOrEdit = () => {
    if (editClientIndex !== null) {
      // Edit existing
      const updated = [...clients]
      updated[editClientIndex] = { ...formData, id: updated[editClientIndex].id } // prevent editing ID
      setClients(updated)
    } else {
      // Create new ID
      const lastId = clients[clients.length - 1]?.id || "CLT-000"
      const newIdNumber = parseInt(lastId.split("-")[1]) + 1
      const newId = `CLT-${newIdNumber.toString().padStart(3, "0")}`
      const newClient = { ...formData, id: newId }
      setClients([...clients, newClient])
    }

    // Reset
    setFormData({
      id: "",
      name: "",
      email: "",
      phone: "",
      company: "",
      status: "Active",
      access: 0,
    })
    setEditClientIndex(null)
    setOpenDialog(false)
    }


  const handleDelete = (index: number) => {
    const updated = [...clients]
    updated.splice(index, 1)
    setClients(updated)
  }

  const openEditDialog = (client: Client, index: number) => {
    setFormData(client)
    setEditClientIndex(index)
    setOpenDialog(true)
  }

  const openWhatsApp = (phone: string) => {
    const formatted = phone.replace(/[^0-9]/g, "")
    window.open(`https://wa.me/${formatted}`, "_blank")
  }

  const openEmail = (email: string) => {
    window.location.href = `mailto:${email}`
  }

  const changeAccess = (index: number, delta: number) => {
    const updated = [...clients]
    updated[index].access = Math.max(0, updated[index].access + delta)
    setClients(updated)
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle>Clients</CardTitle>
        <div className="flex gap-2">
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Button onClick={() => setOpenDialog(true)}>Add Client</Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="py-2 px-4">Client ID</th>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Contact</th>
                <th className="py-2 px-4">Company</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Number of Access</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client, index) => (
                <tr key={client.id} className="border-b hover:bg-muted/50">
                  <td className="py-2 px-4 font-semibold text-primary">{client.id}</td>
                  <td className="py-2 px-4 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {client.name}
                  </td>
                  <td className="py-2 px-4 space-y-1">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {client.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {client.phone}
                    </div>
                  </td>
                  <td className="py-2 px-4 font-semibold">{client.company}</td>
                  <td className="py-2 px-4">
                    <Badge
                      variant={
                        client.status === "Active"
                          ? "default"
                          : client.status === "Inactive"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {client.status}
                    </Badge>
                  </td>
                  <td className="py-2 px-4 flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => changeAccess(index, -1)}>–</Button>
                    <span>{client.access}</span>
                    <Button variant="outline" size="icon" onClick={() => changeAccess(index, 1)}>+</Button>
                  </td>
                  <td className="py-2 px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(client, index)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openWhatsApp(client.phone)}>
                          Call (WhatsApp)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEmail(client.email)}>
                          Email
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(index)}
                          className="text-red-600"
                        >
                          Delete
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

      {/* Add/Edit Form Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editClientIndex !== null ? "Edit Client" : "Add Client"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {["name", "email", "phone", "company"].map((field) => (
              <div key={field} className="space-y-1">
                <Label>{field.toUpperCase()}</Label>
                <Input
                  value={(formData as any)[field]}
                  onChange={(e) =>
                    setFormData({ ...formData, [field]: e.target.value })
                  }
                />
              </div>
            ))}

            {/* Status Dropdown */}
            <div className="space-y-1">
              <Label>Status</Label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <Button onClick={handleAddOrEdit}>
              {editClientIndex !== null ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
