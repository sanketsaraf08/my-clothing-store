"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Bug, Database, RefreshCw, Trash2, Download, Upload } from "lucide-react"
import { db } from "@/lib/database"
import { toast } from "@/hooks/use-toast"

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refreshDebugInfo = async () => {
    try {
      setIsLoading(true)
      const info = db.getDebugInfo()
      const productList = await db.getProducts()

      setDebugInfo(info)
      setProducts(productList)

      console.log("🔍 Debug Info:", info)
      console.log("📦 Products:", productList)
    } catch (error) {
      console.error("❌ Error getting debug info:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      refreshDebugInfo()
    }
  }, [isOpen])

  const handleClearData = () => {
    if (confirm("⚠️ This will delete ALL products and bills. Are you sure?")) {
      try {
        db.clearAllData()
        refreshDebugInfo()
        toast({
          title: "Data Cleared",
          description: "All data has been cleared from localStorage",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to clear data",
          variant: "destructive",
        })
      }
    }
  }

  const handleReloadDemo = () => {
    try {
      db.reloadDemoProducts()
      refreshDebugInfo()
      toast({
        title: "Demo Reloaded",
        description: "Demo products have been reloaded",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reload demo products",
        variant: "destructive",
      })
    }
  }

  const handleTestCreate = async () => {
    try {
      setIsLoading(true)
      const testProduct = {
        name: `Test Product ${Date.now()}`,
        barcode: db.generateBarcode(),
        price: 999,
        quantity: 10,
        soldQuantity: 0,
        category: "shirts" as const,
        image: undefined,
      }

      console.log("🧪 Creating test product:", testProduct)
      const created = await db.createProduct(testProduct)
      console.log("✅ Test product created:", created)

      await refreshDebugInfo()

      toast({
        title: "Test Product Created",
        description: `Created: ${created.name}`,
      })
    } catch (error) {
      console.error("❌ Test creation failed:", error)
      toast({
        title: "Test Failed",
        description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = () => {
    try {
      const data = {
        products: products,
        debugInfo: debugInfo,
        timestamp: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `moraya-fashion-debug-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: "Data Exported",
        description: "Debug data has been downloaded",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 bg-red-500 text-white hover:bg-red-600 z-50"
        >
          <Bug className="h-4 w-4 mr-2" />
          Debug
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Database Debug Panel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Control Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button onClick={refreshDebugInfo} disabled={isLoading} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={handleTestCreate} disabled={isLoading} size="sm" variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Test Create
            </Button>
            <Button onClick={handleReloadDemo} size="sm" variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Reload Demo
            </Button>
            <Button onClick={exportData} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button onClick={handleClearData} size="sm" variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>

          {/* Debug Information */}
          {debugInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Database Configuration</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Supabase:</span>
                        <Badge variant={debugInfo.supabaseConfigured ? "default" : "secondary"}>
                          {debugInfo.supabaseConfigured ? "Configured" : "Not Configured"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>localStorage:</span>
                        <Badge variant={debugInfo.localStorage.isAvailable ? "default" : "destructive"}>
                          {debugInfo.localStorage.isAvailable ? "Available" : "Not Available"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Data Status</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Products:</span>
                        <Badge variant="outline">{debugInfo.localStorage.productsCount}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Bills:</span>
                        <Badge variant="outline">{debugInfo.localStorage.billsCount}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Demo Loaded:</span>
                        <Badge variant={debugInfo.localStorage.demoLoaded ? "default" : "secondary"}>
                          {debugInfo.localStorage.demoLoaded ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Storage Used:</span>
                        <Badge variant="outline">{debugInfo.localStorage.storageUsed}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Products List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Products ({products.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No products found. Try reloading demo products.</div>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {products.map((product, index) => (
                      <div key={product.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{product.name}</span>
                          <span className="text-sm text-gray-500 ml-2">({product.barcode})</span>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">₹{product.price}</Badge>
                          <Badge variant="outline">Qty: {product.quantity}</Badge>
                          <Badge variant="outline">{product.category}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Environment Check</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>NEXT_PUBLIC_SUPABASE_URL:</span>
                  <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_URL ? "default" : "destructive"}>
                    {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not Set"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                  <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "default" : "destructive"}>
                    {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not Set"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Console Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  1. <strong>Check Console:</strong> Open browser DevTools → Console tab for detailed logs
                </p>
                <p>
                  2. <strong>Test Create:</strong> Click "Test Create" to verify product creation works
                </p>
                <p>
                  3. <strong>Reload Demo:</strong> Click "Reload Demo" to load sample products
                </p>
                <p>
                  4. <strong>Export Data:</strong> Download current data for analysis
                </p>
                <p>
                  5. <strong>Clear All:</strong> Reset everything if needed
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
