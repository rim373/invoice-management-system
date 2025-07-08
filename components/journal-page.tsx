"use client"

import { useState, useEffect,useRef  } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import {
  BookOpen,
  Search,
  Plus,
  Edit,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  CreditCard,
  History,
  Trash2,
} from "lucide-react"


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


interface JournalPageProps {
  invoices?: Invoice[]
  onInvoiceUpdate?: (invoices: Invoice[]) => void
  onInvoiceDelete?: (invoiceId: string) => void
}

export function JournalPage({ invoices: externalInvoices, onInvoiceUpdate, onInvoiceDelete }: JournalPageProps) {
  const receiptRef = useRef<HTMLDivElement>(null)
  const [activeStatus, setActiveStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer")
  const [paymentNote, setPaymentNote] = useState("")
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastPayment, setLastPayment] = useState<{
  payment: PaymentHistory
  invoice: Invoice
  paidUntilNow: number
  remaining: number
} | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null)

  // Use external invoices directly - no local state
  const [invoices, setInvoices] = useState<Invoice[]>([])

  useEffect(() => {
    if (externalInvoices) {
      console.log("Journal received invoices:", externalInvoices)
      setInvoices(externalInvoices)
    }
  }, [externalInvoices])

  const statusCounts = {
    paid: invoices.filter((inv) => inv.status === "paid").length,
    partial: invoices.filter((inv) => inv.status === "partial").length,
    pending: invoices.filter((inv) => inv.status === "pending").length,
    refunded: invoices.filter((inv) => inv.status === "refunded").length,
    cancelled: invoices.filter((inv) => inv.status === "cancelled").length,
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesStatus = activeStatus === "all" || invoice.status === activeStatus
    const matchesSearch =
      invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200"
      case "partial":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "refunded":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4" />
      case "partial":
        return <Clock className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      case "refunded":
        return <RefreshCw className="w-4 h-4" />
      case "cancelled":
        return <XCircle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "PAID"
      case "partial":
        return "PARTIALLY PAID"
      case "pending":
        return "PENDING"
      case "refunded":
        return "REFUNDED"
      case "cancelled":
        return "CANCELLED"
      default:
        return status.toUpperCase()
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toFixed(2)}`
  }

  const handleAddPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setPaymentAmount("")
    setPaymentMethod("bank_transfer")
    setPaymentNote("")
    setIsPaymentDialogOpen(true)
  }

  const handleDeleteInvoice = (invoice: Invoice) => {
    setInvoiceToDelete(invoice)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteInvoice = () => {
    if (invoiceToDelete && onInvoiceDelete) {
      console.log("Confirming deletion of invoice:", invoiceToDelete.id)
      onInvoiceDelete(invoiceToDelete.id)
    }
    setDeleteConfirmOpen(false)
    setInvoiceToDelete(null)
  }

  const handleSavePayment = () => {
    if (!selectedInvoice || !paymentAmount || Number.parseFloat(paymentAmount) <= 0) {
      return
    }

    const amount = Number.parseFloat(paymentAmount)
    const remainingAmount = selectedInvoice.totalAmount - selectedInvoice.paidAmount

    if (amount > remainingAmount) {
      alert("Payment amount cannot exceed remaining balance")
      return
    }

    const newPayment: PaymentHistory = {
      id: Date.now().toString(),
      amount: amount,
      date: new Date().toISOString().split("T")[0],
      method: paymentMethod,
      note: paymentNote || undefined,
    }

    const updatedInvoices = invoices.map((invoice) => {
      if (invoice.id === selectedInvoice.id) {
        const newPaidAmount = invoice.paidAmount + amount

        // Only auto-update status if it's currently pending or partial
        let newStatus = invoice.status
        if (invoice.status === "pending" || invoice.status === "partial") {
          newStatus = newPaidAmount >= invoice.totalAmount ? "paid" : newPaidAmount > 0 ? "partial" : "pending"
        }

        const updatedInvoice = {
          ...invoice,
          paidAmount: newPaidAmount,
          status: newStatus as "paid" | "partial" | "pending" | "refunded" | "cancelled",
          paymentHistory: [...invoice.paymentHistory, newPayment],
        }

        // Set receipt data
        setLastPayment({
          payment: newPayment,
          invoice: updatedInvoice,
          paidUntilNow: newPaidAmount,
          remaining: updatedInvoice.totalAmount - newPaidAmount
        })

        return updatedInvoice
      }
      return invoice
    })

    if (onInvoiceUpdate) {
      onInvoiceUpdate(updatedInvoices)
    }

    setIsPaymentDialogOpen(false)
    setSelectedInvoice(null)

    // Show receipt popup
    setShowReceipt(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice Journal</h1>
            <p className="text-gray-600">Track and manage all your invoices ({invoices.length} total)</p>
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Button
                variant={activeStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveStatus("all")}
                className={activeStatus === "all" ? "bg-orange-500 hover:bg-orange-600" : "bg-transparent"}
              >
                ALL ({invoices.length})
              </Button>
              <Button
                variant={activeStatus === "paid" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveStatus("paid")}
                className={activeStatus === "paid" ? "bg-green-500 hover:bg-green-600" : "bg-transparent"}
              >
                PAID ({statusCounts.paid})
              </Button>
              <Button
                variant={activeStatus === "partial" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveStatus("partial")}
                className={activeStatus === "partial" ? "bg-yellow-500 hover:bg-yellow-600" : "bg-transparent"}
              >
                PARTIALLY PAID ({statusCounts.partial})
              </Button>
              <Button
                variant={activeStatus === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveStatus("pending")}
                className={activeStatus === "pending" ? "bg-blue-500 hover:bg-blue-600" : "bg-transparent"}
              >
                PENDING ({statusCounts.pending})
              </Button>
              <Button
                variant={activeStatus === "refunded" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveStatus("refunded")}
                className={activeStatus === "refunded" ? "bg-purple-500 hover:bg-purple-600" : "bg-transparent"}
              >
                REFUNDED ({statusCounts.refunded})
              </Button>
              <Button
                variant={activeStatus === "cancelled" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveStatus("cancelled")}
                className={activeStatus === "cancelled" ? "bg-red-500 hover:bg-red-600" : "bg-transparent"}
              >
                CANCELLED ({statusCounts.cancelled})
              </Button>
            </div>

            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Filter by client..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice List */}
      <div className="space-y-4">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Badge className={`${getStatusColor(invoice.status)} flex items-center space-x-1`}>
                    {getStatusIcon(invoice.status)}
                    <span>{getStatusLabel(invoice.status)}</span>
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <FileText className="w-4 h-4 text-gray-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                      onClick={() => handleDeleteInvoice(invoice)}
                      title="Delete Invoice"
                    >
                      <XCircle className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 uppercase tracking-wide">CLIENT</p>
                  <p className="font-semibold text-gray-900">{invoice.clientName}</p>
                  <p className="text-sm text-gray-600">{invoice.clientCompany}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 uppercase tracking-wide">INVOICE NUMBER</p>
                  <p className="font-semibold text-blue-600">{invoice.number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 uppercase tracking-wide">TOTAL VALUE</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(invoice.totalAmount, invoice.currency)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 uppercase tracking-wide">CREATED</p>
                  <p className="font-semibold text-gray-900">{invoice.createdDate}</p>
                </div>
              </div>

              {/* Invoice Items Details */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Invoice Items ({invoice.items.length})</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="space-y-2">
                    {invoice.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <div className="flex-1">
                          <span className="font-medium">{item.description}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-gray-600">
                          <span>
                            {item.quantity} × {formatCurrency(item.unitPrice, invoice.currency)}
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(item.totalPrice, invoice.currency)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(invoice.subtotalAmount, invoice.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax ({invoice.taxRate}%):</span>
                    <span>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>{formatCurrency(invoice.totalAmount, invoice.currency)}</span>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Payments</h3>
                  <Button
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => handleAddPayment(invoice)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Payment
                  </Button>
                </div>

                {/* Payment History */}
                {invoice.paymentHistory.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <History className="w-4 h-4 mr-2" />
                      Payment History
                    </h4>
                    <div className="space-y-2">
                      {invoice.paymentHistory.map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center text-sm">
                          <div>
                            <span className="font-medium">
                              {formatCurrency(payment.amount, invoice.currency)}
                            </span>
                            <span className="text-gray-600 ml-2">via {payment.method.replace("_", " ")}</span>
                            {payment.note && <span className="text-gray-500 ml-2">- {payment.note}</span>}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">{payment.date}</span>
                            <Button
                              variant="outline"
                              size="xs"
                              className="text-xs"
                              onClick={() => {
                                const index = invoice.paymentHistory.findIndex(p => p.id === payment.id)
                                const paidUntilNow = invoice.paymentHistory
                                  .slice(0, index + 1)
                                  .reduce((sum, p) => sum + p.amount, 0)
                                const remaining = invoice.totalAmount - paidUntilNow

                                setLastPayment({
                                  payment,
                                  invoice,
                                  paidUntilNow,
                                  remaining,
                                })
                                setShowReceipt(true)
                              }}
                            >
                              Show Receipt
                            </Button>

                          </div>
                        </div>
                      ))}

                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-semibold">{formatCurrency(invoice.totalAmount, invoice.currency)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Paid</p>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(invoice.paidAmount, invoice.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Remaining</p>
                    <p className="font-semibold text-orange-600">
                      {formatCurrency(invoice.totalAmount - invoice.paidAmount, invoice.currency)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Select
                    defaultValue={invoice.status}
                    onValueChange={(value) => {
                      const updatedInvoices = invoices.map((inv) => {
                        if (inv.id === invoice.id) {
                          return {
                            ...inv,
                            status: value as "paid" | "partial" | "pending" | "refunded" | "cancelled",
                          }
                        }
                        return inv
                      })
                      if (onInvoiceUpdate) {
                        onInvoiceUpdate(updatedInvoices)
                      }
                    }}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span>PENDING</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="paid">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>PAID</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="partial">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-yellow-500" />
                          <span>PARTIALLY PAID</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="refunded">
                        <div className="flex items-center space-x-2">
                          <RefreshCw className="w-4 h-4 text-purple-500" />
                          <span>REFUNDED</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="cancelled">
                        <div className="flex items-center space-x-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span>CANCELLED</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      MODIFY
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      VIEW
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInvoices.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-600">
              {invoices.length === 0
                ? "You haven't created any invoices yet. Go to the Facture page to create your first invoice."
                : "No invoices match your current filters."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              <span>Delete Invoice</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice <strong>{invoiceToDelete?.number}</strong> for{" "}
              <strong>{invoiceToDelete?.clientName}</strong>?
              <br />
              <br />
              This action cannot be undone. All payment history and invoice data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteInvoice} className="bg-red-600 hover:bg-red-700">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Invoice
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
            <DialogDescription>
              Add a payment for invoice {selectedInvoice?.number}. Remaining balance:{" "}
              {selectedInvoice &&
                formatCurrency(selectedInvoice.totalAmount - selectedInvoice.paidAmount, selectedInvoice.currency)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment-amount" className="text-right">
                Amount
              </Label>
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                min="0.01"
                max={selectedInvoice ? selectedInvoice.totalAmount - selectedInvoice.paidAmount : undefined}
                className="col-span-3"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment-method" className="text-right">
                Method
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment-note" className="text-right">
                Note
              </Label>
              <Input
                id="payment-note"
                className="col-span-3"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Optional note..."
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleSavePayment}>
              <CreditCard className="w-4 h-4 mr-2" />
              Add Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Receipt Dialog */}
      
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="sm:max-w-[600px] font-mono text-sm text-black">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold">REÇU DE PAIEMENT</DialogTitle>
            <DialogDescription className="text-center text-gray-500">
              Confirmation de la Transaction
            </DialogDescription>
          </DialogHeader>

          

          {lastPayment && (
            <div ref={receiptRef} className="space-y-4 p-4 border text-sm">
              <div className="flex justify-between">
                <span>REÇU N° :</span>
                <span>RCP-{lastPayment.payment.id}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE :</span>
                <span>{lastPayment.payment.date}</span>
              </div>
              <div className="flex justify-between">
                <span>HEURE :</span>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between">
                <span>CLIENT :</span>
                <span>{lastPayment.invoice.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span>FACTURE N° :</span>
                <span>{lastPayment.invoice.number}</span>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between">
                <span>MOYEN DE PAIEMENT :</span>
                <span>
                  {lastPayment.payment.method === "cash"
                    ? "Espèce"
                    : lastPayment.payment.method.replace("_", " ")}
                </span>
              </div>

              <Separator className="my-2 border-t-2" />

              <div className="flex justify-between text-base font-bold">
                <span>MONTANT PAYÉ :</span>
                <span>
                  {lastPayment.invoice.currency.toUpperCase()} {lastPayment.payment.amount.toFixed(2)}
                </span>
              </div>

              <Separator className="my-2 border-t-2" />

              <div className="flex justify-between">
                <span>TOTAL PAYÉ :</span>
                <span>
                  {lastPayment.invoice.currency.toUpperCase()} {lastPayment.paidUntilNow.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>RESTANT :</span>
                <span>
                  {lastPayment.invoice.currency.toUpperCase()} {lastPayment.remaining.toFixed(2)}
                </span>
              </div>


              <Separator className="my-2" />
              <p className="text-center text-xs text-gray-500">Merci pour votre paiement !</p>
            </div>
          )}
          {/* Print Button */}
          <div className="flex justify-end p-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (!receiptRef.current) return

                const printWindow = window.open("", "PRINT", "height=600,width=800")
                if (printWindow) {
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Reçu</title>
                        <style>
                          body {
                            font-family: monospace;
                            padding: 20px;
                            font-size: 14px;
                          }
                          .line {
                            display: flex;
                            justify-content: space-between;
                            margin: 4px 0;
                          }
                          .title {
                            text-align: center;
                            font-weight: bold;
                            margin-bottom: 10px;
                            font-size: 16px;
                          }
                          hr {
                            border: none;
                            border-top: 1px dashed #999;
                            margin: 10px 0;
                          }
                        </style>
                      </head>
                      <body>
                        ${receiptRef.current.innerHTML}
                      </body>
                    </html>
                  `)
                  printWindow.document.close()
                  printWindow.focus()
                  printWindow.print()
                  printWindow.close()
                }
              }}
            >
              🖨️ Imprimer le reçu
            </Button>
          </div>

        </DialogContent>
      </Dialog>

    </div>
  )
}
