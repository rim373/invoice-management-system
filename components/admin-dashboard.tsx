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
  access: number
  secteur:string
  location:string
  company_size :string
  mdp : string
  date: string
  paiement_method: string
}

const initialClients: Client[] = [
  {
    id: "CLT-004",
    name: "Emily Davis",
    email: "emily@startup.io",
    phone: "+15554567890",
    company: "INVERNI BW",
    access: 0,
    secteur:"IOT",
    location:"SUPCOM",
    company_size :"+1000",
    mdp:"CLT-004",
    date: "2025-07-08",
    paiement_method: "Per Month",

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
    access: 0,
    secteur:"",
    location:"",
    company_size :"",
    mdp :"",
    date: "", // <-- NEW
    paiement_method: "Per Month",

  })

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddOrEdit = () => {
    if (editClientIndex !== null) {
      // Edit existing client
      const updated = [...clients]
      const existingClient = updated[editClientIndex]
      updated[editClientIndex] = {
        ...formData,
        id: existingClient.id,   // preserve original ID
        mdp: existingClient.mdp, // preserve original mdp
        date: existingClient.date,
      }
      setClients(updated)
    } else {
      // Create new client
      const lastId = clients[clients.length - 1]?.id || "CLT-000"
      const newIdNumber = parseInt(lastId.split("-")[1]) + 1
      const newId = `CLT-${newIdNumber.toString().padStart(3, "0")}`
      const today = new Date().toISOString().split("T")[0] // <-- define it here
      const newClient = { ...formData, id: newId, mdp: newId,date: today  } // mdp = id
      setClients([...clients, newClient])
    }

    // Reset form
    setFormData({
      id: "",
      name: "",
      email: "",
      phone: "",
      company: "",
      access: 0,
      secteur: "",
      location: "",
      company_size: "",
      mdp: "", // <-- Reset mdp too
      date: "", // <-- reset
      paiement_method: "Per Month",
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
                <th className="py-2 px-4">Number of Access</th>
                <th className="py-2 px-4">Secteur</th>
                <th className="py-2 px-4">Location</th>
                <th className="py-2 px-4">Company Size</th>
                <th className="py-2 px-4">Participation Date</th>
                <th className="py-2 px-4">Paiement Method</th>
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
                  <td className="py-2 px-4 flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => changeAccess(index, -1)}>–</Button>
                    <span>{client.access}</span>
                    <Button variant="outline" size="icon" onClick={() => changeAccess(index, 1)}>+</Button>
                  </td>
                  
                  <td className="py-2 px-4 font-semibold">{client.secteur}</td>
                  <td className="py-2 px-4 font-semibold">{client.location}</td>
                  <td className="py-2 px-4 font-semibold">{client.company_size}</td>
                  <td className="py-2 px-4 font-semibold">{client.date}</td>
                  <td className="py-2 px-4">
                    <Badge
                      variant={
                        client.paiement_method === "Per Month "
                          ? "default"
                          : client.paiement_method === "3 months "
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {client.paiement_method}
                    </Badge>
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
                        <DropdownMenuItem
                          className="text-red-600"
                        >
                          Stop Acess
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
            {["name", "email", "phone", "company","secteur","location","company_size"].map((field) => (
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

            
            {/* Paiement method Dropdown */}
            <div className="space-y-1">
              <Label>Paiement method</Label>
              <select
                value={formData.paiement_method}
                onChange={(e) =>
                  setFormData({ ...formData, paiement_method: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md"
              >
                <option value="Per Month">Per Month</option>
                <option value="3 Months">3 Months </option>
                <option value="Per Year">Per Year</option>
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
