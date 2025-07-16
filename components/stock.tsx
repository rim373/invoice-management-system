"use client"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  Currency,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// Initial stock data
const initialStockItems = [
  {
    id: 1,
    name: "MacBook Pro 16",
    myproduct:true,
    quantity: 25,
    minStock: 10,
    price: 2499.99,
    currency: "EUR",
    source: "entreprise x",
    description: "High-performance laptop for professionals",
  },
  {
    id: 2,
    name: "Ergonomic Office Chair",
    myproduct:true,
    quantity: 5,
    minStock: 15,
    price: 299.99,
    currency: "EUR",
    supplier: "Herman Miller",
    description: "Comfortable office chair with lumbar support",

  },
  {
    id: 3,
    name: "Wireless Mouse",
    myproduct:true,
    quantity: 0,
    minStock: 20,
    price: 99.99,
    currency: "EUR",
    supplier: "Logitech",
    description: "Precision wireless mouse",

  },
  {
    id: 4,
    name: "iPhone 15 Pro",
    myproduct:true,
    quantity: 45,
    minStock: 20,
    price: 999.99,
    currency: "EUR",
    supplier: "Apple Inc.",
    description: "Latest iPhone with advanced features",

  },
  {
    id: 5,
    name: "Standing Desk",
    myproduct:false,
    quantity: 8,
    minStock: 10,
    price: 799.99,
    currency: "EUR",
    supplier: "Uplift Desk",
    description: "Adjustable height standing desk",

  },
  {
    id: 6,
    name: "AirPods Pro",
    myproduct:true,
    quantity: 32,
    minStock: 25,
    price: 249.99,
    currency: "EUR",
    supplier: "Apple Inc.",
    description: "Noise-cancelling wireless earbuds",

  },
]

interface StockItem {
  id: number
  name: string
  myproduct: boolean
  quantity: number
  minStock: number
  price: number
  currency: string
  supplier?: string
  description: string

}

export function StockPage() {
  //translation
  const  t  = useTranslations("stock")

  const [productOriginFilter, setProductOriginFilter] = useState<"all" | "my" | "imported">("all")
  const [stockItems, setStockItems] = useState<StockItem[]>(initialStockItems)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<StockItem | null>(null)
  const [restockingItem, setRestockingItem] = useState<StockItem | null>(null)
  const [restockQuantity, setRestockQuantity] = useState("")
  const { toast } = useToast()

  // Form state for adding/editing products
  const [formData, setFormData] = useState({
    name: "",
    myproduct: false,
    quantity: "",
    minStock: "",
    price: "",
    currency: "",
    supplier: "",
    description: "",
  })

  // Get next available ID
  const getNextId = () => {
    return Math.max(...stockItems.map((item) => item.id)) + 1
  }

  // Filter items based on search and status
  const filteredItems = stockItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    let matchesStatus = true
    if (selectedStatus === "in-stock") {
      matchesStatus = item.quantity > item.minStock
    } else if (selectedStatus === "low-stock") {
      matchesStatus = item.quantity <= item.minStock && item.quantity > 0
    } else if (selectedStatus === "out-of-stock") {
      matchesStatus = item.quantity === 0
    }

    let matchesOrigin = true
    if (productOriginFilter === "my") {
        matchesOrigin = item.myproduct === true
    } else if (productOriginFilter === "imported") {
        matchesOrigin = item.myproduct === false
    }

    return matchesSearch && matchesStatus&& matchesOrigin
  })

  const totalItems = stockItems.length
  const lowStockItems = stockItems.filter((item) => item.quantity <= item.minStock && item.quantity > 0).length
  const outOfStockItems = stockItems.filter((item) => item.quantity === 0).length
  const totalValue = stockItems.reduce((sum, item) => sum + item.quantity * item.price, 0)

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      myproduct:true,
      quantity: "",
      minStock: "",
      price: "",
      currency: "",
      supplier: "",
      description: "",
    })
  }

  // Add new product
  const handleAddProduct = () => {
    if (!formData.name || !formData.quantity || !formData.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const newItem: StockItem = {
      id: getNextId(),
      name: formData.name,
      myproduct: formData.myproduct,
      quantity: Number.parseInt(formData.quantity),
      minStock: Number.parseInt(formData.minStock) || 0,
      price: Number.parseFloat(formData.price),
      currency: formData.currency,
      supplier: formData.supplier,
      description: formData.description,
      
    }

    setStockItems([...stockItems, newItem])
    resetForm()
    setIsAddModalOpen(false)
    toast({
      title: "Success",
      description: "Product added successfully",
    })
  }

  // Edit product
  const handleEditProduct = () => {
    if (!editingItem || !formData.name || !formData.quantity || !formData.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const updatedItems = stockItems.map((item) =>
      item.id === editingItem.id
        ? {
            ...item,
            name: formData.name,
            myproduct: formData.myproduct,
            quantity: Number.parseInt(formData.quantity),
            minStock: Number.parseInt(formData.minStock) || 0,
            price: Number.parseFloat(formData.price),
            currency: formData.currency,
            supplier: formData.supplier,
            description: formData.description,
          }
        : item,
    )

    setStockItems(updatedItems)
    resetForm()
    setIsEditModalOpen(false)
    setEditingItem(null)
    toast({
      title: "Success",
      description: "Product updated successfully",
    })
  }

  // Restock product
  const handleRestock = () => {
    if (!restockingItem || !restockQuantity || Number.parseInt(restockQuantity) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid quantity",
        variant: "destructive",
      })
      return
    }

    const updatedItems = stockItems.map((item) =>
      item.id === restockingItem.id ? { ...item, quantity: item.quantity + Number.parseInt(restockQuantity) } : item,
    )

    setStockItems(updatedItems)
    setRestockQuantity("")
    setIsRestockModalOpen(false)
    setRestockingItem(null)
    toast({
      title: "Success",
      description: `Added ${restockQuantity} units to ${restockingItem.name}`,
    })
  }

  // Delete product
  const handleDeleteProduct = (id: number) => {
    setStockItems(stockItems.filter((item) => item.id !== id))
    toast({
      title: "Success",
      description: "Product deleted successfully",
    })
  }

  // Open edit modal
  const openEditModal = (item: StockItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      myproduct: item.myproduct,
      quantity: item.quantity.toString(),
      minStock: item.minStock.toString(),
      price: item.price.toString(),
      currency: item.currency, 
      supplier: item.supplier ?? "", 
      description: item.description,
    })
    setIsEditModalOpen(true)
  }

  // Open restock modal
  const openRestockModal = (item: StockItem) => {
    setRestockingItem(item)
    setRestockQuantity("")
    setIsRestockModalOpen(true)
  }

  const getStockLevel = (quantity: number, minStock: number) => {
    if (quantity === 0) return { level: 0, status: "empty" }
    const percentage = (quantity / (minStock * 2)) * 100
    if (percentage <= 50) return { level: percentage, status: "low" }
    return { level: Math.min(percentage, 100), status: "good" }
  }

  const getStatusInfo = (item: StockItem) => {
    if (item.quantity === 0) {
      return { badge: t("status.badge.empty"), variant: "destructive" as const }
    } else if (item.quantity <= item.minStock) {
      return { badge: t("status.badge.low"), variant: "secondary" as const }
    } else {
      return { badge: t("status.badge.good"), variant: "outline" as const }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Package className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h1 className="text-2xl font-medium text-gray-900">{t("header.title")}</h1>
                <p className="text-gray-500 text-sm">{t("header.subtitle")}</p>
              </div>
            </div>

            {/* Add Product Dialog */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-6">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("header.add")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm w-full sm:w-[400px] rounded-xl p-4">
                <DialogHeader>
                  <DialogTitle>{t("modal.addTitle")}</DialogTitle>
                  <DialogDescription>{t("modal.addDescription")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name">{t("form.name")} </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="rounded-xl text-sm h-9"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="myproduct">{t("form.myproduct")}</Label>
                    <Switch
                        id="myproduct"
                        checked={formData.myproduct}
                        onCheckedChange={(checked) => setFormData({ ...formData, myproduct: checked })}
                    />
                    </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="quantity">{t("form.quantity")}</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="rounded-xl text-sm h-9"
                      />
                    </div>
                    <div>
                      <Label htmlFor="minStock">{t("form.minStock")}</Label>
                      <Input
                        id="minStock"
                        type="number"
                        value={formData.minStock}
                        onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                        className="rounded-xl text-sm h-9"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="price">{t("form.price")} </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="rounded-xl text-sm h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">{t("form.currency")}</Label>
                    <Select
                        value={formData.currency}
                        onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                        <SelectTrigger className="rounded-xl text-sm h-9">
                        <SelectValue placeholder={t("form.placeholderCurrency")}/>
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="EUR">€ Euro</SelectItem>
                        <SelectItem value="USD">$ US Dollar</SelectItem>
                        <SelectItem value="TND">DT Tunisian Dinar</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>

                  {!formData.myproduct && (
                    <div>
                        <Label htmlFor="supplier">{t("form.supplier")}</Label>
                        <Input
                        id="supplier"
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                        className="rounded-xl text-sm h-9"
                        />
                    </div>
                    )}
                  <div>
                    <Label htmlFor="description">{t("form.description")}</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="rounded-xl text-sm"
                      rows={1}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddModalOpen(false)}
                      className="flex-1 rounded-xl text-sm h-8"
                    >
                      {t("form.cancel")}
                    </Button>
                    <Button
                      onClick={handleAddProduct}
                      className="flex-1 bg-gray-900 hover:bg-gray-800 rounded-xl text-sm h-8"
                    >
                      {t("form.submitAdd")}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 center">
          <Card className="border border-gray-200 shadow-xs">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t("filter.all")}</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalItems}</p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <Package className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t("filter.low")}</p>
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
                  <p className="text-sm text-gray-500 mb-1">{t("filter.out")}</p>
                  <p className="text-2xl font-semibold text-red-600">{outOfStockItems}</p>
                </div>
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Search & Filters */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder={t("filter.search")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 rounded-xl"
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48 border-gray-200 rounded-xl">
                  <Filter className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Sort by Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  <SelectItem value="in-stock">{t("filter.in")}</SelectItem>
                  <SelectItem value="low-stock">{t("filter.low")}</SelectItem>
                  <SelectItem value="out-of-stock">{t("filter.out")}</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                    variant={productOriginFilter === "my" ? "default" : "outline"}
                    className="rounded-xl border-gray-200"
                    onClick={() => setProductOriginFilter("my")}
                >
                    {t("filter.my")}
                </Button>
                <Button
                    variant={productOriginFilter === "imported" ? "default" : "outline"}
                    className="rounded-xl border-gray-200"
                    onClick={() => setProductOriginFilter("imported")}
                >
                    {t("filter.imported")}
                </Button>
                <Button
                    variant={productOriginFilter === "all" ? "default" : "outline"}
                    className="rounded-xl border-gray-200"
                    onClick={() => setProductOriginFilter("all")}
                    >
                    {t("filter.all")}
                    </Button>
                </div>
        </div>
          </CardContent>
        </Card>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const stockLevel = getStockLevel(item.quantity, item.minStock)
            const statusInfo = getStatusInfo(item)

            return (
              <Card
                key={item.id}
                className="group border border-gray-200 shadow-sm hover:shadow-md"
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
                        <DropdownMenuItem onClick={() => openEditModal(item)}>
                          <Edit className="mr-2 h-4 w-4" />
                          {t("action.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openRestockModal(item)}>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {t("action.restock")}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteProduct(item.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("action.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                    </div>

                    {/* Stock Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{t("header.title")}</span>
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

                    {/* Price  */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-xl font-semibold text-gray-900"> {item.currency} {item.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Min: {item.minStock}</p>
                        <p className="text-xs text-gray-400">{item.supplier}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-xl border-gray-200 bg-transparent"
                        onClick={() => openEditModal(item)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        {t("action.edit")}
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-gray-900 hover:bg-gray-800 rounded-xl"
                        onClick={() => openRestockModal(item)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        {t("action.restock")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t("empty.title")}</h3>
              <p className="text-gray-500 mb-6">{t("empty.description")}</p>
              <Button
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("header.add")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-sm w-full sm:w-[400px] rounded-xl p-4">
          <DialogHeader>
            <DialogTitle>{t("modal.editTitle")}</DialogTitle>
            <DialogDescription>{t("modal.editDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="edit-name">{t("form.name")} </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-xl text-sm h-9"
              />
            </div>
            <div>
              <Label htmlFor="edit-myproduct">{t("form.myproduct")}</Label>
              <Switch
                id="edit-myproduct"
                checked={formData.myproduct}
                onCheckedChange={(checked) => setFormData({ ...formData, myproduct: checked })}
                />
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="edit-quantity">{t("form.quantity")}</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="rounded-xl text-sm h-9"
                />
              </div>
              <div>
                <Label htmlFor="edit-minStock">{t("form.minStock")}</Label>
                <Input
                  id="edit-minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  className="rounded-xl text-sm h-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-price">{t("form.price")}</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="rounded-xl text-sm h-9"
              />
            </div>
            <div>
                <Label htmlFor="currency">{t("form.currency")}</Label>
                <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                    <SelectTrigger className="rounded-xl text-sm h-9">
                    <SelectValue placeholder={t("form.placeholderCurrency")} />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="EUR">€ Euro</SelectItem>
                    <SelectItem value="USD">$ US Dollar</SelectItem>
                    <SelectItem value="TND">DT Tunisian Dinar</SelectItem>
                    </SelectContent>
                </Select>
                </div>

            {!formData.myproduct && (
                <div>
                    <Label htmlFor="supplier">{t("form.supplier")}</Label>
                    <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="rounded-xl text-sm h-9"
                    />
                </div>
                )}
            <div>
              <Label htmlFor="edit-description">{t("form.description")}</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="rounded-xl text-sm"
                rows={1}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 rounded-xl text-sm h-8"
              >
                {t("form.cancel")}
              </Button>
              <Button
                onClick={handleEditProduct}
                className="flex-1 bg-gray-900 hover:bg-gray-800 rounded-xl text-sm h-8"
              >
                {t("form.submitAdd")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={isRestockModalOpen} onOpenChange={setIsRestockModalOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("restock.title")}</DialogTitle>
            <DialogDescription>{t("restock.description")} {restockingItem?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="restock-quantity">{t("restock.quantity")}</Label>
              <Input
                id="restock-quantity"
                type="number"
                min="1"
                value={restockQuantity}
                onChange={(e) => setRestockQuantity(e.target.value)}
                className="rounded-xl"
                placeholder="Enter quantity"
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600">
                {t("restock.current")}: <span className="font-medium">{restockingItem?.quantity} units</span>
              </p>
              <p className="text-sm text-gray-600">
                {t("restock.after")}:{" "}
                <span className="font-medium">
                  {(restockingItem?.quantity || 0) + (Number.parseInt(restockQuantity) || 0)} units
                </span>
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsRestockModalOpen(false)} className="flex-1 rounded-xl">
                {t("form.cancel")}
              </Button>
              <Button onClick={handleRestock} className="flex-1 bg-gray-900 hover:bg-gray-800 rounded-xl">
                {t("action.add")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
