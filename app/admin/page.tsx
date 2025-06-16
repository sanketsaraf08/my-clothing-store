"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Package, Printer, RefreshCw, RotateCcw } from "lucide-react"
import type { Product } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { db } from "@/lib/database"
import Navigation from "@/components/navigation"
import BarcodeSticker from "@/components/barcode-sticker"
import DebugPanel from "@/components/debug-panel"

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedProductForSticker, setSelectedProductForSticker] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    category: "shirts" as const,
    image: "",
  })

  useEffect(() => {
    // Initialize database and load products
    initializeAndFetch()

    // Listen for storage changes
    const handleStorageChange = () => {
      console.log("🔄 Storage changed, refreshing products...")
      fetchProducts()
    }

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange)
      return () => window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const initializeAndFetch = async () => {
    try {
      console.log("🚀 Initializing admin panel...")
      await db.initialize()
      await fetchProducts()
    } catch (error) {
      console.error("❌ Error initializing:", error)
    }
  }

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      console.log("📦 Fetching products directly from database...")

      const data = await db.getProducts()
      console.log(`✅ Loaded ${data.length} products`)
      setProducts(data)
    } catch (error) {
      console.error("❌ Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form data
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price",
        variant: "destructive",
      })
      return
    }

    if (!formData.quantity || isNaN(Number(formData.quantity)) || Number(formData.quantity) < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid quantity",
        variant: "destructive",
      })
      return
    }

    const productData = {
      name: formData.name.trim(),
      barcode: editingProduct ? editingProduct.barcode : db.generateBarcode(),
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      category: formData.category,
      image: formData.image.trim() || undefined,
      soldQuantity: editingProduct?.soldQuantity || 0,
    }

    console.log("🔄 Submitting product:", productData)

    try {
      setIsSubmitting(true)

      let result: Product
      if (editingProduct) {
        console.log("✏️ Updating existing product...")
        result = await db.updateProduct(editingProduct.id, productData)
      } else {
        console.log("➕ Creating new product...")
        result = await db.createProduct(productData)
      }

      console.log("✅ Product operation successful:", result)

      toast({
        title: "Success!",
        description: `Product ${editingProduct ? "updated" : "created"} successfully: ${result.name}`,
      })

      // Immediately refresh the products list
      await fetchProducts()
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("❌ Error saving product:", error)
      toast({
        title: "Error",
        description: `Failed to ${editingProduct ? "update" : "create"} product: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (product: Product) => {
    console.log("✏️ Editing product:", product.name)
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      category: product.category as any,
      image: product.image || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!confirm(`Are you sure you want to delete "${product?.name}"?`)) return

    try {
      setIsLoading(true)
      console.log("🗑️ Deleting product:", productId)

      await db.deleteProduct(productId)

      toast({
        title: "Success",
        description: "Product deleted successfully",
      })

      await fetchProducts()
    } catch (error) {
      console.error("❌ Error deleting product:", error)
      toast({
        title: "Error",
        description: `Failed to delete product: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReloadDemo = async () => {
    if (!confirm("This will reload demo products. Continue?")) return

    try {
      setIsLoading(true)
      console.log("🔄 Reloading demo products...")

      db.reloadDemoProducts()
      await fetchProducts()

      toast({
        title: "Success",
        description: "Demo products reloaded successfully",
      })
    } catch (error) {
      console.error("❌ Error reloading demo:", error)
      toast({
        title: "Error",
        description: "Failed to reload demo products",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      quantity: "",
      category: "shirts",
      image: "",
    })
    setEditingProduct(null)
  }

  const categories = ["shirts", "pants", "dresses", "shoes", "accessories"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-blue-900 mb-2">Admin Panel</h1>
              <p className="text-blue-700">Manage your product inventory</p>
            </div>

            <div className="flex gap-2">
              <Button onClick={fetchProducts} variant="outline" disabled={isLoading} className="bg-white">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>

              <Button onClick={handleReloadDemo} variant="outline" disabled={isLoading} className="bg-white">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reload Demo
              </Button>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-blue-900">
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Enter product name"
                      />
                    </div>

                    {editingProduct && (
                      <div>
                        <Label>Barcode (Auto-generated)</Label>
                        <Input value={editingProduct.barcode} disabled className="bg-gray-100" />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="price">Price (₹) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="1"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                        placeholder="Enter price"
                      />
                    </div>

                    <div>
                      <Label htmlFor="quantity">Quantity *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="0"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        required
                        placeholder="Enter quantity"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="image">Product Image URL</Label>
                      <Input
                        id="image"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="Enter image URL (optional)"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : editingProduct ? "Update" : "Create"} Product
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-blue-200 shadow-lg">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Package className="h-5 w-5" />
                  Product Inventory ({products.length}){isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-blue-900 mb-2">No products found</h3>
                    <p className="text-blue-600 mb-4">Add your first product or reload demo products</p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                      <Button onClick={handleReloadDemo} variant="outline">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Load Demo Products
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Barcode</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Sold Qty</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell className="font-mono text-sm">{product.barcode}</TableCell>
                            <TableCell className="capitalize">{product.category}</TableCell>
                            <TableCell>{formatCurrency(product.price)}</TableCell>
                            <TableCell>
                              <span className={product.quantity < 10 ? "text-red-600 font-medium" : ""}>
                                {product.quantity}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-green-600 font-medium">{product.soldQuantity}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedProductForSticker(product)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {selectedProductForSticker && (
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Barcode Sticker Preview</h3>
                <BarcodeSticker product={selectedProductForSticker} />
              </div>
            )}
          </div>
        </div>
      </div>

      <DebugPanel />
    </div>
  )
}
