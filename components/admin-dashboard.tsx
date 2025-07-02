import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, Users, Target, MoreHorizontal, ArrowUpRight, ArrowDownRight } from "lucide-react"

export function AdminDashboard() {
  const metrics = [
    {
      title: "Annual Startup Benefits",
      value: "$2,634k",
      subtitle: "Overall startup income",
      icon: DollarSign,
      color: "bg-orange-500",
      change: "+12.5%",
      positive: true,
    },
    {
      title: "Investment Money",
      value: "4,933",
      subtitle: "Total investments this month",
      icon: TrendingUp,
      color: "bg-purple-500",
      change: "+8.2%",
      positive: true,
    },
    {
      title: "Active Clients",
      value: "84,453",
      subtitle: "Customer base all",
      icon: Users,
      color: "bg-pink-500",
      change: "+15.3%",
      positive: true,
    },
    {
      title: "Revenue Growth",
      value: "14.7%",
      subtitle: "Driving revenue growth",
      icon: Target,
      color: "bg-blue-500",
      change: "-2.1%",
      positive: false,
    },
  ]

  const topClients = [
    { name: "INVERNI BW", revenue: "$449,000", projects: 34, growth: "+23.42%", status: "Active" },
    { name: "EVBALT Corp", revenue: "$199,000", projects: 53, growth: "+12.83%", status: "Active" },
    { name: "STATUE TEMPUR", revenue: "$699,000", projects: 427, growth: "+16.02%", status: "Pending" },
    { name: "TechFlow Solutions", revenue: "$325,000", projects: 28, growth: "+18.75%", status: "Active" },
    { name: "Digital Dynamics", revenue: "$156,000", projects: 15, growth: "+9.45%", status: "Active" },
  ]

  const monthlyActivity = [
    { month: "Jan", revenue: 45000, investments: 12000 },
    { month: "Feb", revenue: 52000, investments: 15000 },
    { month: "Mar", revenue: 48000, investments: 11000 },
    { month: "Apr", revenue: 61000, investments: 18000 },
    { month: "May", revenue: 55000, investments: 16000 },
    { month: "Jun", revenue: 67000, investments: 22000 },
    { month: "Jul", revenue: 72000, investments: 25000 },
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 ${metric.color} rounded-lg flex items-center justify-center`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                <div className="text-sm text-gray-600 mt-1">{metric.subtitle}</div>
                <div className="flex items-center mt-2">
                  {metric.positive ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm ml-1 ${metric.positive ? "text-green-500" : "text-red-500"}`}>
                    {metric.change}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Monthly Monetary Activity</CardTitle>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyActivity.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-semibold text-orange-600">{item.month}</span>
                    </div>
                    <div>
                      <div className="font-medium">${item.revenue.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Revenue</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-purple-600">${item.investments.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Investments</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Investment Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Investment Distribution</CardTitle>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Technology</span>
                <span className="text-sm text-gray-600">45%</span>
              </div>
              <Progress value={45} className="h-2" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Healthcare</span>
                <span className="text-sm text-gray-600">30%</span>
              </div>
              <Progress value={30} className="h-2" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Finance</span>
                <span className="text-sm text-gray-600">15%</span>
              </div>
              <Progress value={15} className="h-2" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Others</span>
                <span className="text-sm text-gray-600">10%</span>
              </div>
              <Progress value={10} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Most Active Clients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Most Active Clients</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              All Status
            </Button>
            <Button variant="outline" size="sm">
              All Category
            </Button>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Client Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Projects</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Growth Rate</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {topClients.map((client, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-600">
                            {client.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-gray-500">Client</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium">{client.revenue}</td>
                    <td className="py-4 px-4">{client.projects}</td>
                    <td className="py-4 px-4 text-green-600">{client.growth}</td>
                    <td className="py-4 px-4">
                      <Badge variant={client.status === "Active" ? "default" : "secondary"}>{client.status}</Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
