import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const SETTINGS_FILE_PATH = path.join(process.cwd(), "app/static-data/settings.json")

// GET - Read current settings from JSON file
export async function GET() {
  try {
    const fileContents = await fs.readFile(SETTINGS_FILE_PATH, "utf8")
    const settings = JSON.parse(fileContents)

    return NextResponse.json({
      success: true,
      data: settings,
    })
  } catch (error) {
    console.error("Error reading settings file:", error)
    return NextResponse.json({ success: false, error: "Failed to read settings" }, { status: 500 })
  }
}

// POST - Update settings in JSON file
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { profile, invoice, general } = body

    // Read current settings
    const fileContents = await fs.readFile(SETTINGS_FILE_PATH, "utf8")
    const currentSettings = JSON.parse(fileContents)

    // Update the default values with new settings
    const updatedSettings = {
      ...currentSettings,
      defaultProfile: {
        ...currentSettings.defaultProfile,
        ...profile,
      },
      defaultInvoice: {
        ...currentSettings.defaultInvoice,
        ...invoice,
      },
      defaultGeneral: {
        ...currentSettings.defaultGeneral,
        ...general,
      },
    }

    // Write updated settings back to file
    await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(updatedSettings, null, 2), "utf8")

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      data: updatedSettings,
    })
  } catch (error) {
    console.error("Error updating settings file:", error)
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 })
  }
}

// PUT - Reset settings to original defaults
export async function PUT() {
  try {
    const originalSettings = {
      defaultProfile: {
        firstName: "Manta Ray",
        company: "Omnilink",
        address: "Incubateur Supcom Technopole Ghazela Ariana Tunis",
        phone: "+216 54131778",
        email: "omnilink.tn@gmail.com",
        website: "http://www.Omnilink.tn/",
        bankRib: "",
        bankName: "",
      },
      defaultInvoice: {
        invoiceNumber: true,
        dueDate: true,
        currency: false,
        discount: false,
        tax: false,
        notes: false,
        invoiceNumberPrefix: "INV",
        invoiceNumberStart: "001",
        dueDateType: "custom",
        dueDateDays: "30",
        vatNumber: "123-456-789",
        taxAmount: "0",
        taxMethod: "Default Values",
        currencyType: "US Dollar",
        separator: "1,999,000 (Comma & Dot)",
        signPlacement: "Before Amount",
        decimals: "2",
        discountType: "percentage",
        discountAmount: "0",
        defaultNotes: "",
        saveLocation: "C:\\Users\\rimba\\OneDrive\\Gambar\\Saved Pictures",
        template: "Minimal",
        dateFormat: "07/04/2025 (MM/DD/YYYY)",
      },
      defaultGeneral: {
        sound: "Default Values",
        language: "English",
        mute: false,
        openPdfAfterSave: true,
      },
      options: {
        currencies: [
          { value: "US Dollar", label: "US Dollar" },
          { value: "Euro", label: "Euro" },
          { value: "Tunisian Dinar", label: "Tunisian Dinar" },
        ],
        separators: [
          { value: "1,999,000 (Comma & Dot)", label: "1,999,000 (Comma & Dot)" },
          { value: "1.999.000 (Dot & Comma)", label: "1.999.000 (Dot & Comma)" },
        ],
        signPlacements: [
          { value: "Before Amount", label: "Before Amount" },
          { value: "After Amount", label: "After Amount" },
        ],
        taxMethods: [
          { value: "Default Values", label: "Default Values" },
          { value: "Custom", label: "Custom" },
        ],
        templates: [
          { value: "Minimal", label: "Minimal" },
          { value: "Standard", label: "Standard" },
          { value: "Professional", label: "Professional" },
        ],
        dateFormats: [
          { value: "07/04/2025 (MM/DD/YYYY)", label: "07/04/2025 (MM/DD/YYYY)" },
          { value: "04/07/2025 (DD/MM/YYYY)", label: "04/07/2025 (DD/MM/YYYY)" },
          { value: "2025-07-04 (YYYY-MM-DD)", label: "2025-07-04 (YYYY-MM-DD)" },
        ],
        sounds: [
          { value: "Default Values", label: "Default Values" },
          { value: "Custom", label: "Custom" },
          { value: "Disabled", label: "Disabled" },
        ],
        languages: [
          { value: "English", label: "English" },
          { value: "Français", label: "Français" },
          { value: "العربية", label: "العربية" },
        ],
      },
      labels: {
        profile: {
          logo: "LOGO",
          logoDescription: "Accepts PNG, JPG & SVG (Recommended)",
          firstName: "FIRST & LAST NAME",
          company: "COMPANY",
          address: "ADDRESS",
          phone: "PHONE NUMBER",
          email: "EMAIL",
          website: "WEBSITE",
          bankName: "BANK NAME",
          bankRib: "BANK RIB",
        },
        invoice: {
          requiredFields: "REQUIRED FIELDS",
          invoiceNumber: "INVOICE NUMBER",
          dueDate: "DUE DATE",
          currency: "CURRENCY",
          discount: "DISCOUNT",
          tax: "TAX",
          notes: "NOTES",
          invoiceNumberSettings: "INVOICE NUMBER SETTINGS",
          prefix: "PREFIX",
          startingNumber: "STARTING NUMBER",
          dueDateSettings: "DUE DATE SETTINGS",
          customDate: "Custom Date",
          paymentTerm: "Select Payment Term",
          days: "DAYS",
          currencySettings: "CURRENCY SETTINGS",
          separator: "SEPARATOR",
          signPlacement: "SIGN PLACEMENT",
          decimalPlaces: "DECIMAL PLACES",
          discountSettings: "DISCOUNT SETTINGS",
          percentage: "Percentage",
          fixedAmount: "Fixed Amount",
          amount: "AMOUNT",
          taxSettings: "TAX SETTINGS",
          vatNumber: "VAT NUMBER",
          method: "METHOD",
          notesSettings: "NOTES SETTINGS",
          defaultNotes: "DEFAULT NOTES",
          otherSettings: "OTHER SETTINGS",
          pdfFolder: "PDF FOLDER SAVE LOCATION",
          template: "TEMPLATE",
          dateFormat: "DATE FORMAT",
        },
        general: {
          sound: "SOUND",
          mute: "MUTE",
          language: "LANGUAGE",
          openPdf: "OPEN PDF FILE AFTER SAVE",
        },
      },
      placeholders: {
        invoicePrefix: "INV",
        invoiceStart: "001",
        dueDateDays: "30",
        discountAmount: "0",
        folderPath: "Select folder path...",
        defaultNotes: "Enter default notes for invoices...",
      },
    }

    await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(originalSettings, null, 2), "utf8")

    return NextResponse.json({
      success: true,
      message: "Settings reset to defaults successfully",
      data: originalSettings,
    })
  } catch (error) {
    console.error("Error resetting settings file:", error)
    return NextResponse.json({ success: false, error: "Failed to reset settings" }, { status: 500 })
  }
}