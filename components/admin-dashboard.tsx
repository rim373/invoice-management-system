"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, MoreHorizontal, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"

type AdminUser = {
  id: string
  name: string
  email: string
  phone: string
  company: string
  access: number
  secteur: string
  location: string
  company_size: string
  password: string
  date: string
  paiement_method: string
  status: string
}

const SECTORS = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Construction",
  "Transportation",
  "Energy",
  "Agriculture",
  "Real Estate",
  "Entertainment",
  "Other",
]

const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees",
]

const LOCATIONS = ["North America", "Europe", "Asia Pacific", "Latin America", "Middle East", "Africa", "Other"]

// Helper function to format date for input
const formatDateForInput = (dateString: string): string => {
  if (!dateString) return new Date().toISOString().split("T")[0]
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split("T")[0]
    }
    return date.toISOString().split("T")[0]
  } catch (error) {
    return new Date().toISOString().split("T")[0]
  }
}

// Helper function to format date for display
const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return "N/A"
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid Date"
    return date.toLocaleDateString()
  } catch (error) {
    return "Invalid Date"
  }
}

export function AdminDashboard() {
  const t = useTranslations("adminDashboard")
  const [users, setUsers] = useState<AdminUser[]>([])
  const [search, setSearch] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editUserIndex, setEditUserIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<AdminUser>>({
    name: "",
    email: "",
    phone: "",
    company: "",
    access: 0,
    secteur: "Technology",
    location: "Europe",
    company_size: "1-10 employees",
    paiement_method: "Per Month",
    password: "",
    status: "Active",
    date: new Date().toISOString().split("T")[0], 
  })

  // Load users on component mount
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/users?role=admin`)
      const result = await response.json()

      if (result.success) {
        // Ensure all fields have default values
        const processedUsers = result.data.map((user: any) => ({
          ...user,
          access: user.access || 0,
          secteur: user.secteur || "Technology",
          location: user.location || "Europe",
          company_size: user.company_size || "1-10 employees",
          paiement_method: user.paiement_method || "Per Month",
          date: user.date ? formatDateForInput(user.date) : new Date().toISOString().split("T")[0],
          status: user.status || "Active",
          phone: user.phone || "",
        }))
        setUsers(processedUsers)
      } else {
        console.error("Failed to load users:", result.error)
      }
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.company.toLowerCase().includes(search.toLowerCase()),
  )

 const handleAddOrEdit = async () => {
  try {
    setIsLoading(true)
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.company) {
      alert("Please fill in all required fields (Name, Email, Company)")
      return
    }
    
    // For new users, password is required
    if (editUserIndex === null && !formData.password) {
      alert("Password is required for new users")
      return
    }
    
    // Prepare the data to send directly (not nested in userData)
    const dataToSend = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || "",
      company: formData.company,
      access_count: formData.access || 0,
      sector: formData.secteur || "Technology",
      location: formData.location || "Europe",
      company_size: formData.company_size || "1-10 employees",
      payment_method: formData.paiement_method || "Per Month",
      join_date: formData.date || new Date().toISOString().split("T")[0],
      status: formData.status || "Active",
      ...(formData.password && { password: formData.password }),
  }

    
    if (editUserIndex !== null) {
      // Edit existing user
      const userId = users[editUserIndex].id
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: userId,
          ...dataToSend, // Spread the data directly instead of nesting in userData
        }),
      })
      
      const result = await response.json()
      if (result.success) {
        await loadUsers() // Reload users
      } else {
        console.error(t("errors.1"), result.error)
        alert(t("errors.1")+ result.error)
      }
    } else {
      // Create new user
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend), // Send data directly
      })
      
      const result = await response.json()
      if (result.success) {
        await loadUsers() // Reload users
      } else {
        console.error(t("errors.2"), result.error)
        alert(t("errors.2") + result.error)
      }
    }
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      access: 0,
      secteur: "Technology",
      location: "Europe",
      company_size: "1-10 employees",
      paiement_method: "Per Month",
      password: "",
      status: "Active",
      date: new Date().toISOString().split("T")[0]
    })
    setEditUserIndex(null)
    setOpenDialog(false)
  } catch (error) {
    console.error(t("errors.3"), error)
    alert(t("errors.3"))
  } finally {
    setIsLoading(false)
  }
}
  const openEditDialog = (user: AdminUser, index: number) => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      company: user.company,
      access: user.access,
      secteur: user.secteur,
      location: user.location,
      company_size: user.company_size,
      paiement_method: user.paiement_method,
      date: formatDateForInput(user.date),
      status: user.status,
      password: "", // Don't pre-fill password for security
    })
    setEditUserIndex(index)
    setOpenDialog(true)
  }

  const openAddDialog = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      access: 0,
      secteur: "Technology",
      location: "Europe",
      company_size: "1-10 employees",
      paiement_method: "Per Month",
      password: "",
      status: "Active",
      date: new Date().toISOString().split("T")[0],
    })
    setEditUserIndex(null)
    setOpenDialog(true)
  }

  const openWhatsApp = (phone: string) => {
    if (!phone) return
    const formatted = phone.replace(/[^0-9]/g, "")
    window.open(`https://wa.me/${formatted}`, "_blank")
  }

  const openEmail = (email: string) => {
    window.location.href = `mailto:${email}`
  }

  const changeAccess = async (index: number, delta: number) => {
    const user = users[index]
    const newAccess = Math.max(0, user.access + delta)

    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userRole: "admin",
          userId: user.id,
          userData: { ...user, access: newAccess },
        }),
      })

      const result = await response.json()
      if (result.success) {
        await loadUsers() // Reload users
      }
    } catch (error) {
      console.error("Error updating access:", error)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle>{t("Clients")}</CardTitle>
        <div className="flex gap-2">
          <Input
            placeholder={t("Search clients")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Button onClick={openAddDialog} disabled={isLoading}>
            <Plus className="w-4 h-4 mr-2" />
            {t("Add Client")}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading && <div className="text-center py-4">Loading...</div>}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="py-2 px-4">{t("Client ID")}</th>
                <th className="py-2 px-4">{t("Name")}</th>
                <th className="py-2 px-4">{t("Contact")}</th>
                <th className="py-2 px-4">{t("Company")}</th>
                <th className="py-2 px-4">{t("Number of Access")}</th>
                <th className="py-2 px-4">{t("Secteur")}</th>
                <th className="py-2 px-4">{t("Location")}</th>
                <th className="py-2 px-4">{t("Company Size")}</th>
                <th className="py-2 px-4">{t("Participation Date")}</th>
                <th className="py-2 px-4">{t("Paiement Method")}</th>
                <th className="py-2 px-4">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user.id} className="border-b hover:bg-muted/50">
                  <td className="py-2 px-4 font-semibold text-primary">{user.id.substring(0, 8)}...</td>
                  <td className="py-2 px-4">{user.name}</td>
                  <td className="py-2 px-4 space-y-1">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span className="text-xs">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span className="text-xs">{user.phone || "N/A"}</span>
                    </div>
                  </td>
                  <td className="py-2 px-4 font-semibold">{user.company}</td>
                  <td className="py-2 px-4 flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => changeAccess(index, -1)} disabled={isLoading}>
                      –
                    </Button>
                    <span className="min-w-[20px] text-center">{user.access}</span>
                    <Button variant="outline" size="icon" onClick={() => changeAccess(index, 1)} disabled={isLoading}>
                      +
                    </Button>
                  </td>
                  <td className="py-2 px-4 font-semibold">{user.secteur}</td>
                  <td className="py-2 px-4 font-semibold">{user.location}</td>
                  <td className="py-2 px-4 font-semibold">{user.company_size}</td>
                  <td className="py-2 px-4 font-semibold">{user.date}</td>
                  <td className="py-2 px-4">
                    <Badge
                      variant={
                        user.paiement_method === "Per Month"
                          ? "default"
                          : user.paiement_method === "3 Months"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {t(user.paiement_method)}
                    </Badge>
                  </td>
                  <td className="py-2 px-4">
                    <Badge variant={user.status === "Active" ? "default" : "secondary"}>{user.status}</Badge>
                  </td>
                  <td className="py-2 px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isLoading}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(user, index)}>
                          {t("Edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openWhatsApp(user.phone)}>
                          {t("Call (WhatsApp)")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEmail(user.email)}>
                          {t("Email")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(index)} className="text-red-600">
                          {t("Delete")}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          {t("Stop Access")}
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editUserIndex !== null ? t("Edit Client") : t("Add Client")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("form.name")}</Label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t("placeholders.name")}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("form.email")}</Label>
              <Input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t("placeholders.email")}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("form.phone")}</Label>
              <Input
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={t("placeholders.phone")}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("form.company")}</Label>
              <Input
                value={formData.company || ""}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder={t("placeholders.company")}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("form.sector")}</Label>
              <Select
                value={formData.secteur || "Technology"}
                onValueChange={(value) => setFormData({ ...formData, secteur: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("placeholders.sector")} />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("form.location")}</Label>
              <Select
                value={formData.location || "Europe"}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("placeholders.location")} />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("form.size")}</Label>
              <Select
                value={formData.company_size || "1-10 employees"}
                onValueChange={(value) => setFormData({ ...formData, company_size: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("placeholders.size")} />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("Paiement method")}</Label>
              <Select
                value={formData.paiement_method || "Per Month"}
                onValueChange={(value) => setFormData({ ...formData, paiement_method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("Select payment method")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Per Month">{t("Per Month")}</SelectItem>
                  <SelectItem value="3 Months">{t("3 Months")}</SelectItem>
                  <SelectItem value="Per Year">{t("Per Year")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("form.acess")}</Label>
              <Input
                type="number"
                min="0"
                value={formData.access || 0}
                onChange={(e) => setFormData({ ...formData, access: Number.parseInt(e.target.value) || 0 })}
                placeholder={t("placeholders.acess")}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("form.stat")}</Label>
              <Select
                value={formData.status || "Active"}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">{t("status.1")}</SelectItem>
                  <SelectItem value="Inactive">{t("status.2")}</SelectItem>
                  <SelectItem value="Pending">{t("status.3")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("form.Join")}</Label>
              <Input
                type="date"
                value={
                  formData.date && !isNaN(new Date(formData.date).getTime())
                    ? new Date(formData.date).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0]
                }
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            {editUserIndex === null && (
              <div className="space-y-2 col-span-2">
                <Label>{t("form.pwd")}</Label>
                <Input
                  type="password"
                  value={formData.password || ""}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={t("placeholders.pwd")}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddOrEdit} disabled={isLoading}>
              {isLoading ? "Saving..." : editUserIndex !== null ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
