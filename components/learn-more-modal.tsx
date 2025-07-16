"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Video, MessageCircle, Mail, HelpCircle, ExternalLink, X } from "lucide-react"
import { useTranslations } from "next-intl"

interface LearnMoreModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LearnMoreModal({ isOpen, onClose }: LearnMoreModalProps) {
  const  t  = useTranslations("LearnMoreModal")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-orange-500" />
            <span>{t("Help & Learning Resources")}</span>
          </DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* App Overview */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t("About Client Facturation")}</h3>
              <p className="text-gray-600 mb-4">{t("App overview description")}</p>
            </CardContent>
          </Card>

          {/* Quick Features */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t("Key Features")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {[
                  t("Client Management"),
                  t("Invoice Generation"),
                  t("Financial Tracking"),
                  t("Report Generation"),
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Learning Resources */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("Learning Resources")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Documentation */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{t("Documentation")}</h4>
                      <p className="text-sm text-gray-600 mb-2">{t("Complete user guide and API reference")}</p>
                      <Button variant="outline" size="sm" className="text-xs bg-transparent">
                        {t("Read Docs")}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Video Tutorials */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                      <Video className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{t("Video Tutorials")}</h4>
                      <p className="text-sm text-gray-600 mb-2">{t("Step-by-step video guides")}</p>
                      <Button variant="outline" size="sm" className="text-xs bg-transparent">
                        {t("Watch Videos")}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Community */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{t("Community")}</h4>
                      <p className="text-sm text-gray-600 mb-2">{t("Join our user community forum")}</p>
                      <Button variant="outline" size="sm" className="text-xs bg-transparent">
                        {t("Join Forum")}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email Support */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{t("Email Support")}</h4>
                      <p className="text-sm text-gray-600 mb-2">{t("Get help from our support team")}</p>
                      <Button variant="outline" size="sm" className="text-xs bg-transparent">
                        {t("Contact Support")}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Quick Tip */}
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-orange-800 mb-2 flex items-center">💡 {t("Quick Tip")}</h4>
              <p className="text-sm text-orange-700">{t("Quick tip text")}</p>
            </CardContent>
          </Card>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose} className="bg-orange-500 hover:bg-orange-600 text-white">
              {t("Close")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
