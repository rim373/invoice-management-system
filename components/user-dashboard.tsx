import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Target, Wallet, TrendingUp, Calendar, MoreHorizontal, ArrowUpRight } from "lucide-react"

export function UserDashboard() {
  const userMetrics = [
    {
      title: "Current Project Benefits",
      value: "$45,200",
      subtitle: "Annual benefits this year",
      icon: Target,
      color: "bg-blue-500",
      change: "+18.5%",
    },
    {
      title: "Total Historical Benefits",
      value: "$127,800",
      subtitle: "All projects combined",
      icon: Wallet,
      color: "bg-green-500",
      change: "+24.3%",
    },
    {
      title: "Performance Score",
      value: "92.5%",
      subtitle: "Project completion rate",
      icon: TrendingUp,
      color: "bg-purple-500",
      change: "+5.2%",
    },
    {
      title: "Active Projects",
      value: "3",
      subtitle: "Currently working on",
      icon: Calendar,
      color: "bg-orange-500",
      change: "+1",
    },
  ]

  const currentProjects = [
    {
      name: "E-commerce Platform",
      client: "TechFlow Solutions",
      progress: 75,
      benefit: "$18,500",
      deadline: "Dec 15, 2024",
      status: "On Track",
    },
    {
      name: "Mobile App Development",
      client: "Digital Dynamics",
      progress: 45,
      benefit: "$12,300",
      deadline: "Jan 30, 2025",
      status: "In Progress",
    },
    {
      name: "Data Analytics Dashboard",
      client: "INVERNI BW",
      progress: 90,
      benefit: "$14,400",
      deadline: "Nov 28, 2024",
      status: "Near Completion",
    },
  ]

  const historicalProjects = [
    {
      name: "CRM System",
      client: "EVBALT Corp",
      completedDate: "Sep 2024",
      benefit: "$22,100",
      rating: 4.8,
    },
    {
      name: "Website Redesign",
      client: "STATUE TEMPUR",
      completedDate: "Jul 2024",
      benefit: "$15,600",
      rating: 4.9,
    },
    {
      name: "API Integration",
      client: "TechFlow Solutions",
      completedDate: "May 2024",
      benefit: "$18,900",
      rating: 4.7,
    },
    {
      name: "Database Optimization",
      client: "Digital Dynamics",
      completedDate: "Mar 2024",
      benefit: "$12,800",
      rating: 4.6,
    },
  ]

  return (
    <div className="space-y-6">
      {/* User Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {userMetrics.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 ${metric.color} rounded-lg flex items-center justify-center`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center text-green-500">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm ml-1">{metric.change}</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                <div className="text-sm text-gray-600 mt-1">{metric.subtitle}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Current Projects</CardTitle>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {currentProjects.map((project, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-600">{project.client}</p>
                    </div>
                    <Badge
                      variant={
                        project.status === "On Track"
                          ? "default"
                          : project.status === "Near Completion"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between mt-3 text-sm">
                    <span className="text-gray-600">
                      Benefit: <span className="font-semibold text-green-600">{project.benefit}</span>
                    </span>
                    <span className="text-gray-600">Due: {project.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Benefits Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Benefits Breakdown</CardTitle>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">$127,800</div>
                <div className="text-sm text-gray-600">Total Lifetime Benefits</div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Year</span>
                  <span className="text-sm text-gray-600">$45,200 (35%)</span>
                </div>
                <Progress value={35} className="h-2" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Previous Year</span>
                  <span className="text-sm text-gray-600">$52,100 (41%)</span>
                </div>
                <Progress value={41} className="h-2" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">2022 & Earlier</span>
                  <span className="text-sm text-gray-600">$30,500 (24%)</span>
                </div>
                <Progress value={24} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historical Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Historical Projects & Benefits</CardTitle>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Project Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Client</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Completed</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Benefit</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Rating</th>
                </tr>
              </thead>
              <tbody>
                {historicalProjects.map((project, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="font-medium">{project.name}</div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{project.client}</td>
                    <td className="py-4 px-4 text-gray-600">{project.completedDate}</td>
                    <td className="py-4 px-4 font-medium text-green-600">{project.benefit}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1 text-sm">{project.rating}</span>
                      </div>
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
