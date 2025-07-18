"use client"
import { useSoundContext } from "@/app/sound-context"
import { useClickSound } from "@/lib/playClickSound"
import type React from "react"
import { useI18n } from '@/app/i18n-context';
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
import { useTranslations } from "next-intl"
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
  //sound effect application
    const playClickSound = useClickSound()
    const handlesound = () => {
      playClickSound()
    }
  //sound effect setup
  const { setSoundSetting } = useSoundContext()
  //translation
  const t = useTranslations("SettingsPage")
  const { locale, setLocale } = useI18n();
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
        title: t("toasts.settingsSaved"),
        description: t("toasts.settingsSavedDescription"),
      })
        console.log("Settings saved successfully:", result.settings)
      } else {
        throw new Error(result.error || "Failed to save settings.")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: t("toasts.error"),
        description: error instanceof Error ? error.message :t("toasts.errorDescription"),
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
          logo: file,
          logoPreview: result,
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
            title: t("toasts.folderSelected"),
            description: t("toasts.folderSelectedDescription", { path: folderPath }),
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
          title: t("toasts.folderSelected"),
          description: t("toasts.folderSelectedDescription", { path: completePath }),
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <Button onClick={() => { {handleSave(); handlesound(); }}} disabled={isLoading} className="bg-blue-500 hover:bg-blue-600 text-white px-6">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t("saving")}
            </>
          ) : (
            t("save")
          )}
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">{t("tabs.profile")}</TabsTrigger>
          <TabsTrigger value="invoice">{t("tabs.invoice")}</TabsTrigger>
          <TabsTrigger value="general">{t("tabs.general")}</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("profile.logo")}</Label>
                <p className="text-sm text-gray-500">{t("profile.logoDescription")}</p>

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
                    <p className="text-gray-600 mb-4">{t("profile.dragFile")}</p>
                    <div className="relative">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".png,.jpg,.jpeg,.svg"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Button variant="outline" className="bg-blue-500 text-white hover:bg-blue-600">
                        {t("profile.selectPhoto")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Company Information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("profile.firstName")}</Label>
                  <Input
                    value={profileSettings.firstName}
                    onChange={(e) => setProfileSettings({ ...profileSettings, firstName: e.target.value })}
                    className="border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("profile.company")}</Label>
                  <Input
                    value={profileSettings.company}
                    onChange={(e) => setProfileSettings({ ...profileSettings, company: e.target.value })}
                    className="border-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("profile.address")}</Label>
                <Textarea
                  value={profileSettings.address}
                  onChange={(e) => setProfileSettings({ ...profileSettings, address: e.target.value })}
                  className="border-gray-300 min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("profile.phoneNumber")}</Label>
                  <Input
                    value={profileSettings.phone}
                    onChange={(e) => setProfileSettings({ ...profileSettings, phone: e.target.value })}
                    className="border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("profile.email")}</Label>
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
                  <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("profile.website")}</Label>
                  <Input
                    value={profileSettings.website}
                    onChange={(e) => setProfileSettings({ ...profileSettings, website: e.target.value })}
                    className="border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("profile.bankName")}</Label>
                  <Input
                    value={profileSettings.bankName}
                    onChange={(e) => setProfileSettings({ ...profileSettings, bankName: e.target.value })}
                    className="border-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("profile.bankRib")}</Label>
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
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("invoice.requiredFields")}</h3>
                <div className="grid grid-cols-6 gap-4">
                  <div className="flex flex-col items-center space-y-2">
                    <Label className="text-xs text-gray-600 text-center">{t("invoice.invoiceNumber")}</Label>
                    <Switch
                      checked={invoiceSettings.invoiceNumber}
                      onCheckedChange={(checked) => setInvoiceSettings({ ...invoiceSettings, invoiceNumber: checked })}
                    />
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <Label className="text-xs text-gray-600 text-center">{t("invoice.dueDate")}</Label>
                    <Switch
                      checked={invoiceSettings.dueDate}
                      onCheckedChange={(checked) => setInvoiceSettings({ ...invoiceSettings, dueDate: checked })}
                    />
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <Label className="text-xs text-gray-600 text-center">{t("invoice.currency")}</Label>
                    <Switch
                      checked={invoiceSettings.currency}
                      onCheckedChange={(checked) => setInvoiceSettings({ ...invoiceSettings, currency: checked })}
                    />
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <Label className="text-xs text-gray-600 text-center">{t("invoice.discount")}</Label>
                    <Switch
                      checked={invoiceSettings.discount}
                      onCheckedChange={(checked) => setInvoiceSettings({ ...invoiceSettings, discount: checked })}
                    />
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <Label className="text-xs text-gray-600 text-center">{t("invoice.tax")}</Label>
                    <Switch
                      checked={invoiceSettings.tax}
                      onCheckedChange={(checked) => setInvoiceSettings({ ...invoiceSettings, tax: checked })}
                    />
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <Label className="text-xs text-gray-600 text-center">{t("invoice.notes")}</Label>
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
                  <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("invoice.invoiceNumberSettings")}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("invoice.prefix")}</Label>
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
                        {t("invoice.startingNumber")}
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
                  <Label className="mb-2 block">{t("invoice.dueDateSettings")}</Label>
                  <RadioGroup
                    value={invoiceSettings.dueDateType}
                    onValueChange={(value) => setInvoiceSettings((prev) => ({ ...prev, dueDateType: value }))}
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="customDate" />
                        <Label htmlFor="customDate">{t("invoice.customDate")}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="term" id="paymentTerm" />
                        <Label htmlFor="paymentTerm">{t("invoice.paymentTerm")}</Label>
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
                        <SelectItem value="7">{t("invoice.paymentTerms.7")}</SelectItem>
                        <SelectItem value="10">{t("invoice.paymentTerms.10")}</SelectItem>
                        <SelectItem value="20">{t("invoice.paymentTerms.20")}</SelectItem>
                        <SelectItem value="30">{t("invoice.paymentTerms.30")}</SelectItem>
                        <SelectItem value="60">{t("invoice.paymentTerms.60")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}


              {/* Currency Settings */}
              {invoiceSettings.currency && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("invoice.currencySettings")}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("invoice.currency")}</Label>
                      <Select
                        value={invoiceSettings.currencyType}
                        onValueChange={(value) => setInvoiceSettings({ ...invoiceSettings, currencyType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US Dollar">{t("invoice.currencyTypes.usDollar")}</SelectItem>
                          <SelectItem value="Euro">{t("invoice.currencyTypes.euro")}</SelectItem>
                          <SelectItem value="Tunisian Dinar">{t("invoice.currencyTypes.tunisianDinar")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("invoice.separator")}</Label>
                      <Select
                        value={invoiceSettings.separator}
                        onValueChange={(value) => setInvoiceSettings({ ...invoiceSettings, separator: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1,999,000 (Comma & Dot)">1,999,000 {t("invoice.separatorTypes.commaDot")} </SelectItem>
                          <SelectItem value="1.999.000 (Dot & Comma)">1.999.000 {t("invoice.separatorTypes.dotComma")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                        {t("invoice.signPlacement")}
                      </Label>
                      <Select
                        value={invoiceSettings.signPlacement}
                        onValueChange={(value) => setInvoiceSettings({ ...invoiceSettings, signPlacement: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Before Amount">{t("invoice.signPlacements.before")}</SelectItem>
                          <SelectItem value="After Amount">{t("invoice.signPlacements.after")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                        {t("invoice.decimalPlaces")}
                      </Label>
                      <Input
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
                  <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("invoice.discountSettings")}</h3>
                  <div className="space-y-4">
                    <RadioGroup
                      value={invoiceSettings.discountType}
                      onValueChange={(value) => setInvoiceSettings({ ...invoiceSettings, discountType: value })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="percentage" id="percentage" />
                        <Label htmlFor="percentage">{t("invoice.percentage")}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fixed" id="fixed" />
                        <Label htmlFor="fixed">{t("invoice.fixedAmount")}</Label>
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
                  <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("invoice.taxSettings")}</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("invoice.vatNumber")}</Label>
                      <Input
                        value={invoiceSettings.vatNumber}
                        onChange={(e) => setInvoiceSettings({ ...invoiceSettings, vatNumber: e.target.value })}
                        className="border-gray-300"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("invoice.taxAmount")}</Label>
                        <Input
                          value={invoiceSettings.taxAmount}
                          onChange={(e) => setInvoiceSettings({ ...invoiceSettings, taxAmount: e.target.value })}
                          className="border-gray-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("invoice.method")}</Label>
                        <Select
                          value={invoiceSettings.taxMethod}
                          onValueChange={(value) => setInvoiceSettings({ ...invoiceSettings, taxMethod: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Default Values">{t("invoice.taxMethods.default")}</SelectItem>
                            <SelectItem value="Custom">{t("invoice.taxMethods.custom")}</SelectItem>
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
                  <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("invoice.notesSettings")}</h3>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("invoice.defaultNotes")}</Label>
                    <Textarea
                      value={invoiceSettings.defaultNotes}
                      onChange={(e) => setInvoiceSettings({ ...invoiceSettings, defaultNotes: e.target.value })}
                      className="border-gray-300 min-h-[80px]"
                      placeholder={t("invoice.defaultNotesPlaceholder")}
                    />
                  </div>
                </div>
              )}

              {/* Other Settings */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("invoice.otherSettings")}</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                      {t("invoice.pdfSaveLocation")}
                    </Label>
                    <div className="flex">
                      <Input
                        value={invoiceSettings.saveLocation}
                        onChange={(e) => setInvoiceSettings({ ...invoiceSettings, saveLocation: e.target.value })}
                        className="border-gray-300 flex-1"
                        placeholder={t("invoice.selectFolderPlaceholder")}
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
                      {t("invoice.folderSelectDescription")}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("invoice.template")}</Label>
                      <Select
                        value={invoiceSettings.template}
                        onValueChange={(value) => setInvoiceSettings({ ...invoiceSettings, template: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Minimal">{t("invoice.templates.minimal")}</SelectItem>
                          <SelectItem value="Standard">{t("invoice.templates.standard")}</SelectItem>
                          <SelectItem value="Professional">{t("invoice.templates.professional")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("invoice.dateFormat")}</Label>
                      <Select
                        value={invoiceSettings.dateFormat}
                        onValueChange={(value) => setInvoiceSettings({ ...invoiceSettings, dateFormat: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="07/04/2025 (MM/DD/YYYY)">{t("invoice.dateFormats.mmddyyyy")}</SelectItem>
                          <SelectItem value="04/07/2025 (DD/MM/YYYY)">{t("invoice.dateFormats.ddmmyyyy")}</SelectItem>
                          <SelectItem value="2025-07-04 (YYYY-MM-DD)">{t("invoice.dateFormats.yyyymmdd")}</SelectItem>
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
                  <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("general.sound")}</Label>
                  <Select
                     value={generalSettings.sound}
                     disabled={generalSettings.mute}
                     onValueChange={(value) => {
                      setGeneralSettings({ ...generalSettings, sound: value })
                      setSoundSetting(value as SoundSetting) // update context too
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Default Values">{t("general.soundOptions.default")}</SelectItem>
                      <SelectItem value="Custom">{t("general.soundOptions.custom")}</SelectItem>
                      <SelectItem value="Disabled">{t("general.soundOptions.disabled")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("general.mute")}</Label>
                  <Switch
                    checked={generalSettings.mute}
                    onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, mute: checked })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t("general.language")}</Label>
                  <Select
                    value={generalSettings.language}
                    onValueChange={(value) => {
                      setGeneralSettings({ ...generalSettings, language: value });
                      // map UI label to actual locale code
                      const langCode = value === 'Français' ? 'fr' : 'en';
                      setLocale(langCode);
                      }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">{t("general.languages.english")}</SelectItem>
                      <SelectItem value="Français">{t("general.languages.french")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                    {t("general.openPdfAfterSave")}
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
