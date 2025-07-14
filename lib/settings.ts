// Client-side utilities for settings management
export interface ProfileSettings {
  firstName: string
  company: string
  address: string
  phone: string
  email: string
  website: string
  bankRib: string
  bankName: string
  logoPreview?: string | null // Changed to string | null to store data URL or external URL
}

export interface InvoiceSettings {
  invoiceNumber: boolean
  dueDate: boolean
  currency: boolean
  discount: boolean
  tax: boolean
  notes: boolean
  invoiceNumberPrefix: string
  invoiceNumberStart: string
  dueDateType: string
  dueDateDays: string
  dueDateCustom: string
  vatNumber: string
  taxAmount: string
  taxMethod: string
  currencyType: string
  separator: string
  signPlacement: string
  decimals: string
  discountType: string
  discountAmount: string
  defaultNotes: string
  saveLocation: string
  template: string
  dateFormat: string
}

export interface GeneralSettings {
  sound: string
  language: string
  mute: boolean
  openPdfAfterSave: boolean
}

export interface UserSettings {
  id?: string
  user_id?: string
  profile_settings: ProfileSettings
  invoice_settings: InvoiceSettings
  general_settings: GeneralSettings
  created_at?: string
  updated_at?: string
}

export async function fetchSettings(): Promise<{ success: boolean; settings?: UserSettings; error?: string }> {
  try {
    const response = await fetch("/api/settings", {
      method: "GET",
    })
    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        // Redirect to login if unauthorized
        window.location.href = "/login"
      }
      return { success: false, error: data.error || "Failed to fetch settings" }
    }

    // The API returns `data.settings` directly, not `data.data`
    return { success: true, settings: data.settings }
  } catch (error) {
    console.error("Fetch settings network error:", error)
    return { success: false, error: "Network error" }
  }
}

export async function updateSettings(settingsData: {
  profileSettings: ProfileSettings
  invoiceSettings: InvoiceSettings
  generalSettings: GeneralSettings
}): Promise<{ success: boolean; settings?: UserSettings; error?: string }> {
  try {
    const response = await fetch("/api/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settingsData),
    })
    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        // Redirect to login if unauthorized
        window.location.href = "/login"
      }
      return { success: false, error: data.error || "Failed to update settings" }
    }

    // The API returns `data.settings` directly, not `data.data`
    return { success: true, settings: data.settings }
  } catch (error) {
    console.error("Update settings network error:", error)
    return { success: false, error: "Network error" }
  }
}

export async function resetSettings(): Promise<{ success: boolean; settings?: UserSettings; error?: string }> {
  try {
    const response = await fetch("/api/settings", {
      method: "PUT", // Assuming PUT is used for reset, though POST could also work
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reset: true }),
    })
    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login"
      }
      return { success: false, error: data.error || "Failed to reset settings" }
    }

    return { success: true, settings: data.data }
  } catch (error) {
    return { success: false, error: "Network error" }
  }
}

// Default settings
export const defaultSettings: UserSettings = {
  profile_settings: {
    firstName: "", // Will be pre-filled by user data
    company: "", // Will be pre-filled by user data
    address: "",
    phone: "",
    email: "", // Will be pre-filled by user data
    website: "",
    bankRib: "",
    bankName: "",
    logoPreview: null, // Default to no logo
  },
  invoice_settings: {
    invoiceNumber: true,
    dueDate: true,
    currency: true,
    discount: true,
    tax: true,
    notes: true,
    invoiceNumberPrefix: "INV",
    invoiceNumberStart: "001",
    dueDateType: "custom",
    dueDateDays: "30",
    dueDateCustom: new Date().toISOString().split("T")[0],
    vatNumber: "",
    taxAmount: "0",
    taxMethod: "default",
    currencyType: "EUR",
    separator: "comma-dot",
    signPlacement: "before",
    decimals: "2",
    discountType: "percentage",
    discountAmount: "0",
    defaultNotes: "",
    saveLocation: "",
    template: "Minimal",
    dateFormat: "dd/MM/yyyy",
  },
  general_settings: {
    sound: "Default Values",
    language: "English",
    mute: false,
    openPdfAfterSave: true,
  },
}
