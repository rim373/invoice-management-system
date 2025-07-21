"use client"

import { useTranslations } from "next-intl"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DollarSign,
  TrendingUp,
  Target,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  AlertTriangle,
  Eye,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

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
  paymentHistory: any[]
  createdBy: string
  userRole: "user" | "admin"
  discountAmount?: number
  discountType?: "percentage" | "fixed"
  vatNumber?: string
  notes?: string
}

interface StockItem {
  id: string
  name: string
  myproduct: boolean
  quantity: number
  minStock: number
  price: number
  currency: string
  supplier?: string
  description: string
}

interface UserDashboardProps {
  onPageChange?: (page: string) => void
}

export function UserDashboard({ onPageChange }: UserDashboardProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch invoices
        const invoicesResponse = await fetch("/api/invoices")
        const invoicesResult = await invoicesResponse.json()
        if (invoicesResult.success) {
          setInvoices(invoicesResult.data)
        }

        // Fetch stock items
        const stockResponse = await fetch("/api/stock")
        const stockResult = await stockResponse.json()
        if (stockResult.stockItems) {
          setStockItems(stockResult.stockItems)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate metrics from real data
  const calculateMetrics = () => {
    if (invoices.length === 0) {
      return {
        totalRevenue: 0,
        averageSale: 0,
        conversionRate: 0,
        growthRate: 0,
        paidInvoices: 0,
        totalInvoices: 0,
      }
    }

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
    const paidInvoices = invoices.filter((inv) => inv.status === "paid").length
    const totalInvoices = invoices.length
    const averageSale = totalRevenue / totalInvoices
    const conversionRate = (paidInvoices / totalInvoices) * 100

    // Calculate growth rate (comparing last 30 days vs previous 30 days)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const recentRevenue = invoices
      .filter((inv) => new Date(inv.createdDate) >= thirtyDaysAgo)
      .reduce((sum, inv) => sum + inv.totalAmount, 0)

    const previousRevenue = invoices
      .filter((inv) => new Date(inv.createdDate) >= sixtyDaysAgo && new Date(inv.createdDate) < thirtyDaysAgo)
      .reduce((sum, inv) => sum + inv.totalAmount, 0)

    const growthRate = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0

    return {
      totalRevenue,
      averageSale,
      conversionRate,
      growthRate,
      paidInvoices,
      totalInvoices,
    }
  }

  // Generate monthly activity data from real invoices
  const generateMonthlyActivity = () => {
    const monthlyData: { [key: string]: number } = {}
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Initialize all months with 0
    months.forEach((month) => {
      monthlyData[month] = 0
    })

    // Aggregate revenue by month
    invoices.forEach((invoice) => {
      const date = new Date(invoice.createdDate)
      const monthName = months[date.getMonth()]
      if (monthName) {
        monthlyData[monthName] += invoice.totalAmount
      }
    })

    return months.map((month) => ({
      month,
      revenue: monthlyData[month],
    }))
  }

  // Generate revenue by client and product data with actual product descriptions
  const generateRevenueByClientProduct = () => {
    const clientProductData: { [key: string]: { [key: string]: number } } = {}
    const allProducts = new Set<string>()

    // Collect all unique products and client data
    invoices.forEach((invoice) => {
      const clientKey = invoice.clientName
      if (!clientProductData[clientKey]) {
        clientProductData[clientKey] = {}
      }

      invoice.items.forEach((item) => {
        const productName = item.description
        allProducts.add(productName)
        if (!clientProductData[clientKey][productName]) {
          clientProductData[clientKey][productName] = 0
        }
        clientProductData[clientKey][productName] += item.totalPrice
      })
    })

    // Convert to chart format - each client becomes a row with products as columns
    const chartData = Object.entries(clientProductData)
      .map(([client, products]) => {
        const clientData: any = { client }

        // Add each product as a separate property
        allProducts.forEach((product) => {
          clientData[product] = products[product] || 0
        })

        // Calculate total for sorting
        clientData._total = Object.values(products).reduce((sum: number, val) => sum + val, 0)

        return clientData
      })
      .sort((a, b) => b._total - a._total) // Sort by total revenue
      .slice(0, 5) // Limit to top 5 clients
      .map(({ _total, ...rest }) => rest) // Remove the _total field

    return { chartData, allProducts: Array.from(allProducts) }
  }

  // Calculate stock metrics
  const calculateStockMetrics = () => {
    const totalItems = stockItems.length
    const lowStockItems = stockItems.filter((item) => item.quantity <= item.minStock && item.quantity > 0).length
    const outOfStockItems = stockItems.filter((item) => item.quantity === 0).length
    const totalStockValue = stockItems.reduce((sum, item) => sum + item.quantity * item.price, 0)

    return {
      totalItems,
      lowStockItems,
      outOfStockItems,
      totalStockValue,
    }
  }

  // Generate stock status distribution
  const generateStockStatusData = () => {
    const stockMetrics = calculateStockMetrics()
    const inStockItems = stockMetrics.totalItems - stockMetrics.lowStockItems - stockMetrics.outOfStockItems

    return [
      { name: "In Stock", value: inStockItems, color: "#10b981" },
      { name: "Low Stock", value: stockMetrics.lowStockItems, color: "#f59e0b" },
      { name: "Out of Stock", value: stockMetrics.outOfStockItems, color: "#ef4444" },
    ]
  }

  const metrics = calculateMetrics()
  const monthlyActivity = generateMonthlyActivity()
  const { chartData: revenueByClientProduct, allProducts } = generateRevenueByClientProduct()
  const stockMetrics = calculateStockMetrics()
  const stockStatusData = generateStockStatusData()

  const dashboardMetrics = [
    {
      title: "Growth Rate",
      value: loading ? "Loading..." : `${metrics.growthRate.toFixed(1)}%`,
      subtitle: "compared to last month",
      icon: TrendingUp,
      color: "bg-blue-500",
      change: `${metrics.growthRate.toFixed(1)}%`,
      positive: metrics.growthRate >= 0,
    },
    {
      title: "Average Sale",
      value: loading ? "Loading..." : `€${metrics.averageSale.toFixed(2)}`,
      subtitle: "per invoice",
      icon: DollarSign,
      color: "bg-green-500",
      change: `${metrics.totalInvoices} invoices`,
      positive: true,
    },
    {
      title: "Conversion Rate",
      value: loading ? "Loading..." : `${metrics.conversionRate.toFixed(1)}%`,
      subtitle: "Paid invoices",
      icon: Target,
      color: "bg-purple-500",
      change: `${metrics.paidInvoices}/${metrics.totalInvoices}`,
      positive: metrics.conversionRate > 50,
    },
    {
      title: "Stock Value",
      value: loading ? "Loading..." : `€${stockMetrics.totalStockValue.toFixed(2)}`,
      subtitle: "total inventory value",
      icon: Package,
      color: "bg-orange-500",
      change: `${stockMetrics.totalItems} items`,
      positive: true,
    },
  ]

  const handleViewStockDetails = () => {
    if (onPageChange) {
      onPageChange("stock")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardMetrics.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">{metric.title}</div>
                  <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                  <div className="text-sm text-gray-600 mt-1">{metric.subtitle}</div>
                  <div className="flex items-center mt-2">
                    {metric.positive ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${metric.positive ? "text-green-500" : "text-red-500"}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${metric.color} rounded-xl flex items-center justify-center`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Activity Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Monthly Monetary Activity</CardTitle>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyActivity} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="month" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip formatter={(value: number) => `€${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#fb923c" radius={[4, 4, 0, 0]} name="Revenue" barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Stock Status Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Stock Overview</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleViewStockDetails}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stockStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stockStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {stockStatusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
              {stockMetrics.lowStockItems > 0 && (
                <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                  <span className="text-sm text-orange-700">{stockMetrics.lowStockItems} items need restocking</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Client and Product */}
      {revenueByClientProduct.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Revenue by Client & Product</CardTitle>
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
                  <Tooltip formatter={(value: number) => `€${value.toLocaleString()}`} />
                  <Legend />
                  {/* Dynamically create bars for each product */}
                  {allProducts.slice(0, 5).map((product, index) => {
                    const colors = ["#60a5fa", "#fb923c", "#34d399", "#8b5cf6", "#f87171"]
                    return (
                      <Bar
                        key={product}
                        dataKey={product}
                        name={product}
                        fill={colors[index % colors.length]}
                        radius={[4, 4, 0, 0]}
                      />
                    )
                  })}
                  {/* Line for total revenue */}
                  <Line
                    type="monotone"
                    dataKey={(data: any) => {
                      return allProducts.reduce((sum, product) => sum + (data[product] || 0), 0)
                    }}
                    name="Total Revenue"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{invoice.number}</div>
                    <div className="text-xs text-gray-500">{invoice.clientName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">€{invoice.totalAmount.toFixed(2)}</div>
                    <Badge
                      variant={
                        invoice.status === "paid"
                          ? "default"
                          : invoice.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-xs"
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(() => {
                // Calculate top products by revenue
                const productRevenue: { [key: string]: number } = {}
                invoices.forEach((invoice) => {
                  invoice.items.forEach((item) => {
                    if (!productRevenue[item.description]) {
                      productRevenue[item.description] = 0
                    }
                    productRevenue[item.description] += item.totalPrice
                  })
                })

                return Object.entries(productRevenue)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([product, revenue]) => (
                    <div key={product} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-sm truncate">{product}</div>
                      <div className="font-medium text-sm">€{revenue.toFixed(2)}</div>
                    </div>
                  ))
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
