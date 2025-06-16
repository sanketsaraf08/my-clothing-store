"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Bug,
  Database,
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  HardDrive,
  Globe,
  Package,
  Search,
} from "lucide-react"
import { db } from "@/lib/database-new"
import { toast } from "@/hooks/use-toast"

export default function SystemDiagnostics() {
  const [isOpen, setIsOpen] = useState(false)
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])

  const runDiagnostics = async () => {
    setIsRunning(true)
    setTestResults([])

    console.log("🔍 STARTING SYSTEM DIAGNOSTICS...")

    const results: any[] = []

    // Test 1: Browser Environment
    results.push({
      test: "Browser Environment",
      status: typeof window !== "undefined" ? "pass" : "fail",
      details: typeof window !== "undefined" ? "Browser environment detected" : "Server-side rendering",
      icon: Globe,
    })

    // Test 2: Storage Availability
    const storageTest = { localStorage: false, sessionStorage: false }
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("__test__", "test")
        localStorage.removeItem("__test__")
        storageTest.localStorage = true
      }
    } catch (e) {
      // Storage not available
    }

    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("__test__", "test")
        sessionStorage.removeItem("__test__")
        storageTest.sessionStorage = true
      }
    } catch (e) {
      // Storage not available
    }

    results.push({
      test: "Storage Availability",
      status: storageTest.localStorage || storageTest.sessionStorage ? "pass" : "fail",
      details: `localStorage: ${storageTest.localStorage ? "✅" : "❌"}, sessionStorage: ${storageTest.sessionStorage ? "✅" : "❌"}`,
      icon: HardDrive,
    })

    // Test 3: Database Initialization
    try {
      await db.initialize()
      results.push({
        test: "Database Initialization",
        status: "pass",
        details: "Database service initialized successfully",
        icon: Database,
      })
    } catch (error) {
      results.push({
        test: "Database Initialization",
        status: "fail",
        details: `Failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        icon: Database,
      })
    }

    // Test 4: Product Loading
    try {
      const products = await db.getProducts()
      results.push({
        test: "Product Loading",
        status: products.length > 0 ? "pass" : "warning",
        details: `Loaded ${products.length} products`,
        icon: Package,
      })
    } catch (error) {
      results.push({
        test: "Product Loading",
        status: "fail",
        details: `Failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        icon: Package,
      })
    }

    // Test 5: Product Creation
    try {
      const testProduct = {
        name: `Diagnostic Test Product ${Date.now()}`,
        barcode: `TEST${Date.now()}`,
        price: 999,
        quantity: 1,
        soldQuantity: 0,
        category: "shirts" as const,
      }

      const created = await db.createProduct(testProduct)

      // Verify it was created
      const products = await db.getProducts()
      const found = products.find((p) => p.id === created.id)

      if (found) {
        results.push({
          test: "Product Creation",
          status: "pass",
          details: `Successfully created and verified product: ${created.name}`,
          icon: Zap,
        })

        // Clean up test product
        await db.deleteProduct(created.id)
      } else {
        results.push({
          test: "Product Creation",
          status: "fail",
          details: "Product was created but not found in subsequent fetch",
          icon: Zap,
        })
      }
    } catch (error) {
      results.push({
        test: "Product Creation",
        status: "fail",
        details: `Failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        icon: Zap,
      })
    }

    // Test 6: Barcode Lookup
    try {
      const products = await db.getProducts()
      if (products.length > 0) {
        const testBarcode = products[0].barcode
        const found = await db.getProductByBarcode(testBarcode)

        results.push({
          test: "Barcode Lookup",
          status: found ? "pass" : "fail",
          details: found
            ? `Successfully found product by barcode: ${testBarcode}`
            : `Failed to find product by barcode: ${testBarcode}`,
          icon: Search,
        })
      } else {
        results.push({
          test: "Barcode Lookup",
          status: "warning",
          details: "No products available to test barcode lookup",
          icon: Search,
        })
      }
    } catch (error) {
      results.push({
        test: "Barcode Lookup",
        status: "fail",
        details: `Failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        icon: Search,
      })
    }

    // Get debug info
    const debugInfo = db.getDebugInfo()

    setTestResults(results)
    setDiagnostics(debugInfo)
    setIsRunning(false)

    console.log("✅ DIAGNOSTICS COMPLETE:", results)
  }

  const fixIssues = async () => {
    try {
      console.log("🔧 ATTEMPTING TO FIX ISSUES...")

      // Clear all data and reload
      db.clearAllData()
      await new Promise((resolve) => setTimeout(resolve, 100)) // Small delay

      // Reload demo products
      db.reloadDemoProducts()
      await new Promise((resolve) => setTimeout(resolve, 100)) // Small delay

      // Re-run diagnostics
      await runDiagnostics()

      toast({
        title: "Fix Attempted",
        description: "System has been reset and demo products reloaded",
      })
    } catch (error) {
      toast({
        title: "Fix Failed",
        description: `Unable to fix issues: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    }
  }

  const exportDiagnostics = () => {
    const data = {
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== "undefined" ? navigator.userAgent : "Unknown",
      testResults,
      diagnostics,
      environment: {
        hasWindow: typeof window !== "undefined",
        hasLocalStorage: typeof window !== "undefined" && !!window.localStorage,
        hasSessionStorage: typeof window !== "undefined" && !!window.sessionStorage,
      },
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `moraya-diagnostics-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Diagnostics Exported",
      description: "Diagnostic report has been downloaded",
    })
  }

  useEffect(() => {
    if (isOpen && !diagnostics) {
      runDiagnostics()
    }
  }, [isOpen])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "fail":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass":
        return "bg-green-50 border-green-200"
      case "fail":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const overallStatus =
    testResults.length > 0
      ? testResults.every((t) => t.status === "pass")
        ? "pass"
        : testResults.some((t) => t.status === "fail")
          ? "fail"
          : "warning"
      : "unknown"

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 left-4 bg-orange-500 text-white hover:bg-orange-600 z-50"
        >
          <Bug className="h-4 w-4 mr-2" />
          Diagnostics
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            System Diagnostics
            {overallStatus !== "unknown" && (
              <Badge
                variant={overallStatus === "pass" ? "default" : overallStatus === "fail" ? "destructive" : "secondary"}
              >
                {overallStatus === "pass"
                  ? "All Tests Passed"
                  : overallStatus === "fail"
                    ? "Issues Detected"
                    : "Warnings Present"}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Control Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button onClick={runDiagnostics} disabled={isRunning} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? "animate-spin" : ""}`} />
              {isRunning ? "Running..." : "Run Diagnostics"}
            </Button>
            <Button onClick={fixIssues} disabled={isRunning} size="sm" variant="outline">
              <Zap className="h-4 w-4 mr-2" />
              Auto Fix
            </Button>
            <Button onClick={exportDiagnostics} disabled={!testResults.length} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>

          {/* Overall Status */}
          {testResults.length > 0 && (
            <Alert className={getStatusColor(overallStatus)}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {overallStatus === "pass" && "✅ All systems are working correctly!"}
                {overallStatus === "fail" && "❌ Critical issues detected. Click 'Auto Fix' to attempt repairs."}
                {overallStatus === "warning" && "⚠️ Some warnings detected. System should still function."}
              </AlertDescription>
            </Alert>
          )}

          {/* Test Results */}
          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testResults.map((result, index) => {
                    const IconComponent = result.icon
                    return (
                      <div key={index} className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}>
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-5 w-5" />
                          {getStatusIcon(result.status)}
                          <div className="flex-1">
                            <h4 className="font-medium">{result.test}</h4>
                            <p className="text-sm text-gray-600">{result.details}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Debug Information */}
          {diagnostics && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Status</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Initialized:</span>
                        <Badge variant={diagnostics.isInitialized ? "default" : "destructive"}>
                          {diagnostics.isInitialized ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Products:</span>
                        <Badge variant="outline">{diagnostics.productsCount}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Bills:</span>
                        <Badge variant="outline">{diagnostics.billsCount}</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Storage</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>localStorage:</span>
                        <Badge variant={diagnostics.storageTest?.localStorage ? "default" : "destructive"}>
                          {diagnostics.storageTest?.localStorage ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>sessionStorage:</span>
                        <Badge variant={diagnostics.storageTest?.sessionStorage ? "default" : "destructive"}>
                          {diagnostics.storageTest?.sessionStorage ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {diagnostics.sampleProducts && diagnostics.sampleProducts.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Sample Products</h4>
                    <div className="space-y-1 text-xs">
                      {diagnostics.sampleProducts.map((product: any, index: number) => (
                        <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                          <span>{product.name}</span>
                          <span className="font-mono">{product.barcode}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Troubleshooting Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-1">🔍 If products aren't showing:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-blue-800">
                    <li>Click "Run Diagnostics" to identify issues</li>
                    <li>Click "Auto Fix" to reset and reload demo products</li>
                    <li>Check browser console for detailed error messages</li>
                    <li>Try refreshing the page</li>
                  </ol>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-1">✅ If all tests pass:</h4>
                  <p className="text-green-800">
                    Your system is working correctly! Products should be visible on all pages.
                  </p>
                </div>

                <div className="p-3 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-1">❌ If tests fail:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-red-800">
                    <li>Try "Auto Fix" first</li>
                    <li>Check if browser storage is disabled</li>
                    <li>Try in incognito/private mode</li>
                    <li>Export diagnostics and contact support</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
