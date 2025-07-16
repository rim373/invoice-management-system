"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line
} from "recharts"
import { TrendingUp, DollarSign, Target, MoreHorizontal } from "lucide-react"

export function UserDashboard() {
  const t = useTranslations("userDashboard")

  const metrics = [
    {
      key: "growthRate",
      value: "N/A",
      subtitleKey: "comparedToLastMonth",
      icon: TrendingUp
    },
    {
      key: "averageSale",
      value: "0.00",
      subtitleKey: "perInvoice",
      icon: DollarSign
    },
    {
      key: "conversionRate",
      value: "0.0%",
      subtitleKey: "paidInvoices",
      icon: Target
    }
  ]

  const revenueByClientProduct = [
    { client: "INVERNI BW", ProductA: 120000, ProductB: 180000, ProductC: 149000 },
    { client: "EVBALT Corp", ProductA: 90000, ProductB: 70000, ProductC: 39000 },
    { client: "STATUE TEMPUR", ProductA: 300000, ProductB: 200000, ProductC: 199000 },
    { client: "TechFlow Solutions", ProductA: 125000, ProductB: 100000, ProductC: 100000 },
    { client: "Digital Dynamics", ProductA: 56000, ProductB: 50000, ProductC: 50000 }
  ]

  const monthlyActivity = [
    { month: "Jan", revenue: 45000 },
    { month: "Feb", revenue: 52000 },
    { month: "Mar", revenue: 48000 },
    { month: "Apr", revenue: 61000 },
    { month: "May", revenue: 55000 },
    { month: "Jun", revenue: 67000 },
    { month: "Jul", revenue: 72000 }
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6 text-center">
              <div className="text-sm text-gray-600 mb-1">{t(metric.key)}</div>
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              <div className="text-sm text-gray-600 mt-1">{t(metric.subtitleKey)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Activity Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("monthlyMonetaryActivity")}</CardTitle>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyActivity} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="month" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar
                  dataKey="revenue"
                  fill="#fb923c"
                  radius={[4, 4, 0, 0]}
                  name={t("revenue")}
                  barSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Client & Product */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("revenueByClientAndProduct")}</CardTitle>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={revenueByClientProduct} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="client" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="ProductA" name="Product A" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ProductB" name="Product B" fill="#fb923c" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ProductC" name="Product C" fill="#34d399" radius={[4, 4, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey={(d: any) => d.ProductA + d.ProductB + d.ProductC}
                  name={t("totalRevenue")}
                  stroke="#8b5cf6"
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
