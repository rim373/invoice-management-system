"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  FileText,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Save,
  Eye,
  Settings,
  CheckCircle,
  Loader2,
} from "lucide-react"

interface InvoiceItem {
  id: string
  description: string
  price: number
  quantity: number
}

interface Client {
  id: string
  name: string
  company: string
  email: string
  phone: string
  status: "Active" | "Inactive" | "Pending"
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

interface FacturePageProps {
  clients?: Client[]
  onInvoiceCreate?: (invoice: Invoice) => Promise<void>
}

export function FacturePage({ clients = [], onInvoiceCreate }: FacturePageProps) {
  const [activeTab, setActiveTab] = useState<"facture" | "avoir">("facture")
  const [isFormParametersOpen, setIsFormParametersOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([{ id: "1", description: "", price: 0, quantity: 1 }])

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Form parameters
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0])
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
  const [currency, setCurrency] = useState("EUR")
  const [taxRate, setTaxRate] = useState(20)

  // Default clients if none provided (fallback)
  // Use provided clients or empty array as fallback
  const availableClients = clients && clients.length > 0 ? clients : []

  // Add useEffect to log when clients change:
  useEffect(() => {
    console.log("FacturePage received clients:", clients)
  }, [clients])

  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      price: 0,
      quantity: 1,
    }
    setInvoiceItems([...invoiceItems, newItem])
  }

  const removeInvoiceItem = (id: string) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((item) => item.id !== id))
    }
  }

  const updateInvoiceItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoiceItems(invoiceItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const getSelectedClientData = () => {
    return availableClients.find((client) => client.id === selectedClient)
  }

  const calculateSubtotal = () => {
    return invoiceItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const calculateTax = () => {
    return (calculateSubtotal() * taxRate) / 100
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "text-green-600"
      case "Pending":
        return "text-orange-600"
      case "Inactive":
        return "text-gray-600"
      default:
        return "text-gray-600"
    }
  }

  const validateForm = () => {
    const errors: { [key: string]: string } = {}

    // Validate client selection
    if (!selectedClient) {
      errors.client = "Please select a client"
    }

    // Validate invoice items
    if (invoiceItems.length === 0) {
      errors.items = "Please add at least one item"
    } else {
      const hasEmptyItems = invoiceItems.some(
        (item) => !item.description.trim() || item.price <= 0 || item.quantity <= 0,
      )
      if (hasEmptyItems) {
        errors.items = "All items must have description, valid price and quantity"
      }
    }

    // Validate total amount
    if (calculateTotal() <= 0) {
      errors.total = "Invoice total must be greater than 0"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const generateInvoiceNumber = () => {
    if (invoiceNumber) return invoiceNumber
    return `INV-${Date.now()}`
  }

  const handleSaveInvoice = useCallback(async () => {
    setIsSubmitting(true)
    setFormErrors({})
    setSubmitSuccess(false)

    try {
      // Validation du formulaire
      if (!validateForm()) {
        throw new Error("Form validation failed")
      }

      const clientData = getSelectedClientData()
      if (!clientData) {
        throw new Error("Client data not found")
      }

      const finalInvoiceNumber = generateInvoiceNumber()
      const subtotal = calculateSubtotal()
      const tax = calculateTax()
      const total = calculateTotal()

      const newInvoice = {
        id: `INV-${Date.now()}`,
        number: finalInvoiceNumber,
        clientName: clientData.name,
        clientId: clientData.id,
        clientCompany: clientData.company,
        clientEmail: clientData.email,
        clientPhone: clientData.phone,
        status: "pending" as const,
        totalAmount: total,
        subtotalAmount: subtotal,
        taxAmount: tax,
        taxRate: taxRate,
        paidAmount: 0,
        currency: currency,
        createdDate: invoiceDate,
        dueDate: dueDate,
        items: invoiceItems.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
        })),
        paymentHistory: [],
      }

      // Appel API classique au lieu de Server Action
      if (onInvoiceCreate) {
        await onInvoiceCreate(newInvoice)
      }

      setSubmitSuccess(true)

      // Reset form
      setTimeout(() => {
        setSelectedClient("")
        setInvoiceItems([{ id: "1", description: "", price: 0, quantity: 1 }])
        setInvoiceNumber("")
        setInvoiceDate(new Date().toISOString().split("T")[0])
        setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
        setSubmitSuccess(false)
      }, 2000)
    } catch (error) {
      console.error("Invoice creation failed:", error)
      setFormErrors({
        submit: error instanceof Error ? error.message : "Failed to create invoice",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedClient, invoiceItems, invoiceDate, dueDate, currency, taxRate, onInvoiceCreate])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Invoice</h1>
            <p className="text-gray-600">Generate professional invoices for your clients</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
          <Button
            variant={activeTab === "facture" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("facture")}
            className={activeTab === "facture" ? "bg-white shadow-sm" : ""}
          >
            <FileText className="w-4 h-4 mr-2" />
            Existing Client
          </Button>
          <Button
            variant={activeTab === "avoir" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("avoir")}
            className={activeTab === "avoir" ? "bg-white shadow-sm" : ""}
          >
            <FileText className="w-4 h-4 mr-2" />
            New Client
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <Save className="w-4 h-4 mr-2" />
            Save & Preview
          </Button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {Object.keys(formErrors).length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-red-800 mb-2">Please fix the following errors:</h3>
            <ul className="space-y-1">
              {Object.entries(formErrors).map(([field, error]) => (
                <li key={field} className="text-red-700 text-sm">
                  •{" "}
                  <strong>
                    {field === "client"
                      ? "Client Selection"
                      : field === "items"
                        ? "Invoice Items"
                        : field === "total"
                          ? "Total Amount"
                          : "Form Submission"}
                    :
                  </strong>{" "}
                  {error}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {submitSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">Facture created successfully!</span>
            </div>
            <p className="text-green-700 text-sm mt-1">Your facture has been saved to the Journal.</p>
          </CardContent>
        </Card>
      )}

      {/* Form Parameters */}
      <Card>
        <Collapsible open={isFormParametersOpen} onOpenChange={setIsFormParametersOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span>Form Parameters</span>
                </CardTitle>
                {isFormParametersOpen ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice-number">Invoice Number</Label>
                  <Input
                    id="invoice-number"
                    placeholder="Auto-generated if empty"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice-date">Invoice Date</Label>
                  <Input
                    id="invoice-date"
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input id="due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
          <p className="text-sm text-gray-600">
            Available clients: {availableClients.length}
            {availableClients.length === 0 && " - Go to Clients page to add clients"}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client-select">
              Select Client <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a client..." />
              </SelectTrigger>
              <SelectContent>
                {availableClients.length === 0 ? (
                  <SelectItem value="" disabled>
                    No clients available - Add clients first
                  </SelectItem>
                ) : (
                  availableClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>
                          {client.name} - {client.company}
                        </span>
                        <span className={`text-xs ml-2 ${getStatusColor(client.status)}`}>{client.status}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedClient && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Name & Company</Label>
                  <p className="text-gray-900">{getSelectedClientData()?.name}</p>
                  <p className="text-gray-600">{getSelectedClientData()?.company}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Contact</Label>
                  <p className="text-gray-900">{getSelectedClientData()?.email}</p>
                  <p className="text-gray-600">{getSelectedClientData()?.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <p className={`font-medium ${getStatusColor(getSelectedClientData()?.status || "")}`}>
                    {getSelectedClientData()?.status}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Client ID</Label>
                  <p className="text-gray-900">{getSelectedClientData()?.id}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products/Services */}
      <Card>
        <CardHeader>
          <CardTitle>
            Products / Services <span className="text-red-500">*</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 pb-2 border-b text-sm font-medium text-gray-600">
              <div className="col-span-6">Description</div>
              <div className="col-span-2">Unit Price</div>
              <div className="col-span-2">Quantity</div>
              <div className="col-span-2">Total</div>
            </div>

            {/* Invoice Items */}
            {invoiceItems.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-6">
                  <Textarea
                    placeholder="Enter description..."
                    value={item.description}
                    onChange={(e) => updateInvoiceItem(item.id, "description", e.target.value)}
                    className="min-h-[60px] resize-none"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={item.price || ""}
                    onChange={(e) => updateInvoiceItem(item.id, "price", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateInvoiceItem(item.id, "quantity", Number.parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="col-span-1 flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {currency} {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  {invoiceItems.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeInvoiceItem(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Add Item Button */}
            <Button
              variant="outline"
              onClick={addInvoiceItem}
              className="w-full border-dashed border-2 border-gray-300 hover:border-orange-300 hover:bg-orange-50 bg-transparent"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Item
            </Button>

            {/* Total */}
            <Separator />
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    {currency} {calculateSubtotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax ({taxRate}%):</span>
                  <span className="font-medium">
                    {currency} {calculateTax().toFixed(2)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-orange-600">
                    {currency} {calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={handleSaveInvoice}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save & Preview
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
