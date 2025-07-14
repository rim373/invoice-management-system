"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Loader2, X, Folder } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  fetchSettings,
  updateSettings,
  defaultSettings,
  type ProfileSettings,
  type InvoiceSettings,
  type GeneralSettings,
} from "@/lib/settings"
import { getCurrentUser } from "@/lib/auth"

interface SettingsPageProps {
  userRole: "admin" | "user"
}

export function SettingsPage({ userRole }: SettingsPageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  // Profile settings state
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    logo: null,
    logoPreview: null,
    firstName: "",
    company: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    bankRib: "",
    bankName: "",
  })

  // Invoice settings state
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(defaultSettings.invoice_settings)

  // General settings state
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(defaultSettings.general_settings)

  // Load settings and user data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      try {
        // Fetch user data
        const user = await getCurrentUser()
        if (user) {
          setProfileSettings((prev) => ({
            ...prev,
            firstName: user.name || prev.firstName,
            company: user.company || prev.company,
            email: user.email || prev.email,
            // Assuming user object might have a profile image URL
            logoPreview: user.image || prev.logoPreview,
          }))
        }

        // Fetch saved settings from backend
        const result = await fetchSettings()
        if (result.success && result.settings) {
          const fetchedSettings = result.settings
          setProfileSettings((prev) => ({
            ...prev,
            ...fetchedSettings.profile_settings,
            // Ensure logoPreview is correctly set from fetched data
            logoPreview: fetchedSettings.profile_settings.logoPreview || prev.logoPreview,
          }))
          setInvoiceSettings(fetchedSettings.invoice_settings)
          setGeneralSettings(fetchedSettings.general_settings)
        }
      } catch (error) {
        console.error("Error loading initial data:", error)
        toast({
          title: "Error",
          description: "Failed to load settings. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const payload = {
        profileSettings,
        invoiceSettings,
        generalSettings,
      }

      const result = await updateSettings(payload)

      if (result.success) {
        toast({
          title: "Settings Saved",
          description: "Your settings have been saved successfully.",
        })
        console.log("Settings saved successfully:", result.settings)
      } else {
        throw new Error(result.error || "Failed to save settings.")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result
      if (typeof result === "string") {
        setProfileSettings((prev) => ({
          ...prev,
          logo: file, // Keep the File object if needed for actual upload, though for Next.js we'll use data URL
          logoPreview: result, // This is the data URL for display and saving
        }))
      }
    }

    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setProfileSettings((prev) => ({
      ...prev,
      logo: null,
      logoPreview: null,
    }))

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFolderSelect = async () => {
    try {
      // Check if the File System Access API is supported (Chrome/Edge)
      if ("showDirectoryPicker" in window) {
        try {
          const directoryHandle = await (window as any).showDirectoryPicker({
            mode: "readwrite",
          })

          // Get the full path if possible, otherwise use the name
          let folderPath = directoryHandle.name

          // Try to construct a more complete path
          if (directoryHandle.resolve) {
            try {
              const pathSegments = []
              let currentHandle = directoryHandle
              while (currentHandle && currentHandle.name !== "") {
                pathSegments.unshift(currentHandle.name)
                currentHandle = await currentHandle.getParent?.()
              }
              if (pathSegments.length > 0) {
                folderPath = `C:\\Users\\rimba\\${pathSegments.join("\\")}`
              }
            } catch (e) {
              // Fallback to just the folder name
              folderPath = `C:\\Users\\rimba\\${directoryHandle.name}`
            }
          }

          setInvoiceSettings({
            ...invoiceSettings,
            saveLocation: folderPath,
          })

          toast({
            title: "Folder Selected",
            description: `Selected folder: ${folderPath}`,
          })
        } catch (error) {
          if (error instanceof Error && error.name !== "AbortError") {
            console.error("Directory picker error:", error)
            // Fallback to file input method
            handleFallbackFolderSelect()
          }
        }
      } else {
        // Fallback for browsers that don't support showDirectoryPicker
        handleFallbackFolderSelect()
      }
    } catch (error) {
      console.error("Folder selection error:", error)
      handleFallbackFolderSelect()
    }
  }

  const handleFallbackFolderSelect = () => {
    if (folderInputRef.current) {
      folderInputRef.current.click()
    }
  }

  const handleFolderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      // Extract folder path from the first file
      const file = files[0]
      const fullPath = file.webkitRelativePath || file.name

      // Get the folder path by removing the filename
      const pathParts = fullPath.split("/")
      if (pathParts.length > 1) {
        pathParts.pop() // Remove filename
        const folderPath = pathParts.join("\\") // Use Windows-style path separators
        const completePath = `C:\\Users\\rimba\\${folderPath}`

        setInvoiceSettings({
          ...invoiceSettings,
          saveLocation: completePath,
        })

        toast({
          title: "Folder Selected",
          description: `Selected folder: ${completePath}`,
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <Button onClick={handleSave} disabled={isLoading} className="bg-blue-500 hover:bg-blue-600 text-white px-6">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "SAVE"
          )}
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">LOGO</Label>
                <p className="text-sm text-gray-500">Accepts PNG, JPG & SVG (Recommended)</p>

                {profileSettings.logoPreview ? (
                  <div className="relative border-2 border-gray-300 rounded-lg p-4">
                    <button
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <img
                      src={profileSettings.logoPreview || "/placeholder.svg"}
                      alt="Logo preview"
                      className="max-w-full max-h-48 object-contain mx-auto"
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Drag file here</p>
                    <div className="relative">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".png,.jpg,.jpeg,.svg"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Button variant="outline" className="bg-blue-500 text-white hover:bg-blue-600">
                        OR SELECT PHOTO
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Company Information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">FIRST & LAST NAME</Label>
                  <Input
                    value={profileSettings.firstName}
                    onChange={(e) => setProfileSettings({ ...profileSettings, firstName: e.target.value })}
                    className="border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">COMPANY</Label>
                  <Input
                    value={profileSettings.company}
                    onChange={(e) => setProfileSettings({ ...profileSettings, company: e.target.value })}
                    className="border-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">ADDRESS</Label>
                <Textarea
                  value={profileSettings.address}
                  onChange={(e) => setProfileSettings({ ...profileSettings, address: e.target.value })}
                  className="border-gray-300 min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">PHONE NUMBER</Label>
                  <Input
                    value={profileSettings.phone}
                    onChange={(e) => setProfileSettings({ ...profileSettings, phone: e.target.value })}
                    className="border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">EMAIL</Label>
                  <Input
                    type="email"
                    value={profileSettings.email}
                    onChange={(e) => setProfileSettings({ ...profileSettings, email: e.target.value })}
                    className="border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">WEBSITE</Label>
                  <Input
                    value={profileSettings.website}
                    onChange={(e) => setProfileSettings({ ...profileSettings, website: e.target.value })}
                    className="border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">BANK NAME</Label>
                  <Input
                    value={profileSettings.bankName}
                    onChange={(e) => setProfileSettings({ ...profileSettings, bankName: e.target.value })}
                    className="border-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">BANK RIB</Label>
                <Input
                  value={profileSettings.bankRib}
                  onChange={(e) => setProfileSettings({ ...profileSettings, bankRib: e.target.value })}
                  className="border-gray-300"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoice Tab */}
        <TabsContent value="invoice" className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Required Fields */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">REQUIRED FIELDS</h3>
                <div className="grid grid-cols-6 gap-4">
                  <div className="flex flex-col items-center space-y-2">
                    <Label className="text-xs text-gray-600 text-center">INVOICE NUMBER</Label>
                    <Switch
                      checked={invoiceSettings.invoiceNumber}
                      onCheckedChange={(checked) => setInvoiceSettings({ ...invoiceSettings, invoiceNumber: checked })}
                    />
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <Label className="text-xs text-gray-600 text-center">DUE DATE</Label>
                    <Switch
                      checked={invoiceSettings.dueDate}
                      onCheckedChange={(checked) => setInvoiceSettings({ ...invoiceSettings, dueDate: checked })}
                    />
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <Label className="text-xs text-gray-600 text-center">CURRENCY</Label>
                    <Switch
                      checked={invoiceSettings.currency}
                      onCheckedChange={(checked) => setInvoiceSettings({ ...invoiceSettings, currency: checked })}
                    />
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <Label className="text-xs text-gray-600 text-center">DISCOUNT</Label>
                    <Switch
                      checked={invoiceSettings.discount}
                      onCheckedChange={(checked) => setInvoiceSettings({ ...invoiceSettings, discount: checked })}
                    />
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <Label className="text-xs text-gray-600 text-center">TAX</Label>
                    <Switch
                      checked={invoiceSettings.tax}
                      onCheckedChange={(checked) => setInvoiceSettings({ ...invoiceSettings, tax: checked })}
                    />
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <Label className="text-xs text-gray-600 text-center">NOTES</Label>
                    <Switch
                      checked={invoiceSettings.notes}
                      onCheckedChange={(checked) => setInvoiceSettings({ ...invoiceSettings, notes: checked })}
                    />
                  </div>
                </div>
              </div>

              {/* Conditional Sections Based on Switches */}

              {/* Invoice Number Settings */}
              {invoiceSettings.invoiceNumber && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">INVOICE NUMBER SETTINGS</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">PREFIX</Label>
                      <Input
                        value={invoiceSettings.invoiceNumberPrefix}
                        onChange={(e) =>
                          setInvoiceSettings({ ...invoiceSettings, invoiceNumberPrefix: e.target.value })
                        }
                        className="border-gray-300"
                        placeholder="INV"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                        STARTING NUMBER
                      </Label>
                      <Input
                        value={invoiceSettings.invoiceNumberStart}
                        onChange={(e) => setInvoiceSettings({ ...invoiceSettings, invoiceNumberStart: e.target.value })}
                        className="border-gray-300"
                        placeholder="001"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Due Date Settings */}
              {invoiceSettings.dueDate && (
                <div>
                  <Label className="mb-2 block">Due Date</Label>
                  <RadioGroup
                    value={invoiceSettings.dueDateType}
                    onValueChange={(value) => setInvoiceSettings((prev) => ({ ...prev, dueDateType: value }))}
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="customDate" />
                        <Label htmlFor="customDate">Custom Date</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="term" id="paymentTerm" />
                        <Label htmlFor="paymentTerm">Select Payment Term</Label>
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
                        <SelectItem value="7">7 jours après facturation</SelectItem>
                        <SelectItem value="10">10 jours après facturation</SelectItem>
                        <SelectItem value="20">20 jours après facturation</SelectItem>
                        <SelectItem value="30">30 jours après facturation</SelectItem>
                        <SelectItem value="60">60 jours après facturation</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {/* Currency Settings */}
              {invoiceSettings.currency && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">CURRENCY SETTINGS</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">CURRENCY</Label>
                      <Select
                        value={invoiceSettings.currencyType}
                        onValueChange={(value) => setInvoiceSettings({ ...invoiceSettings, currencyType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">US Dollar</SelectItem>
                          <SelectItem value="EUR">Euro</SelectItem>
                          <SelectItem value="TND">Tunisian Dinar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">SEPARATOR</Label>
                      <Select
                        value={invoiceSettings.separator}
                        onValueChange={(value) => setInvoiceSettings({ ...invoiceSettings, separator: value })}
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
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                        SIGN PLACEMENT
                      </Label>
                      <Select
                        value={invoiceSettings.signPlacement}
                        onValueChange={(value) => setInvoiceSettings({ ...invoiceSettings, signPlacement: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="before">Before Amount</SelectItem>
                          <SelectItem value="after">After Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                        DECIMAL PLACES
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        max={3}
                        value={invoiceSettings.decimals}
                        onChange={(e) => setInvoiceSettings({ ...invoiceSettings, decimals: e.target.value })}
                        className="border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Discount Settings */}
              {invoiceSettings.discount && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">DISCOUNT SETTINGS</h3>
                  <div className="space-y-4">
                    <RadioGroup
                      value={invoiceSettings.discountType}
                      onValueChange={(value) => setInvoiceSettings({ ...invoiceSettings, discountType: value })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="percentage" id="percentage" />
                        <Label htmlFor="percentage">Percentage</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fixed" id="fixed" />
                        <Label htmlFor="fixed">Fixed Amount</Label>
                      </div>
                    </RadioGroup>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                        {invoiceSettings.discountType === "percentage" ? "PERCENTAGE (%)" : "AMOUNT"}
                      </Label>
                      <Input
                        type="number"
                        value={invoiceSettings.discountAmount}
                        onChange={(e) => setInvoiceSettings({ ...invoiceSettings, discountAmount: e.target.value })}
                        className="border-gray-300"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tax Settings */}
              {invoiceSettings.tax && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">TAX SETTINGS</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">VAT NUMBER</Label>
                      <Input
                        value={invoiceSettings.vatNumber}
                        onChange={(e) => setInvoiceSettings({ ...invoiceSettings, vatNumber: e.target.value })}
                        className="border-gray-300"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">AMOUNT (%)</Label>
                        <Input
                          type="number"
                          value={invoiceSettings.taxAmount}
                          onChange={(e) => setInvoiceSettings({ ...invoiceSettings, taxAmount: e.target.value })}
                          className="border-gray-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">METHOD</Label>
                        <Select
                          value={invoiceSettings.taxMethod}
                          onValueChange={(value) => setInvoiceSettings({ ...invoiceSettings, taxMethod: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default Values</SelectItem>
                            <SelectItem value="inclusive">autoliquidation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes Settings */}
              {invoiceSettings.notes && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">NOTES SETTINGS</h3>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">DEFAULT NOTES</Label>
                    <Textarea
                      value={invoiceSettings.defaultNotes}
                      onChange={(e) => setInvoiceSettings({ ...invoiceSettings, defaultNotes: e.target.value })}
                      className="border-gray-300 min-h-[80px]"
                      placeholder="Enter default notes for invoices..."
                    />
                  </div>
                </div>
              )}

              {/* Other Settings */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">OTHER SETTINGS</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                      PDF FOLDER SAVE LOCATION
                    </Label>
                    <div className="flex">
                      <Input
                        value={invoiceSettings.saveLocation}
                        onChange={(e) => setInvoiceSettings({ ...invoiceSettings, saveLocation: e.target.value })}
                        className="border-gray-300 flex-1"
                        placeholder="Select folder path..."
                      />
                      <input
                        ref={folderInputRef}
                        type="file"
                        multiple
                        onChange={handleFolderChange}
                        className="hidden"
                        // directory and webkitdirectory are non-standard but widely supported for folder selection
                        // @ts-ignore
                        webkitdirectory=""
                        directory=""
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="ml-2 bg-blue-500 text-white hover:bg-blue-600 px-3"
                        onClick={handleFolderSelect}
                        title="Select Folder"
                      >
                        <Folder className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Click the folder icon to browse and select a folder for saving PDF files
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">TEMPLATE</Label>
                      <Select
                        value={invoiceSettings.template}
                        onValueChange={(value) => setInvoiceSettings({ ...invoiceSettings, template: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Minimal">Minimal</SelectItem>
                          <SelectItem value="Standard">Standard</SelectItem>
                          <SelectItem value="Professional">Professional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">DATE FORMAT</Label>
                      <Select
                        value={invoiceSettings.dateFormat}
                        onValueChange={(value) => setInvoiceSettings({ ...invoiceSettings, dateFormat: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dd/MM/yyyy">07/04/2025 (DD/MM/YYYY)</SelectItem>
                          <SelectItem value="MM/dd/yyyy">04/07/2025 (MM/DD/YYYY)</SelectItem>
                          <SelectItem value="yyyy-MM-dd">2025-07-04 (YYYY-MM-DD)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">SOUND</Label>
                  <Select
                    value={generalSettings.sound}
                    onValueChange={(value) => setGeneralSettings({ ...generalSettings, sound: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Default Values">Default Values</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                      <SelectItem value="Disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">MUTE</Label>
                  <Switch
                    checked={generalSettings.mute}
                    onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, mute: checked })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">LANGUAGE</Label>
                  <Select
                    value={generalSettings.language}
                    onValueChange={(value) => setGeneralSettings({ ...generalSettings, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Français">Français</SelectItem>
                      <SelectItem value="العربية">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                    OPEN PDF FILE AFTER SAVE
                  </Label>
                  <Switch
                    checked={generalSettings.openPdfAfterSave}
                    onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, openPdfAfterSave: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
