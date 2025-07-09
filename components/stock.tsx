"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ShoppingCart,
  Filter,
  Heart,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Simple, clean stock data
const stockItems = [
  {
    id: 1,
    name: "MacBook Pro 16",
    sku: "APPLE-001",
    category: "Electronics",
    quantity: 25,
    minStock: 10,
    price: 2499.99,
    supplier: "Apple Inc.",
    favorite: true,
  },
  {
    id: 2,
    name: "Ergonomic Office Chair",
    sku: "CHAIR-001",
    category: "Furniture",
    quantity: 5,
    minStock: 15,
    price: 299.99,
    supplier: "Herman Miller",
    favorite: false,
  },
  {
    id: 3,
    name: "Wireless Mouse",
    sku: "MOUSE-001",
    category: "Electronics",
    quantity: 0,
    minStock: 20,
    price: 99.99,
    supplier: "Logitech",
    favorite: false,
  },
  {
    id: 4,
    name: "iPhone 15 Pro",
    sku: "PHONE-001",
    category: "Electronics",
    quantity: 45,
    minStock: 20,
    price: 999.99,
    supplier: "Apple Inc.",
    favorite: true,
  },
  {
    id: 5,
    name: "Standing Desk",
    sku: "DESK-001",
    category: "Furniture",
    quantity: 8,
    minStock: 10,
    price: 799.99,
    supplier: "Uplift Desk",
    favorite: false,
  },
  {
    id: 6,
    name: "AirPods Pro",
    sku: "AUDIO-001",
    category: "Electronics",
    quantity: 32,
    minStock: 25,
    price: 249.99,
    supplier: "Apple Inc.",
    favorite: true,
  },
]

export function StockPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredItems = stockItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category.toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalItems = stockItems.length
  const lowStockItems = stockItems.filter((item) => item.quantity <= item.minStock && item.quantity > 0).length
  const outOfStockItems = stockItems.filter((item) => item.quantity === 0).length
  const totalValue = stockItems.reduce((sum, item) => sum + item.quantity * item.price, 0)

  const getStockLevel = (quantity: number, minStock: number) => {
    if (quantity === 0) return { level: 0, status: "empty" }
    const percentage = (quantity / (minStock * 2)) * 100
    if (percentage <= 50) return { level: percentage, status: "low" }
    return { level: Math.min(percentage, 100), status: "good" }
  }

  const getStatusInfo = (item: (typeof stockItems)[0]) => {
    if (item.quantity === 0) {
      return { badge: "Out of Stock", variant: "destructive" as const }
    } else if (item.quantity <= item.minStock) {
      return { badge: "Low Stock", variant: "secondary" as const }
    } else {
      return { badge: "In Stock", variant: "outline" as const }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Package className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h1 className="text-2xl font-medium text-gray-900">Stock Management</h1>
                <p className="text-gray-500 text-sm">Simple inventory control</p>
              </div>
            </div>
            <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-6">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Simple Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Products</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalItems}</p>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Low Stock</p>
                  <p className="text-2xl font-semibold text-orange-600">{lowStockItems}</p>
                </div>
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Out of Stock</p>
                  <p className="text-2xl font-semibold text-red-600">{outOfStockItems}</p>
                </div>
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Value</p>
                  <p className="text-2xl font-semibold text-gray-900">€{Math.round(totalValue / 1000)}K</p>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Simple Search & Filters */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 rounded-xl"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 border-gray-200 rounded-xl">
                  <Filter className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-xl border-gray-200 bg-transparent">
                  Export
                </Button>
                <Button variant="outline" className="rounded-xl border-gray-200 bg-transparent">
                  Import
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Simple Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const stockLevel = getStockLevel(item.quantity, item.minStock)
            const statusInfo = getStatusInfo(item)

            return (
              <Card
                key={item.id}
                className="group border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  {/* Product Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge variant={statusInfo.variant} className="w-fit text-xs rounded-full">
                          {statusInfo.badge}
                        </Badge>
                        {item.favorite && <Heart className="h-4 w-4 text-pink-500 fill-current" />}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Reorder
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-500 font-mono">{item.sku}</p>
                    </div>

                    {/* Simple Stock Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Stock</span>
                        <span className="text-sm font-medium text-gray-900">{item.quantity} units</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            stockLevel.status === "empty"
                              ? "bg-red-400"
                              : stockLevel.status === "low"
                                ? "bg-orange-400"
                                : "bg-green-400"
                          }`}
                          style={{ width: `${stockLevel.level}%` }}
                        />
                      </div>
                    </div>

                    {/* Price and Category */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-xl font-semibold text-gray-900">€{item.price}</p>
                        <p className="text-sm text-gray-500">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Min: {item.minStock}</p>
                        <p className="text-xs text-gray-400">{item.supplier}</p>
                      </div>
                    </div>

                    {/* Simple Action Buttons */}
                    <div className="flex gap-2 pt-3">
                      <Button variant="outline" size="sm" className="flex-1 rounded-xl border-gray-200 bg-transparent">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" className="flex-1 bg-gray-900 hover:bg-gray-800 rounded-xl">
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Restock
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Simple Empty State */}
        {filteredItems.length === 0 && (
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or add a new product</p>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
