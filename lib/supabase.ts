import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.log("Database Error: Missing Supabase environment variables")
}

// Client-side Supabase client (for browser usage)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client with service role (for API routes)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Export createClient for compatibility
export { createClient }

// Database types
export interface User {
  id: string
  email: string
  password_hash: string
  name: string
  company: string
  phone?: string
  role: "user" | "admin"
  access_count: number // Added for device access limit
  sector: string // Added for user profile
  location: string // Added for user profile
  company_size: string // Added for user profile
  payment_method: string // Added for user profile
  join_date: string // Added for user profile
  status: "active" | "inactive" | "pending" // Status in DB is lowercase
  created_at: string
  updated_at: string
  image?: string // Added image field for user profile picture
}

export interface UserSession {
  id: string
  user_id: string
  ip_address: string
  session_token: string
  last_active: string
  created_at: string
}

export interface Contact {
  id: string
  contact_id: string
  user_id: string
  name: string
  email: string
  phone: string
  company: string
  status: "Active" | "Inactive" | "Pending"
  projects: number
  last_activity: string
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  invoice_number: string
  user_id: string
  contact_id?: string
  client_name: string
  client_company: string
  client_email: string
  client_phone: string
  status: "paid" | "partial" | "pending" | "refunded" | "cancelled"
  total_amount: number
  subtotal_amount: number
  tax_amount: number
  tax_rate: number
  paid_amount: number
  currency: string
  created_date: string
  due_date: string
  items: any[]
  payment_history: any[]
  discount_amount: number
  discount_type: "percentage" | "fixed"
  vat_number?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  profile_settings: any
  invoice_settings: any
  general_settings: any
  created_at: string
  updated_at: string
}

export interface RefreshToken {
  id: string
  user_id: string
  token: string
  expires_at: string
  created_at: string
}

export interface StockItem {
  id: string
  user_id: string
  name: string
  my_product: boolean
  quantity: number
  min_stock: number
  price: number
  currency: string
  supplier?: string
  description: string
  created_at: string
  updated_at: string
}
