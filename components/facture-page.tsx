"use client"
import { useClickSound } from "@/lib/playClickSound"
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { useTranslations } from "next-intl"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { FileText, Plus, Trash2, Save, CheckCircle, Loader2 } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { fetchSettings, type InvoiceSettings, defaultSettings } from "@/lib/settings" // Import defaultSettings

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
  editInvoice?: Invoice | null
  prefilledClient?: Client | null
  onInvoiceUpdate?: (invoice: Invoice) => Promise<void>
}

export function FacturePage({
  clients = [],
  onInvoiceCreate,
  editInvoice,
  prefilledClient,
  onInvoiceUpdate,
}: FacturePageProps) {
  //sound
  const playClickSound = useClickSound()
  const handlesound = () => {
    playClickSound()
  }
  //translation:
  const t = useTranslations("facturePage")
  // State for invoice settings, initialized with default values
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(defaultSettings.invoice_settings)

  // State for invoice parameters (switches), initialized from invoiceSettings
  const [invoiceParameters, setInvoiceParameters] = useState({
    invoiceNumber: defaultSettings.invoice_settings.invoiceNumber,
    dueDate: defaultSettings.invoice_settings.dueDate,
    currency: defaultSettings.invoice_settings.currency,
    discount: defaultSettings.invoice_settings.discount,
    tax: defaultSettings.invoice_settings.tax,
    notes: defaultSettings.invoice_settings.notes,
  })

  const [newClient, setNewClient] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
  })

  const [activeTab, setActiveTab] = useState<"facture" | "avoir">("facture")
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([{ id: "1", description: "", price: 0, quantity: 1 }])
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Form parameters
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0])
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
  const [currency] = useState("EUR") // This seems hardcoded, but invoiceSettings.currencyType is used for display

  // Load settings on component mount
  useEffect(() => {
    loadSettings()
  }, [])

  // Load invoice data if editing
  useEffect(() => {
    if (editInvoice) {
      loadInvoiceForEdit(editInvoice)
    }
  }, [editInvoice])

  // Handle prefilled client
  useEffect(() => {
    if (prefilledClient) {
      setActiveTab("facture")
      setSelectedClient(prefilledClient.id)
      // Clear any editing invoice when using prefilled client
      setEditingInvoice(null)
    }
  }, [prefilledClient])

  const loadSettings = async () => {
    try {
      const result = await fetchSettings()
      if (result.success && result.settings) {
        const fetchedInvoiceSettings = result.settings.invoice_settings
        setInvoiceSettings(fetchedInvoiceSettings)
        // Update invoiceParameters based on fetched settings
        setInvoiceParameters({
          invoiceNumber: fetchedInvoiceSettings.invoiceNumber,
          dueDate: fetchedInvoiceSettings.dueDate,
          currency: fetchedInvoiceSettings.currency,
          discount: fetchedInvoiceSettings.discount,
          tax: fetchedInvoiceSettings.tax,
          notes: fetchedInvoiceSettings.notes,
        })
        // Set initial due date based on fetched settings
        if (fetchedInvoiceSettings.dueDate) {
          if (fetchedInvoiceSettings.dueDateType === "custom") {
            setDueDate(fetchedInvoiceSettings.dueDateCustom)
          } else if (fetchedInvoiceSettings.dueDateType === "term") {
            const days = Number.parseInt(fetchedInvoiceSettings.dueDateDays, 10)
            const newDueDate = new Date()
            newDueDate.setDate(newDueDate.getDate() + days)
            setDueDate(newDueDate.toISOString().split("T")[0])
          }
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  const loadInvoiceForEdit = (invoice: Invoice) => {
    // Set form data from invoice
    setInvoiceNumber(invoice.number)
    setInvoiceDate(invoice.createdDate)
    setDueDate(invoice.dueDate)

    // Find and select the client
    const client = clients.find((c) => c.id === invoice.clientId)
    if (client) {
      setSelectedClient(client.id)
      setActiveTab("facture")
    } else {
      // If client not found, use new client form
      setNewClient({
        name: invoice.clientName,
        company: invoice.clientCompany,
        email: invoice.clientEmail,
        phone: invoice.clientPhone,
      })
      setActiveTab("avoir")
    }

    // Set invoice items
    const items = invoice.items.map((item) => ({
      id: item.id,
      description: item.description,
      price: item.unitPrice,
      quantity: item.quantity,
    }))
    setInvoiceItems(items)
    setEditingInvoice(invoice)
  }

  const availableClients = clients && clients.length > 0 ? clients : []

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
    if (prefilledClient && selectedClient === prefilledClient.id) {
      return prefilledClient
    }
    return availableClients.find((client) => client.id === selectedClient)
  }

  const calculateSubtotal = () => {
    return invoiceItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const calculateDiscount = () => {
    const { discountType, discountAmount } = invoiceSettings
    const subtotal = calculateSubtotal()

    const parsedAmount = Number.parseFloat(discountAmount || "0")

    if (parsedAmount <= 0 || !invoiceParameters.discount) {
      return 0
    }

    if (discountType === "percentage") {
      return (subtotal * parsedAmount) / 100
    }

    if (discountType === "fixed") {
      return parsedAmount
    }

    return 0
  }

  const calculateTax = () => {
    const rate = Number.parseFloat(invoiceSettings.taxAmount || "0")
    if (!invoiceParameters.tax) return 0 // Only apply tax if enabled by parameter
    return (calculateSubtotal() * rate) / 100
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - calculateDiscount()
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

    if (activeTab === "facture") {
      if (!selectedClient) {
        errors.client = t("Please select a client")
      }
    } else {
      if (!newClient.name || !newClient.company || !newClient.email || !newClient.phone) {
        errors.client = t("Please fill all new client fields")
      }
    }

    if (invoiceItems.length === 0) {
      errors.items = t("Please add at least one item")
    } else {
      const hasEmptyItems = invoiceItems.some(
        (item) => !item.description.trim() || item.price <= 0 || item.quantity <= 0,
      )
      if (hasEmptyItems) {
        errors.items = t("All items must have description valid price and quantity")
      }
    }

    if (calculateTotal() <= 0) {
      errors.total = "Invoice total must be greater than 0"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const generateInvoiceNumber = () => {
    if (invoiceParameters.invoiceNumber && invoiceNumber) return invoiceNumber // Use user-entered if available and enabled
    if (invoiceParameters.invoiceNumber) {
      return `${invoiceSettings.invoiceNumberPrefix}-${invoiceSettings.invoiceNumberStart}`
    }
    return `INV-${Date.now()}` // Fallback if invoice number is disabled
  }

  const handleSaveInvoice = useCallback(async () => {
    setIsSubmitting(true)
    setFormErrors({})
    setSubmitSuccess(false)

    try {
      if (!validateForm()) {
        toast.error("Please fill in the form before submitting.")
        return
      }

      let clientData: Client | null = null

      if (activeTab === "facture") {
        clientData = getSelectedClientData() || null
        if (!clientData) {
          toast.error("Client data not found")
          return
        }
      } else {
        const { name, company, email, phone } = newClient
        if (!name || !company || !email || !phone) {
          toast.error("Please fill all new client fields")
          return
        }

        clientData = {
          id: `client-${Date.now()}`,
          name,
          company,
          email,
          phone,
          status: "Active",
        }
      }

      const finalInvoiceNumber = generateInvoiceNumber()
      const subtotal = calculateSubtotal()
      const tax = calculateTax()
      const discount = calculateDiscount()
      const total = calculateTotal()

      const invoiceData = {
        id: editInvoice?.id || `INV-${Date.now()}`,
        number: finalInvoiceNumber,
        clientName: clientData.name,
        clientId: clientData.id,
        clientCompany: clientData.company,
        clientEmail: clientData.email,
        clientPhone: clientData.phone,
        status: (editInvoice?.status || "pending") as const,
        totalAmount: total,
        subtotalAmount: subtotal,
        taxAmount: tax,
        discountAmount: discount,
        paidAmount: editInvoice?.paidAmount || 0,
        currency: invoiceSettings.currencyType, // Use currency from settings
        createdDate: invoiceDate,
        dueDate: invoiceParameters.dueDate ? dueDate : "", // Only include due date if enabled
        items: invoiceItems.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
        })),
        paymentHistory: editInvoice?.paymentHistory || [],
      }

      if (editInvoice && onInvoiceUpdate) {
        await onInvoiceUpdate(invoiceData)
      } else if (onInvoiceCreate) {
        await onInvoiceCreate(invoiceData)
      }

      setSubmitSuccess(true)

      // Reset form after delay
      setTimeout(() => {
        if (!editInvoice) {
          setSelectedClient("")
          setInvoiceItems([{ id: "1", description: "", price: 0, quantity: 1 }])
          setInvoiceNumber("")
          setInvoiceDate(new Date().toISOString().split("T")[0])
          // Reset due date based on current settings
          if (invoiceSettings.dueDateType === "custom") {
            setDueDate(invoiceSettings.dueDateCustom)
          } else {
            const days = Number.parseInt(invoiceSettings.dueDateDays, 10)
            const newDueDate = new Date()
            newDueDate.setDate(newDueDate.getDate() + days)
            setDueDate(newDueDate.toISOString().split("T")[0])
          }
          setSubmitSuccess(false)
          setNewClient({ name: "", company: "", email: "", phone: "" })
        }
      }, 2000)
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to save invoice"
        toast.error(`Error: ${message}`)
        console.error("Invoice operation failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }, [
    selectedClient,
    invoiceItems,
    invoiceDate,
    dueDate,
    invoiceSettings, // Added invoiceSettings to dependencies
    invoiceParameters, // Added invoiceParameters to dependencies
    onInvoiceCreate,
    onInvoiceUpdate,
    editInvoice,
    prefilledClient,
    newClient, // Added newClient to dependencies
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {editInvoice ? t("updated") : t("Create New Invoice")}
            </h1>
            <p className="text-gray-600">
              {editInvoice
                ? t("update") + " " + t("invoice")
                : prefilledClient
                  ? `${t("Creating")} ${t("invoice")} for ${prefilledClient.name}`
                  : t("Generate professional invoices for your clients")}
            </p>
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
            className={activeTab === "facture" ? "" : ""}
          >
            <FileText className="w-4 h-4 mr-2" />
            {t("Existing Client")}
          </Button>
          <Button
            variant={activeTab === "avoir" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("avoir")}
            className={activeTab === "avoir" ? "shadow-sm" : ""}
          >
            <FileText className="w-4 h-4 mr-2" />
            {t("New Client")}
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
              <span className="font-semibold text-green-800">
                {editInvoice ? t("updated") + " " + t("sucess") : t("Facture created successfully")}
              </span>
            </div>
            <p className="text-green-700 text-sm mt-1">{t("Your facture has been saved to the Journal")}</p>
          </CardContent>
        </Card>
      )}

      {/* Invoice Parameters */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("Invoice Parameters")}</h3>
          <div className="grid grid-cols-6 gap-4">
            {[
              { key: "invoiceNumber", label: t("Invoice Number") },
              { key: "dueDate", label: t("Due Date") },
              { key: "currency", label: t("Currency") },
              { key: "discount", label: t("Discount") },
              { key: "tax", label: t("Tax") },
              { key: "notes", label: t("Notes") },
            ].map(({ key, label }) => (
              <div key={key} className="flex flex-col items-center space-y-2">
                <Label className="text-xs text-gray-600 text-center">{label}</Label>
                <Switch
                  checked={invoiceParameters[key as keyof typeof invoiceParameters]}
                  onCheckedChange={(checked) => setInvoiceParameters((prev) => ({ ...prev, [key]: checked }))}
                />
              </div>
            ))}
          </div>

          {invoiceParameters.invoiceNumber && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prefix</Label>
                <Input
                  value={invoiceSettings.invoiceNumberPrefix}
                  onChange={(e) => setInvoiceSettings((prev) => ({ ...prev, invoiceNumberPrefix: e.target.value }))}
                />
              </div>
              <div>
                <Label>{t("Start Number")}</Label>
                <Input
                  value={invoiceSettings.invoiceNumberStart}
                  onChange={(e) => setInvoiceSettings((prev) => ({ ...prev, invoiceNumberStart: e.target.value }))}
                />
              </div>
            </div>
          )}

          {invoiceParameters.dueDate && (
            <div>
              <Label className="mb-2 block">{t("Due Date")}</Label>
              <RadioGroup
                value={invoiceSettings.dueDateType}
                onValueChange={(value) => setInvoiceSettings((prev) => ({ ...prev, dueDateType: value }))}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="customDate" />
                    <Label htmlFor="customDate">{t("Custom Date")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="term" id="paymentTerm" />
                    <Label htmlFor="paymentTerm">{t("Select Payment Term")}</Label>
                  </div>
                </div>
              </RadioGroup>

              {invoiceSettings.dueDateType === "custom" && (
                <Input
                  type="date"
                  value={invoiceSettings.dueDateCustom}
                  onChange={(e) => setInvoiceSettings((prev) => ({ ...prev, dueDateCustom: e.target.value }))}
                />
              )}

              {invoiceSettings.dueDateType === "term" && (
                <Select
                  value={invoiceSettings.dueDateDays}
                  onValueChange={(value) => setInvoiceSettings((prev) => ({ ...prev, dueDateDays: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">{t("7 jours après facturation")}</SelectItem>
                    <SelectItem value="10">{t("10 jours après facturation")}</SelectItem>
                    <SelectItem value="20">{t("20 jours après facturation")}</SelectItem>
                    <SelectItem value="30">{t("30 jours après facturation")}</SelectItem>
                    <SelectItem value="60">{t("60 jours après facturation")}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {invoiceParameters.currency && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("Currency")}</Label>
                <Select
                  value={invoiceSettings.currencyType}
                  onValueChange={(value) => setInvoiceSettings((prev) => ({ ...prev, currencyType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">{t("US Dollar")}</SelectItem>
                    <SelectItem value="EUR">{t("Euro")}</SelectItem>
                    <SelectItem value="TND">{t("Tunisian Dinar")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("Separator")}</Label>
                <Select
                  value={invoiceSettings.separator}
                  onValueChange={(value) => setInvoiceSettings((prev) => ({ ...prev, separator: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comma-dot">1,999.00</SelectItem>
                    <SelectItem value="dot-comma">1.999,00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("Sign Placement")}</Label>
                <Select
                  value={invoiceSettings.signPlacement}
                  onValueChange={(value) => setInvoiceSettings((prev) => ({ ...prev, signPlacement: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before">{t("Before Amount")}</SelectItem>
                    <SelectItem value="after">{t("After Amount")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("Decimal Places")}</Label>
                <Input
                  type="number"
                  min={0}
                  max={3}
                  value={invoiceSettings.decimals}
                  onChange={(e) => setInvoiceSettings((prev) => ({ ...prev, decimals: e.target.value }))}
                />
              </div>
            </div>
          )}

          {invoiceParameters.discount && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("Discount Type")}</Label>
                <RadioGroup
                  defaultValue={invoiceSettings.discountType}
                  onValueChange={(value) => setInvoiceSettings((prev) => ({ ...prev, discountType: value }))}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="percentage" id="percentage" />
                      <Label htmlFor="percentage">{t("Percentage")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fixed" id="fixed" />
                      <Label htmlFor="fixed">{t("Fixed Amount")}</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label>{t("Amount")}</Label>
                <Input
                  type="number"
                  value={invoiceSettings.discountAmount}
                  onChange={(e) => setInvoiceSettings((prev) => ({ ...prev, discountAmount: e.target.value }))}
                />
              </div>
            </div>
          )}

          {invoiceParameters.tax && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>{t("VAT Number")}</Label>
                <Input
                  value={invoiceSettings.vatNumber}
                  onChange={(e) => setInvoiceSettings((prev) => ({ ...prev, vatNumber: e.target.value }))}
                />
              </div>
              <div>
                <Label>{t("Tax Amount (%)")}</Label>
                <Input
                  type="number"
                  value={invoiceSettings.taxAmount}
                  onChange={(e) => setInvoiceSettings((prev) => ({ ...prev, taxAmount: e.target.value }))}
                />
              </div>
              <div>
                <Label>{t("Tax Method")}</Label>
                <Select
                  value={invoiceSettings.taxMethod}
                  onValueChange={(value) => setInvoiceSettings((prev) => ({ ...prev, taxMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">{t("Default Values")}</SelectItem>
                    <SelectItem value="inclusive">{t("autoliquidation")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {invoiceParameters.notes && (
            <div>
              <Label>{t("Default Notes")}</Label>
              <Textarea
                placeholder={t("Default Notes") + "..."}
                value={invoiceSettings.defaultNotes}
                onChange={(e) => setInvoiceSettings((prev) => ({ ...prev, defaultNotes: e.target.value }))}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t("Client Information")}</CardTitle>
          {activeTab === "facture" && (
            <p className="text-sm text-gray-600">
              {prefilledClient
                ? `Selected: ${prefilledClient.name} - ${prefilledClient.company}`
                : `${t("Available clients")}: ${availableClients.length}`}
              {availableClients.length === 0 && !prefilledClient && ` - ${t("Go to Clients page to add clients")}`}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {activeTab === "facture" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="client-select">
                  {t("Select Client")} <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Choose a client") + "..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {prefilledClient && (
                      <SelectItem key={prefilledClient.id} value={prefilledClient.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>
                            {prefilledClient.name} - {prefilledClient.company}
                          </span>
                          <span className={`text-xs ml-2 ${getStatusColor(prefilledClient.status)}`}>
                            {prefilledClient.status}
                          </span>
                        </div>
                      </SelectItem>
                    )}
                    {availableClients.length === 0 && !prefilledClient ? (
                      <SelectItem value="no-clients" disabled>
                        {t("No clients available ")} - {t("Add clients first")}
                      </SelectItem>
                    ) : (
                      availableClients
                        .filter((client) => !prefilledClient || client.id !== prefilledClient.id)
                        .map((client) => (
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
                      <Label className="text-sm font-medium text-gray-600">{t("Name & Company")}</Label>
                      <p className="text-gray-900">{getSelectedClientData()?.name}</p>
                      <p className="text-gray-600">{getSelectedClientData()?.company}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t("Contact")}</Label>
                      <p className="text-gray-900">{getSelectedClientData()?.email}</p>
                      <p className="text-gray-600">{getSelectedClientData()?.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t("Status")}</Label>
                      <p className={`font-medium ${getStatusColor(getSelectedClientData()?.status || "")}`}>
                        {getSelectedClientData()?.status}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t("Client ID")}</Label>
                      <p className="text-gray-900">{getSelectedClientData()?.id}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-name">{t("Name")}</Label>
                <Input
                  id="new-name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder={t("Client full name")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-company">{t("Company")}</Label>
                <Input
                  id="new-company"
                  value={newClient.company}
                  onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                  placeholder={t("Client company name")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-email">{t("Email")}</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  placeholder={t("Client email address")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-phone">{t("Phone")}</Label>
                <Input
                  id="new-phone"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  placeholder={t("Client phone number")}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products/Services */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t("Products")} / {t("Services")} <span className="text-red-500">*</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 pb-2 border-b text-sm font-medium text-gray-600">
              <div className="col-span-6">{t("Description")}</div>
              <div className="col-span-2">{t("Unit Price")}</div>
              <div className="col-span-2">{t("Quantity")}</div>
              <div className="col-span-2">{t("Total")}</div>
            </div>

            {/* Invoice Items */}
            {invoiceItems.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-6">
                  <Textarea
                    placeholder={t("Description") + "..."}
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
                    {invoiceSettings.currencyType} {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  {invoiceItems.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeInvoiceItem(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
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
              {t("Add New Item")}
            </Button>

            {/* Total */}
            <Separator />
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t("Subtotal")}:</span>
                  <span className="font-medium">
                    {invoiceSettings.currencyType} {calculateSubtotal().toFixed(2)}
                  </span>
                </div>
                {invoiceParameters.tax && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t("Tax")} ({invoiceSettings.taxAmount}%):</span>
                    <span className="font-medium">
                      {invoiceSettings.currencyType} {calculateTax().toFixed(2)}
                    </span>
                  </div>
                )}
                {invoiceParameters.discount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t("Discount")}:</span>
                    <span className="font-medium text-red-600">
                      - {invoiceSettings.currencyType} {calculateDiscount().toFixed(2)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>{t("Total")}:</span>
                  <span className="text-orange-600">
                    {invoiceSettings.currencyType} {calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => { handlesound(); handleSaveInvoice(); }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {editInvoice ? t("updated") + "..." : t("Creating") + "..."}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {editInvoice ? t("update") + " " + t("invoice") : t("Save & Preview")}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}