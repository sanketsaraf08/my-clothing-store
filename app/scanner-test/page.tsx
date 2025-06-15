"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Usb, TestTube, Zap, CheckCircle, XCircle } from "lucide-react"
import { useBarcodeScanner } from "@/hooks/use-barcode-scanner"
import Navigation from "@/components/navigation"

export default function ScannerTestPage() {
  const [testResults, setTestResults] = useState<
    Array<{
      test: string
      barcode: string
      timestamp: Date
      success: boolean
    }>
  >([])
  const [isTestMode, setIsTestMode] = useState(false)
  const [testSettings, setTestSettings] = useState({
    minLength: 8,
    maxLength: 20,
    timeout: 100,
  })

  const handleTestScan = (barcode: string) => {
    const testResult = {
      test: `Length: ${barcode.length}, Format: ${/^\d+$/.test(barcode) ? "Numeric" : "Mixed"}`,
      barcode,
      timestamp: new Date(),
      success:
        barcode.length >= testSettings.minLength && barcode.length <= testSettings.maxLength && /^\d+$/.test(barcode),
    }

    setTestResults((prev) => [testResult, ...prev.slice(0, 19)]) // Keep last 20 tests
  }

  const { isScanning, currentBuffer, resetBuffer } = useBarcodeScanner({
    onScan: handleTestScan,
    onError: (error) => {
      setTestResults((prev) => [
        {
          test: "Error",
          barcode: error,
          timestamp: new Date(),
          success: false,
        },
        ...prev.slice(0, 19),
      ])
    },
    minLength: testSettings.minLength,
    maxLength: testSettings.maxLength,
    timeout: testSettings.timeout,
    preventDefault: isTestMode,
    stopPropagation: isTestMode,
    captureKeys: isTestMode,
  })

  const clearTests = () => {
    setTestResults([])
    resetBuffer()
  }

  const testBarcodes = ["1000000001", "1000000002", "1000000003", "123456789012", "9780123456789", "4901234567890"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">USB Scanner Testing</h1>
          <p className="text-blue-700">Test and configure your USB barcode scanner</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Status & Settings */}
          <div className="space-y-6">
            <Card className="border-blue-200 shadow-lg">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Usb className="h-5 w-5" />
                  Scanner Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${isScanning ? "bg-green-500 animate-pulse" : "bg-gray-300"}`}
                    />
                    <div>
                      <p className="font-medium text-blue-900">Scanner Status</p>
                      <p className="text-sm text-blue-600">{isScanning ? "🔍 Active" : "⚡ Ready"}</p>
                    </div>
                  </div>
                  <Badge variant={isScanning ? "default" : "secondary"}>{isScanning ? "Scanning" : "Idle"}</Badge>
                </div>

                {currentBuffer && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <Zap className="h-4 w-4 inline mr-1" />
                      Current Buffer: <span className="font-mono">{currentBuffer}</span>
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label>Test Mode</Label>
                  <Button
                    variant={isTestMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsTestMode(!isTestMode)}
                  >
                    {isTestMode ? "Disable" : "Enable"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 shadow-lg">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-900">Scanner Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Minimum Length</Label>
                  <Input
                    type="number"
                    value={testSettings.minLength}
                    onChange={(e) => setTestSettings((prev) => ({ ...prev, minLength: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Maximum Length</Label>
                  <Input
                    type="number"
                    value={testSettings.maxLength}
                    onChange={(e) => setTestSettings((prev) => ({ ...prev, maxLength: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Timeout (ms)</Label>
                  <Input
                    type="number"
                    value={testSettings.timeout}
                    onChange={(e) => setTestSettings((prev) => ({ ...prev, timeout: Number(e.target.value) }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 shadow-lg">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-900">Test Barcodes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {testBarcodes.map((barcode) => (
                    <Button
                      key={barcode}
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestScan(barcode)}
                      className="font-mono text-xs"
                    >
                      {barcode}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Click these buttons to simulate barcode scans</p>
              </CardContent>
            </Card>
          </div>

          {/* Test Results */}
          <div>
            <Card className="border-blue-200 shadow-lg">
              <CardHeader className="bg-blue-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <TestTube className="h-5 w-5" />
                    Test Results ({testResults.length})
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={clearTests}>
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {testResults.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <TestTube className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No test results yet</p>
                      <p className="text-sm">Scan a barcode or click test buttons</p>
                    </div>
                  ) : (
                    testResults.map((result, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <div>
                            <p className="font-mono text-sm">{result.barcode}</p>
                            <p className="text-xs text-gray-600">{result.test}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={result.success ? "default" : "destructive"}>
                            {result.success ? "✅ Pass" : "❌ Fail"}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{result.timestamp.toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <Card className="border-blue-200 shadow-lg mt-6">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-900">Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-blue-900 mb-2">1. Connect Scanner</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Plug USB barcode scanner into computer</li>
                  <li>• Most scanners work plug-and-play</li>
                  <li>• No drivers needed for HID scanners</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-blue-900 mb-2">2. Test Scanner</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Enable test mode above</li>
                  <li>• Scan any barcode</li>
                  <li>• Check results appear instantly</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-blue-900 mb-2">3. Configure Settings</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Adjust length limits as needed</li>
                  <li>• Set timeout for your scanner speed</li>
                  <li>• Test with your actual products</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
