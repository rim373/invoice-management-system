import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, Users, Target, MoreHorizontal, ArrowUpRight, ArrowDownRight } from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,ComposedChart, Line
} from "recharts"

export function UserDashboard() {
  const metrics = [
  {
    title: "Growth Rate",
    value: "N/A",
    subtitle: "compared to last month",
    icon: TrendingUp,
    color: "bg-blue-500",
    change: "N/A",
    positive: true,
  },
  {
    title: "Average Sale",
    value: "0.00",
    subtitle: "per invoice",
    icon: DollarSign,
    color: "bg-green-500",
    change: "0.0%",
    positive: true,
  },
  {
    title: "Conversion Rate",
    value: "0.0%",
    subtitle: "Paid invoices",
    icon: Target,
    color: "bg-purple-500",
    change: "0.0%",
    positive: true,
  },
]

  const revenueByClientProduct = [
  { client: "INVERNI BW", ProductA: 120000, ProductB: 180000, ProductC: 149000 },
  { client: "EVBALT Corp", ProductA: 90000, ProductB: 70000, ProductC: 39000 },
  { client: "STATUE TEMPUR", ProductA: 300000, ProductB: 200000, ProductC: 199000 },
  { client: "TechFlow Solutions", ProductA: 125000, ProductB: 100000, ProductC: 100000 },
  { client: "Digital Dynamics", ProductA: 56000, ProductB: 50000, ProductC: 50000 },
];

  const monthlyActivity = [
    { month: "Jan", revenue: 45000},
    { month: "Feb", revenue: 52000 },
    { month: "Mar", revenue: 48000},
    { month: "Apr", revenue: 61000},
    { month: "May", revenue: 55000},
    { month: "Jun", revenue: 67000 },
    { month: "Jul", revenue: 72000},
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {metrics.map((metric, index) => (
    <Card key={index} className="relative overflow-hidden">
      <CardContent className="p-6 text-center">
        <div className="text-sm text-gray-600 mb-1">{metric.title}</div>
        <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
        <div className="text-sm text-gray-600 mt-1">{metric.subtitle}</div>
      </CardContent>
    </Card>
  ))}
</div>

      <div className="grid grid-cols-1  gap-6">
        {/* Monthly Activity Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Monthly Monetary Activity</CardTitle>
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
                  <Tooltip
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#fb923c" radius={[4, 4, 0, 0]} name="Revenue" barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
      </div>

      {/* Revenue par client and product */}
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
              <ComposedChart
                data={revenueByClientProduct}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <XAxis dataKey="client" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Legend />
                <Bar dataKey="ProductA" name="Product A" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ProductB" name="Product B" fill="#fb923c" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ProductC" name="Product C" fill="#34d399" radius={[4, 4, 0, 0]} />
                {/* Example: Line for total revenue */}
                <Line
                  type="monotone"
                  dataKey={(data) => data.ProductA + data.ProductB + data.ProductC}
                  name="Total Revenue"
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
