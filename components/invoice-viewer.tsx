"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Download, Printer, Settings } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {useTranslations} from "next-intl"
// Company Settings Interface
interface MySettings {
  adress: string
  image: string
  storageUrl: string
  name: string
  email: string
  companyName: string
  phoneNumber: string
}

// Default Company Settings
const MY_SETTINGS: MySettings = {
  adress: "technopol el ghazela",
  image: "/placeholder.svg?height=80&width=200&text=Your+Company+Logo",
  storageUrl: "C:/Users/rimba/Downloads/invoices", // Local folder path for PDF storage
  name: "rim",
  email: "contact@sucom.com",
  companyName: "supcom",
  phoneNumber: "+1 (555) 123-4567",
}

// Removed exampleInvoice as it will now come from props

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
  // New optional settings fields
  discount?: boolean
  tax?: boolean
  notes?: boolean
  dueDateType?: string // Made optional as it might not always be present
  dueDateDays?: string // Made optional
  dueDateCustom?: string // Made optional
  vatNumber?: string
  taxMethod?: string
  currencyType?: string // Made optional
  separator?: string
  signPlacement?: string
  decimals?: string
  discountType?: string
  discountAmount?: string
  defaultNotes?: string
  saveLocation?: string
  dateFormat?: string
}

interface InvoiceTemplate {
  id: string
  name: string
  description: string
}

interface InvoiceViewerProps {
  invoice: Invoice | null
  isOpen: boolean
  onClose: () => void
}




export function InvoicePreview({ isOpen, onClose }: InvoiceViewerProps) {
  //translation
  const t = useTranslations("invoiceViewer")




export function InvoicePreview({ invoice, isOpen, onClose }: InvoiceViewerProps) {

  const t = useTranslations("invoiceViewer")

  const templates: InvoiceTemplate[] = [
    {
      id: "standard",
      name: t("templates.standard.name"),
      description: t("templates.standard.description")
    },
    {
      id: "spreadsheet",
      name: t("templates.spreadsheet.name"),
      description: t("templates.spreadsheet.description")
    },
    {
      id: "continental",
      name: t("templates.continental.name"),
      description: t("templates.continental.description")
    },
    {
      id: "compact",
      name: t("templates.compact.name"),
      description: t("templates.compact.description")
    }
  ]

  

  

  // Add these helper functions inside your InvoiceViewer component

  const hasValue = (value: any): boolean => {
    return value !== null && value !== undefined && value !== "" && value !== false
  }

  const formatCurrencyWithSettings = (amount: number, currencyType: string, invoice: Invoice) => {
    const decimals = invoice.decimals ? Number.parseInt(invoice.decimals) : 2
    const separator = invoice.separator || "."
    const unit = invoice.currencyType || "EUR" // Default to EUR if not provided
    const placement = invoice.signPlacement || "before"

    const formattedAmount = amount.toFixed(decimals).replace(".", separator)

    return placement === "before" ? `${unit}${formattedAmount}` : `${formattedAmount}${unit}`
  }

  const formatDateWithSettings = (dateString: string, invoice: Invoice) => {
    const date = new Date(dateString)
    const format = invoice.dateFormat || "en-GB"

    switch (format) {
      case "US":
        return date.toLocaleDateString("en-US")
      case "ISO":
        return date.toISOString().split("T")[0]
      case "EU":
        return date.toLocaleDateString("en-GB")
      default:
        return date.toLocaleDateString("en-GB")
    }
  }

  const calculateDueDateForDisplay = (invoice: Invoice) => {
    // Calculate based on settings
    if (invoice.dueDateType === "costum" && invoice.dueDateDays) {
      // For "costum" type, use dueDateDays as the actual date
      return invoice.dueDateDays
    } else if (invoice.dueDateType === "term") {
      // For "term" type, return empty string (no due date shown)
      return ""
    }

    // Fallback: 30 days from invoice date
    const invoiceDateObj = new Date(invoice.createdDate)
    const fallbackDueDate = new Date(invoiceDateObj.getTime() + 30 * 24 * 60 * 60 * 1000)
    return fallbackDueDate.toISOString().split("T")[0]
  }

  const calculateDiscountAmount = (invoice: Invoice) => {
    if (!hasValue(invoice.discountAmount) || !hasValue(invoice.discountType)) return 0

    const discountValue = Number.parseFloat(invoice.discountAmount ?? "0")

    if (invoice.discountType === "percentage") {
      return (invoice.subtotalAmount * discountValue) / 100
    }

    return discountValue
  }

  const getInvoiceNumber = (invoice: Invoice) => {
    // Assuming invoice.id is part of the invoice number or a unique identifier
    // If invoice.number is already the full number, just return that.
    // Otherwise, combine them if needed.
    return invoice.number
  }

  //UPDATE FOR THE PDF

  //TEMPATE
  const [selectedTemplate, setSelectedTemplate] = useState("spreadsheet")
  const [customization, setCustomization] = useState({
    backgroundColor: "#ffffff",
    labelColor: "#374151",
    fontColor: "#111827",
    accentColor: "#f97316",
    logoUrl: MY_SETTINGS.image, // Use company logo from settings
    logoOption: "my-logo",
  })

  const [showCustomization, setShowCustomization] = useState(false)
  const invoiceRef = useRef<HTMLDivElement | null>(null)

  if (!invoice) return null

  // Replace the existing formatCurrency function with this updated version

  const formatCurrency = (amount: number, currencyType: string) => {
    return formatCurrencyWithSettings(amount, currencyType, invoice)
  }

  const formatDate = (dateString: string) => {
    return formatDateWithSettings(dateString, invoice)
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setCustomization((prev) => ({
          ...prev,
          logoUrl: result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePrint = () => {
    if (!invoiceRef.current) return

    const printWindow = window.open("", "PRINT", "height=800,width=1200")
    if (printWindow) {
      printWindow.document.write(`
      <html>
        <head>
          <title>${t("invoiceTitle")} ${invoice.number}</title>
          <style>
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
              color: ${customization.fontColor};
              line-height: 1.5;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: ${customization.backgroundColor};
              padding: 40px;
              border-radius: 8px;
            }
            
            /* Header Styles */
            .flex {
              display: flex;
            }
            .justify-between {
              justify-content: space-between;
            }
            .items-start {
              align-items: flex-start;
            }
            .items-center {
              align-items: center;
            }
            .mb-8 {
              margin-bottom: 2rem;
            }
            .mb-6 {
              margin-bottom: 1.5rem;
            }
            .mb-4 {
              margin-bottom: 1rem;
            }
            .mb-3 {
              margin-bottom: 0.75rem;
            }
            .mb-2 {
              margin-bottom: 0.5rem;
            }
            .mt-2 {
              margin-top: 0.5rem;
            }
            .mt-4 {
              margin-top: 1rem;
            }
            .mt-8 {
              margin-top: 2rem;
            }
            .mt-12 {
              margin-top: 3rem;
            }
            .p-3 {
              padding: 0.75rem;
            }
            .p-4 {
              padding: 1rem;
            }
            .p-6 {
              padding: 1.5rem;
            }
            .pt-2 {
              padding-top: 0.5rem;
            }
            .pt-4 {
              padding-top: 1rem;
            }
            .pt-8 {
              padding-top: 2rem;
            }
            .py-2 {
              padding-top: 0.5rem;
              padding-bottom: 0.5rem;
            }
            .py-3 {
              padding-top: 0.75rem;
              padding-bottom: 0.75rem;
            }
            .py-4 {
              padding-top: 1rem;
              padding-bottom: 1rem;
            }
            
            /* Text Styles */
            .text-2xl {
              font-size: 1.5rem;
              line-height: 2rem;
            }
            .text-3xl {
              font-size: 1.875rem;
              line-height: 2.25rem;
            }
            .text-xl {
              font-size: 1.25rem;
              line-height: 1.75rem;
            }
            .text-lg {
              font-size: 1.125rem;
              line-height: 1.75rem;
            }
            .text-sm {
              font-size: 0.875rem;
              line-height: 1.25rem;
            }
            .text-xs {
              font-size: 0.75rem;
              line-height: 1rem;
            }
            .font-bold {
              font-weight: 700;
            }
            .font-semibold {
              font-weight: 600;
            }
            .font-medium {
              font-weight: 500;
            }
            .text-center {
              text-align: center;
            }
            .text-right {
              text-align: right;
            }
            .text-left {
              text-align: left;
            }
            .uppercase {
              text-transform: uppercase;
            }
            .tracking-wide {
              letter-spacing: 0.025em;
            }
            
            /* Layout Styles */
            .w-48 {
              width: 12rem;
            }
            .w-64 {
              width: 16rem;
            }
            .w-80 {
              width: 20rem;
            }
            .w-full {
              width: 100%;
            }
            .h-16 {
              height: 4rem;
            }
            .h-20 {
              height: 5rem;
            }
            .h-12 {
              height: 3rem;
            }
            .space-y-2 > * + * {
              margin-top: 0.5rem;
            }
            .space-y-4 > * + * {
              margin-top: 1rem;
            }
            .space-x-4 > * + * {
              margin-left: 1rem;
            }
            .flex-1 {
              flex: 1 1 0%;
            }
            
            /* Grid Styles */
            .grid {
              display: grid;
            }
            .grid-cols-2 {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
            .gap-4 {
              gap: 1rem;
            }
            .gap-8 {
              gap: 2rem;
            }
            
            /* Background and Border Styles */
            .bg-gray-50 {
              background-color: #f9fafb;
            }
            .bg-gray-100 {
              background-color: #f3f4f6;
            }
            .bg-white {
              background-color: white;
            }
            .rounded {
              border-radius: 0.25rem;
            }
            .rounded-lg {
              border-radius: 0.5rem;
            }
            .border-b {
              border-bottom-width: 1px;
              border-color: #e5e7eb;
            }
            .border-t {
              border-top-width: 1px;
              border-color: #e5e7eb;
            }
            .border-b-2 {
              border-bottom-width: 2px;
            }
            .border-t-2 {
              border-top-width: 2px;
            }
            .border-gray-200 {
              border-color: #e5e7eb;
            }
            .border-gray-100 {
              border-color: #f3f4f6;
            }
            
            /* Table Styles */
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              padding: 0.75rem;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
            }
            th {
              background: ${customization.accentColor};
              color: white;
              font-weight: 600;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            
            /* Color Classes */
            .text-gray-600 {
              color: #4b5563;
            }
            .text-gray-500 {
              color: #6b7280;
            }
            
            /* Separator */
            .separator {
              height: 1px;
              background-color: #e5e7eb;
              margin: 0.5rem 0;
            }
            
            /* Template Specific Styles */
            ${
              selectedTemplate === "continental"
                ? `
              .border-accent {
                border-color: ${customization.accentColor};
              }
            `
                : ""
            }
            
            ${
              selectedTemplate === "compact"
                ? `
              .text-2xl-compact {
                font-size: 1.5rem;
                line-height: 2rem;
              }
            `
                : ""
            }
            
            @media print {
              body { 
                margin: 0; 
                padding: 0; 
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
              .invoice-container { 
                padding: 20px; 
                box-shadow: none;
                border-radius: 0;
              }
              * {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
            }
              /* Add these additional CSS classes to your print CSS in handlePrint function */

            /* Notes Section Styles */
            .notes-section {
              margin-top: 2rem;
              padding: 1rem;
              background-color: #f9fafb;
              border-radius: 0.5rem;
            }

            .notes-title {
              font-weight: 600;
              margin-bottom: 0.5rem;
            }

            .notes-content {
              font-size: 0.875rem;
              line-height: 1.5;
            }

            /* Discount Styles */
            .discount-row {
              color: #dc2626;
            }

            .discount-amount {
              font-weight: 500;
            }

            /* VAT Number Styles */
            .vat-number {
              margin-top: 0.5rem;
              font-size: 0.875rem;
            }

            .vat-label {
              font-weight: 500;
            }

            /* Terms Styles */
            .terms-row {
              font-size: 0.875rem;
              font-style: italic;
            }

            /* Additional spacing utilities */
            .space-y-1 > * + * {
              margin-top: 0.25rem;
            }

            .space-y-3 > * + * {
              margin-top: 0.75rem;
            }
          </style>
        </head>
        <body>
          ${invoiceRef.current.innerHTML}
        </body>
      </html>
    `)
      printWindow.document.close()
      printWindow.focus()

      // Wait for styles to load before printing
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }
  }

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return

    try {
      // Dynamic import of jsPDF to avoid SSR issues
      const { jsPDF } = await import("jspdf")
      const html2canvas = (await import("html2canvas")).default

      // Create a clone of the invoice element for PDF generation
      const element = invoiceRef.current.cloneNode(true) as HTMLElement

      // Apply styles to ensure proper rendering
      element.style.width = "800px"
      element.style.backgroundColor = customization.backgroundColor
      element.style.padding = "40px"
      element.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

      // Temporarily append to body for rendering
      element.style.position = "absolute"
      element.style.left = "-9999px"
      element.style.top = "0"
      document.body.appendChild(element)

      // Generate canvas from HTML
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: customization.backgroundColor,
        width: 800,
        height: element.scrollHeight,
      })

      // Remove the temporary element
      document.body.removeChild(element)

      // Create PDF
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Calculate dimensions to fit A4
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pdfWidth - 20 // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Add image to PDF
      let heightLeft = imgHeight
      let position = 10 // 10mm top margin

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight - 20 // Account for margins

      // Add new pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight - 20
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const filename = `invoice-${invoice.number}-${timestamp}.pdf`

      // Note: In a browser environment, we can't directly save to a specific local folder
      // The file will be downloaded to the user's default download folder
      // For actual local folder saving, you'd need a desktop app or server-side solution
      console.log(t("log.pdfPath"),{ path: `${MY_SETTINGS.storageUrl}/${filename}` })

      // Download the PDF
      pdf.save(filename)
    } catch (error) {
      console.error(t("errors.pdfFail"), error)
      // Fallback to print if PDF generation fails
      alert(t("errors.pdfGenerationFailed"))
      handlePrint()
    }
  }

  const renderInvoiceTemplate = () => {
    // Common calculations used across all templates
    const discountAmount = calculateDiscountAmount(invoice)
    const subtotalAfterDiscount = invoice.subtotalAmount - discountAmount

    // Common components that can be reused
    const CompanyInfo = () => (
      <div className="company-info">
        {customization.logoUrl && (
          <img src={customization.logoUrl || "/placeholder.svg"} alt={t("companyLogoAlt")}className="h-16 mb-4" />
        )}
        <h1 className="text-2xl font-bold" style={{ color: customization.accentColor }}>
          {MY_SETTINGS.companyName}
        </h1>
        <p className="text-gray-600">{MY_SETTINGS.adress}</p>
        <p className="text-gray-600">{MY_SETTINGS.email}</p>
        <p className="text-gray-600">{MY_SETTINGS.phoneNumber}</p>

        {hasValue(invoice.vatNumber) && (
          <p className="text-gray-600 mt-2">
            <span className="font-medium">{t("details.vatLabel")}: </span>
            {invoice.vatNumber}
          </p>
        )}
      </div>
    )

    const InvoiceDetails = ({ className = "", titleStyle = {} }) => {
      const dueDate = calculateDueDateForDisplay(invoice)

      return (
        <div className={`invoice-details ${className}`}>
          <h2 className="text-2xl font-bold mb-4" style={{ ...titleStyle, color: customization.labelColor }}>
            {t("details.taxInvoiceTitle")}
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between w-48">
              <span style={{ color: customization.labelColor }}>{t("details.invoiceNumber")}#:</span>
              <span style={{ color: customization.fontColor }}>{getInvoiceNumber(invoice)}</span>
            </div>
            <div className="flex justify-between w-48">
              <span style={{ color: customization.labelColor }}>{t("details.invoiceDate")}:</span>
              <span style={{ color: customization.fontColor }}>
                {formatDateWithSettings(invoice.createdDate, invoice)}
              </span>
            </div>
            {dueDate && (
              <div className="flex justify-between w-48">
                <span style={{ color: customization.labelColor }}>{t("details.dueDate")}:</span>
                <span style={{ color: customization.fontColor }}>{formatDateWithSettings(dueDate, invoice)}</span>
              </div>
            )}

            {invoice.dueDateType === "term" && invoice.dueDateCustom && (
              <div className="flex justify-between w-48">
                <span style={{ color: customization.labelColor }}>{t("details.terms")}:</span>
                <span style={{ color: customization.fontColor }}>{invoice.dueDateCustom}</span>
              </div>
            )}
          </div>
        </div>
      )
    }

    const ClientInfo = ({ className = "", title = t("clientInfo.billTo") }) => (
      <div className={`client-info ${className}`}>
        <h3 className="font-semibold mb-2" style={{ color: customization.labelColor }}>
          {title}
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="font-medium" style={{ color: customization.fontColor }}>
            {invoice.clientName}
          </p>
          <p style={{ color: customization.fontColor }}>{invoice.clientCompany}</p>
          <p style={{ color: customization.fontColor }}>{invoice.clientEmail}</p>
          <p style={{ color: customization.fontColor }}>{invoice.clientPhone}</p>
        </div>
      </div>
    )

    const ItemsTable = ({ isCompact = false }) => (
      <table className="w-full border-collapse mb-8">
        <thead>
          <tr style={{ backgroundColor: customization.accentColor }}>
            <th className="text-left p-3 text-white">{t("itemsTable.itemAndDescription")}</th>
            <th className="text-center p-3 text-white">{t("itemsTable.qty")}</th>
            <th className="text-right p-3 text-white">{t("itemsTable.rate")}</th>
            <th className="text-right p-3 text-white">{t("itemsTable.amount")}</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={item.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
              <td className="p-3">
                <div>
                  <p className={`font-medium ${isCompact ? "text-sm" : ""}`} style={{ color: customization.fontColor }}>
                    {item.description.split("\n")[0]}
                  </p>
                  {item.description
                    .split("\n")
                    .slice(1)
                    .map((line, i) => (
                      <p key={i} className="text-sm text-gray-600">
                        {line}
                      </p>
                    ))}
                </div>
              </td>
              <td
                className={`p-3 text-center ${isCompact ? "text-sm" : ""}`}
                style={{ color: customization.fontColor }}
              >
                {item.quantity}
              </td>
              <td className={`p-3 text-right ${isCompact ? "text-sm" : ""}`} style={{ color: customization.fontColor }}>
                {formatCurrencyWithSettings(item.unitPrice, invoice.currencyType || "EUR", invoice)}
              </td>
              <td
                className={`p-3 text-right font-medium ${isCompact ? "text-sm" : ""}`}
                style={{ color: customization.fontColor }}
              >
                {formatCurrencyWithSettings(item.totalPrice, invoice.currencyType || "EUR", invoice)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )

    const ItemsList = ({ isCompact = false }) => (
      <div className="space-y-2 mb-6">
        {invoice.items.map((item, index) => (
          <div
            key={item.id}
            className={`flex justify-between items-center py-2 border-b border-gray-100 ${isCompact ? "py-1" : ""}`}
          >
            <div className="flex-1">
              <p className={`font-medium ${isCompact ? "text-sm" : ""}`} style={{ color: customization.fontColor }}>
                {item.description.split("\n")[0]}
              </p>
              <p className="text-xs text-gray-600">
                {item.quantity} × {formatCurrencyWithSettings(item.unitPrice, invoice.currencyType || "EUR", invoice)}
              </p>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${isCompact ? "text-sm" : ""}`} style={{ color: customization.fontColor }}>
                {formatCurrencyWithSettings(item.totalPrice, invoice.currencyType || "EUR", invoice)}
              </p>
            </div>
          </div>
        ))}
      </div>
    )

    const TotalsSection = ({ className = "", isCompact = false }) => (
      <div className={`flex justify-end ${className}`}>
        <div className={isCompact ? "w-64" : "w-80"}>
          <div className="space-y-2">
            <div className="flex justify-between py-2">
              <span style={{ color: customization.labelColor }}>{t("details.invoiceSubTotal")}:</span>
              <span style={{ color: customization.fontColor }}>
                {formatCurrencyWithSettings(invoice.subtotalAmount, invoice.currencyType || "EUR", invoice)}
              </span>
            </div>

            {discountAmount > 0 && (
              <>
                <div className="flex justify-between py-2">
                  <span style={{ color: customization.labelColor }}>
                    {t("details.discount")} {invoice.discountType === "percentage" ? `(${invoice.discountAmount}%)` : ""}:
                  </span>
                  <span style={{ color: customization.fontColor }}>
                    -{formatCurrencyWithSettings(discountAmount, invoice.currencyType || "EUR", invoice)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span style={{ color: customization.labelColor }}>{t("details.afterDiscount")}:</span>
                  <span style={{ color: customization.fontColor }}>
                    {formatCurrencyWithSettings(subtotalAfterDiscount, invoice.currencyType || "EUR", invoice)}
                  </span>
                </div>
              </>
            )}

            <div className="flex justify-between py-2">
              <span style={{ color: customization.labelColor }}>
                {t("details.tax")} ({invoice.taxRate}%){hasValue(invoice.taxMethod) ? ` - ${invoice.taxMethod}` : ""}:
              </span>
              <span style={{ color: customization.fontColor }}>
                {formatCurrencyWithSettings(invoice.taxAmount, invoice.currencyType || "EUR", invoice)}
              </span>
            </div>

            <Separator />
            <div className={`flex justify-between py-3 font-bold ${isCompact ? "text-base" : "text-lg"}`}>
              <span style={{ color: customization.labelColor }}>{t("details.Total")}:</span>
              <span style={{ color: customization.accentColor }}>
                {formatCurrencyWithSettings(invoice.totalAmount, invoice.currencyType || "EUR", invoice)}
              </span>
            </div>
          </div>
        </div>
      </div>
    )

    const NotesSection = ({ className = "" }) =>
      hasValue(invoice.defaultNotes) && (
        <div className={`mt-8 p-4 bg-gray-50 rounded-lg ${className}`}>
          <h3 className="font-semibold mb-2" style={{ color: customization.labelColor }}>
            {t("notes.title")}:
          </h3>
          <p className="text-sm" style={{ color: customization.fontColor }}>
            {invoice.defaultNotes}
          </p>
        </div>
      )

    const Footer = ({ className = "" }) => (
      <div className={`mt-12 pt-8 border-t border-gray-200 ${className}`}>
        <p className="text-sm text-gray-600 text-center">{t("footer.thankYou")}!</p>
      </div>
    )

    // Template-specific rendering
    switch (selectedTemplate) {
      case "spreadsheet":
        return (
          <div
            ref={invoiceRef}
            className="invoice-container bg-white p-8 rounded-lg shadow-sm"
            style={{ backgroundColor: customization.backgroundColor }}
          >
            <div className="flex justify-between items-start mb-8">
              <CompanyInfo />
              <InvoiceDetails className="text-right" />
            </div>

            <ClientInfo className="mb-8" />
            <ItemsTable />
            <TotalsSection />
            <NotesSection />
            <Footer />
          </div>
        )

      case "standard":
        return (
          <div
            ref={invoiceRef}
            className="invoice-container bg-white p-8 rounded-lg shadow-sm"
            style={{ backgroundColor: customization.backgroundColor }}
          >
            <div className="text-center mb-8">
              {customization.logoUrl && (
                <img
                  src={customization.logoUrl || "/placeholder.svg"}
                  alt={t("companyLogoAlt")}
                  className="h-20 mx-auto mb-4"
                />
              )}
              <h1 className="text-3xl font-bold" style={{ color: customization.accentColor }}>
                {t("invoiceTitle")}
              </h1>
              <p className="text-lg mt-2" style={{ color: customization.fontColor }}>
                #{getInvoiceNumber(invoice)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold mb-2" style={{ color: customization.labelColor }}>
                  {t("From")}:
                </h3>
                <p style={{ color: customization.fontColor }}>{MY_SETTINGS.companyName}</p>
                <p style={{ color: customization.fontColor }}>123 Business Street</p>
                <p style={{ color: customization.fontColor }}>City, State 12345</p>
                <p style={{ color: customization.fontColor }}>{MY_SETTINGS.email}</p>
                <p style={{ color: customization.fontColor }}>{MY_SETTINGS.phoneNumber}</p>
                {hasValue(invoice.vatNumber) && (
                  <p style={{ color: customization.fontColor }}>{t("details.vatLabel")}: {invoice.vatNumber}</p>
                )}
              </div>
              <div>
                <h3 className="font-semibold mb-2" style={{ color: customization.labelColor }}>
                  {t("templates.standard.to")}:
                </h3>
                <p style={{ color: customization.fontColor }}>{invoice.clientName}</p>
                <p style={{ color: customization.fontColor }}>{invoice.clientCompany}</p>
                <p style={{ color: customization.fontColor }}>{invoice.clientEmail}</p>
                <p style={{ color: customization.fontColor }}>{invoice.clientPhone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p>
                  <span style={{ color: customization.labelColor }}>{t("details.invoiceDate")}: </span>
                  <span style={{ color: customization.fontColor }}>
                    {formatDateWithSettings(invoice.createdDate, invoice)}
                  </span>
                </p>
              </div>
              <div>
                <p>
                  <span style={{ color: customization.labelColor }}>{t("details.dueDate")}: </span>
                  <span style={{ color: customization.fontColor }}>
                    {formatDateWithSettings(calculateDueDateForDisplay(invoice), invoice)}
                  </span>
                </p>
              </div>
            </div>

            <ItemsList />
            <TotalsSection />
            <NotesSection />
            <Footer />
          </div>
        )

      case "continental":
        return (
          <div
            ref={invoiceRef}
            className="invoice-container bg-white p-8 rounded-lg shadow-sm"
            style={{ backgroundColor: customization.backgroundColor }}
          >
            <div className="border-b-2 pb-6 mb-6" style={{ borderColor: customization.accentColor }}>
              <div className="flex justify-between items-start">
                <div>
                  {customization.logoUrl && (
                    <img src={customization.logoUrl || "/placeholder.svg"} alt={t("companyLogoAlt")} className="h-16 mb-4" />
                  )}
                  <h1 className="text-xl font-bold" style={{ color: customization.fontColor }}>
                    {MY_SETTINGS.companyName}
                  </h1>
                  <p className="text-sm" style={{ color: customization.fontColor }}>
                    123 Business Street
                  </p>
                  <p className="text-sm" style={{ color: customization.fontColor }}>
                    {MY_SETTINGS.adress}
                  </p>
                  <p className="text-sm" style={{ color: customization.fontColor }}>
                    {MY_SETTINGS.email}
                  </p>
                  <p className="text-sm" style={{ color: customization.fontColor }}>
                    {MY_SETTINGS.phoneNumber}
                  </p>
                  {hasValue(invoice.vatNumber) && (
                    <p className="text-sm" style={{ color: customization.fontColor }}>
                      {t("details.vatLabel")}: {invoice.vatNumber}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <h2 className="text-3xl font-bold mb-2" style={{ color: customization.accentColor }}>
                    {t("templates.continental.title")}
                  </h2>
                  <p className="text-sm" style={{ color: customization.labelColor }}>
                    Nr. {getInvoiceNumber(invoice)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <ClientInfo title={t("templates.continental.billTo")} />
              <div>
                <h3
                  className="font-semibold mb-3 text-sm uppercase tracking-wide"
                  style={{ color: customization.labelColor }}
                >
                  {t("templates.continental.detailsTitle")}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: customization.labelColor }}>
                      {t("details.invoiceDate")}:
                    </span>
                    <span className="text-sm" style={{ color: customization.fontColor }}>
                      {formatDateWithSettings(invoice.createdDate, invoice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: customization.labelColor }}>
                      {t("details.dueDate")}:
                    </span>
                    <span className="text-sm" style={{ color: customization.fontColor }}>
                      {formatDateWithSettings(calculateDueDateForDisplay(invoice), invoice)}
                    </span>
                  </div>
                  {hasValue(invoice.dueDateType) && invoice.dueDateType !== "custom" && (
                    <div className="flex justify-between">
                      <span className="text-sm" style={{ color: customization.labelColor }}>
                        {t("details.terms")}:
                      </span>
                      <span className="text-sm" style={{ color: customization.fontColor }}>
                        {invoice.dueDateType === "days" ? `${invoice.dueDateDays} Tage` : invoice.dueDateType}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <ItemsTable />
            <TotalsSection />
            <NotesSection />
            <Footer />
          </div>
        )

      case "compact":
        return (
          <div
            ref={invoiceRef}
            className="invoice-container bg-white p-6 rounded-lg shadow-sm text-sm"
            style={{ backgroundColor: customization.backgroundColor }}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                {customization.logoUrl && (
                  <img src={customization.logoUrl || "/placeholder.svg"} alt="Logo" className="h-12" />
                )}
                <div>
                  <h1 className="text-lg font-bold" style={{ color: customization.accentColor }}>
                    {t("invoiceTitle")} #{getInvoiceNumber(invoice)}
                  </h1>
                  <p className="text-xs" style={{ color: customization.fontColor }}>
                    {formatDateWithSettings(invoice.createdDate, invoice)} | {t("details.due")}:{" "}
                    {formatDateWithSettings(calculateDueDateForDisplay(invoice), invoice)}
                  </p>
                  {hasValue(invoice.dueDateType) && invoice.dueDateType !== "custom" && (
                    <p className="text-xs" style={{ color: customization.fontColor }}>
                      {t("details.terms")}: {invoice.dueDateType === "days" ? `${invoice.dueDateDays} days` : invoice.dueDateType}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: customization.labelColor }}>
                  {MY_SETTINGS.companyName}
                </p>
                <p className="text-xs" style={{ color: customization.fontColor }}>
                  {MY_SETTINGS.email}
                </p>
                <p className="text-xs" style={{ color: customization.fontColor }}>
                  {MY_SETTINGS.phoneNumber}
                </p>
                {hasValue(invoice.vatNumber) && (
                  <p className="text-xs" style={{ color: customization.fontColor }}>
                    {t("details.vatLabel")}: {invoice.vatNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="text-xs font-semibold mb-1" style={{ color: customization.labelColor }}>
                  {t("templates.standard.to")}
                </h3>
                <p className="text-sm font-medium" style={{ color: customization.fontColor }}>
                  {invoice.clientName}
                </p>
                <p className="text-xs" style={{ color: customization.fontColor }}>
                  {invoice.clientCompany}
                </p>
                <p className="text-xs" style={{ color: customization.fontColor }}>
                  {invoice.clientEmail}
                </p>
                <p className="text-xs" style={{ color: customization.fontColor }}>
                  {invoice.clientPhone}
                </p>
              </div>
              <div className="text-right">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-2xl font-bold" style={{ color: customization.accentColor }}>
                    {formatCurrencyWithSettings(invoice.totalAmount, invoice.currencyType || "EUR", invoice)}
                  </p>
                  <p className="text-xs" style={{ color: customization.labelColor }}>
                    {t("details.invoiceTotal")}
                  </p>
                </div>
              </div>
            </div>

            <ItemsList isCompact={true} />

            <div className="bg-gray-50 p-3 rounded">
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: customization.labelColor }}>{t("details.invoiceSubTotal")}:</span>
                <span style={{ color: customization.fontColor }}>
                  {formatCurrencyWithSettings(invoice.subtotalAmount, invoice.currencyType || "EUR", invoice)}
                </span>
              </div>

              {discountAmount > 0 && (
                <>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: customization.labelColor }}>
                     {t("details.discount")} {invoice.discountType === "percentage" ? `(${invoice.discountAmount}%)` : ""}:
                    </span>
                    <span style={{ color: customization.fontColor }}>
                      -{formatCurrencyWithSettings(discountAmount, invoice.currencyType || "EUR", invoice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: customization.labelColor }}>{t("details.afterDiscount")}:</span>
                    <span style={{ color: customization.fontColor }}>
                      {formatCurrencyWithSettings(subtotalAfterDiscount, invoice.currencyType || "EUR", invoice)}
                    </span>
                  </div>
                </>
              )}

              <div className="flex justify-between text-xs mb-2">
                <span style={{ color: customization.labelColor }}>
                  { t("details.tax")} ({invoice.taxRate}%){hasValue(invoice.taxMethod) ? ` - ${invoice.taxMethod}` : ""}:
                </span>
                <span style={{ color: customization.fontColor }}>
                  {formatCurrencyWithSettings(invoice.taxAmount, invoice.currencyType || "EUR", invoice)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t">
                <span style={{ color: customization.labelColor }}>{t("details.invoiceTotal")}:</span>
                <span style={{ color: customization.accentColor }}>
                  {formatCurrencyWithSettings(invoice.totalAmount, invoice.currencyType || "EUR", invoice)}
                </span>
              </div>
            </div>

            <NotesSection className="mt-4" />

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-600">Thank you for your business!</p>
            </div>
          </div>
        )

      default:
        return renderInvoiceTemplate()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>{t("invoiceTitle")} {invoice.number}</span>
              </DialogTitle>
              <DialogDescription>{t("invoiceViewer.dialogDescription")}</DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowCustomization(!showCustomization)}>
                <Settings className="w-4 h-4 mr-2" />
                {t("actions.customize")}
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                {t("actions.print")}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                {t("actions.download")}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Customization Panel */}
          {showCustomization && (
            <div className="w-80 border-r bg-gray-50 p-6 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Template</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-3 text-left border rounded-lg transition-colors ${
                          selectedTemplate === template.id
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-gray-600">{template.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">{t("companyLogoAlt")}</h3>
                  <div className="space-y-3">
                    <Select
                      value={customization.logoOption}
                      onValueChange={(value) => {
                        if (value === "none") {
                          setCustomization((prev) => ({ ...prev, logoOption: value, logoUrl: "" }))
                        } else if (value === "my-logo") {
                          setCustomization((prev) => ({
                            ...prev,
                            logoOption: value,
                            logoUrl: MY_SETTINGS.image,
                          }))
                        } else if (value === "upload") {
                          setCustomization((prev) => ({ ...prev, logoOption: value }))
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("customization.selectLogoOption")}/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t("customization.none")}</SelectItem>
                        <SelectItem value="my-logo">{t("customization.myLogo")}</SelectItem>
                        <SelectItem value="upload">{t("customization.uploadLogo")}</SelectItem>
                      </SelectContent>
                    </Select>

                    {customization.logoOption === "upload" && (
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                        />
                        {customization.logoUrl && (
                          <div className="mt-2">
                            <img
                              src={customization.logoUrl || "/placeholder.svg"}
                              alt="Uploaded logo"
                              className="h-16 w-auto border rounded"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {customization.logoOption === "my-logo" && (
                      <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                        <img src={MY_SETTINGS.image || "/placeholder.svg"} alt={t("companyLogoAlt")} className="h-16 w-auto" />
                        <p className="text-xs text-gray-600 mt-1">{t("customization.savedLogo")}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">{t("customization.colors")}</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm">{t("customization.background")}</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <input
                          type="color"
                          value={customization.backgroundColor}
                          onChange={(e) => setCustomization((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                          className="w-8 h-8 rounded border"
                        />
                        <Input
                          value={customization.backgroundColor}
                          onChange={(e) => setCustomization((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">{t("customization.labels")}</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <input
                          type="color"
                          value={customization.labelColor}
                          onChange={(e) => setCustomization((prev) => ({ ...prev, labelColor: e.target.value }))}
                          className="w-8 h-8 rounded border"
                        />
                        <Input
                          value={customization.labelColor}
                          onChange={(e) => setCustomization((prev) => ({ ...prev, labelColor: e.target.value }))}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">{t("customization.text")}</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <input
                          type="color"
                          value={customization.fontColor}
                          onChange={(e) => setCustomization((prev) => ({ ...prev, fontColor: e.target.value }))}
                          className="w-8 h-8 rounded border"
                        />
                        <Input
                          value={customization.fontColor}
                          onChange={(e) => setCustomization((prev) => ({ ...prev, fontColor: e.target.value }))}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">{t("customization.accent")}</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <input
                          type="color"
                          value={customization.accentColor}
                          onChange={(e) => setCustomization((prev) => ({ ...prev, accentColor: e.target.value }))}
                          className="w-8 h-8 rounded border"
                        />
                        <Input
                          value={customization.accentColor}
                          onChange={(e) => setCustomization((prev) => ({ ...prev, accentColor: e.target.value }))}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invoice Preview */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
            <div className="max-w-4xl mx-auto">{renderInvoiceTemplate()}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
