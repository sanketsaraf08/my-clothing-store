"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Camera, Keyboard, Scan, Usb, Zap, Settings, AlertTriangle, CheckCircle } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useBarcodeScanner } from "@/hooks/use-barcode-scanner"
import type { Product } from "@/lib/types"
import { toast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"

export default function USBBarcodeScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [manualBarcode, setManualBarcode] = useState("")
  const [scanMode, setScanMode] = useState<"usb" | "camera" | "manual">("usb")
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string>("")
  const [scanHistory, setScanHistory] = useState<Array<{ barcode: string; timestamp: Date; success: boolean }>>([])
  const [usbScannerEnabled, setUsbScannerEnabled] = useState(true)
  const [usbSupported, setUsbSupported] = useState<boolean | null>(null)
  const [scannerSettings, setScannerSettings] = useState({
    minLength: 8,
    maxLength: 20,
    timeout: 100,
    autoAdd: true,
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const { dispatch } = useCart()

  // Check USB support on component mount
  useEffect(() => {
    const checkUSBSupport = () => {
      try {
        if (typeof window === "undefined") {
          setUsbSupported(false)
          return
        }

        // Check if we're in a secure context
        if (!window.isSecureContext) {
          setUsbSupported(false)
          return
        }

        // Check if USB API is available (but don't call getDevices)
        setUsbSupported(!!navigator.usb)
      } catch (error) {
        setUsbSupported(false)
      }
    }

    checkUSBSupport()
  }, [])

  const handleBarcodeScan = async (barcode: string) => {
    setLastScannedBarcode(barcode)

    try {
      const response = await fetch(`/api/products/barcode/${barcode}`)
      if (response.ok) {
        const product: Product = await response.json()

        // Check if product is in stock
        if (product.quantity > 0) {
          if (scannerSettings.autoAdd) {
            dispatch({ type: "ADD_ITEM", payload: product })
          }

          toast({
            title: "✅ Product Found",
            description: `${product.name} - ${formatCurrency(product.price)}${scannerSettings.autoAdd ? " (Added to cart)" : ""}`,
          })

          // Add to scan history
          setScanHistory((prev) => [
            { barcode, timestamp: new Date(), success: true },
            ...prev.slice(0, 9), // Keep last 10 scans
          ])

          // Play success sound
          playSound("success")
        } else {
          toast({
            title: "⚠️ Out of Stock",
            description: `${product.name} is currently out of stock`,
            variant: "destructive",
          })

          setScanHistory((prev) => [{ barcode, timestamp: new Date(), success: false }, ...prev.slice(0, 9)])

          playSound("error")
        }
      } else {
        toast({
          title: "❌ Product Not Found",
          description: `No product found with barcode: ${barcode}`,
          variant: "destructive",
        })

        setScanHistory((prev) => [{ barcode, timestamp: new Date(), success: false }, ...prev.slice(0, 9)])

        playSound("error")
      }
    } catch (error) {
      toast({
        title: "🔌 Scanner Error",
        description: "Failed to process barcode scan",
        variant: "destructive",
      })
      playSound("error")
    }
  }

  const handleScanError = (error: string) => {
    toast({
      title: "Scanner Error",
      description: error,
      variant: "destructive",
    })
    playSound("error")
  }

  // USB Barcode Scanner Hook
  const {
    isScanning: usbScanning,
    currentBuffer,
    resetBuffer,
  } = useBarcodeScanner({
    onScan: handleBarcodeScan,
    onError: handleScanError,
    minLength: scannerSettings.minLength,
    maxLength: scannerSettings.maxLength,
    timeout: scannerSettings.timeout,
    preventDefault: usbScannerEnabled,
    stopPropagation: usbScannerEnabled,
    captureKeys: usbScannerEnabled && scanMode === "usb",
  })

  const playSound = (type: "success" | "error") => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      if (type === "success") {
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1)
      } else {
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.1)
      }

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch (error) {
      // Silently fail if audio context is not available
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsScanning(true)
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please use USB scanner or manual input.",
        variant: "destructive",
      })
      setScanMode("usb")
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }

  const handleManualScan = () => {
    if (manualBarcode.trim()) {
      handleBarcodeScan(manualBarcode.trim())
      setManualBarcode("")
    }
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* USB Support Warning */}
      {usbSupported === false && (
        <Card className="border-yellow-200 shadow-lg bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">USB Scanner Limited</p>
                <p className="text-sm text-yellow-700">
                  USB device detection requires HTTPS. Scanner will still work via keyboard input.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scanner Mode Selection */}
      <Card className="border-blue-200 shadow-lg">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Scan className="h-5 w-5" />
            Barcode Scanner
            {usbSupported && (
              <Badge variant="outline" className="ml-2">
                <CheckCircle className="h-3 w-3 mr-1" />
                USB Ready
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={scanMode === "usb" ? "default" : "outline"}
              onClick={() => setScanMode("usb")}
              className="flex-1"
            >
              <Usb className="h-4 w-4 mr-2" />
              USB Scanner
            </Button>
            <Button
              variant={scanMode === "camera" ? "default" : "outline"}
              onClick={() => setScanMode("camera")}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              Camera
            </Button>
            <Button
              variant={scanMode === "manual" ? "default" : "outline"}
              onClick={() => setScanMode("manual")}
              className="flex-1"
            >
              <Keyboard className="h-4 w-4 mr-2" />
              Manual
            </Button>
          </div>

          {/* USB Scanner Mode */}
          {scanMode === "usb" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${usbScanning ? "bg-green-500 animate-pulse" : "bg-gray-300"}`}
                  />
                  <div>
                    <p className="font-medium text-blue-900">USB Scanner Status</p>
                    <p className="text-sm text-blue-600">{usbScanning ? "🔍 Scanning..." : "⚡ Ready to scan"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="usb-enabled" className="text-sm">
                    Enable USB
                  </Label>
                  <Switch id="usb-enabled" checked={usbScannerEnabled} onCheckedChange={setUsbScannerEnabled} />
                </div>
              </div>

              {currentBuffer && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <Zap className="h-4 w-4 inline mr-1" />
                    Scanning: <span className="font-mono">{currentBuffer}</span>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Auto-add to cart</Label>
                  <Switch
                    checked={scannerSettings.autoAdd}
                    onCheckedChange={(checked) => setScannerSettings((prev) => ({ ...prev, autoAdd: checked }))}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Scanner timeout (ms)</Label>
                  <Input
                    type="number"
                    value={scannerSettings.timeout}
                    onChange={(e) => setScannerSettings((prev) => ({ ...prev, timeout: Number(e.target.value) }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="text-center p-6 border-2 border-dashed border-blue-200 rounded-lg">
                <Usb className="h-12 w-12 mx-auto text-blue-400 mb-2" />
                <p className="text-blue-600 font-medium">USB Scanner Ready</p>
                <p className="text-sm text-blue-500 mt-1">Simply scan any barcode with your USB scanner</p>
                {lastScannedBarcode && (
                  <div className="mt-3 p-2 bg-blue-100 rounded">
                    <p className="text-xs text-blue-600">Last scanned:</p>
                    <p className="font-mono text-sm text-blue-800">{lastScannedBarcode}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Camera Mode */}
          {scanMode === "camera" && (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 bg-gray-100 rounded-lg object-cover"
                />
                {!isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <Camera className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">Camera not active</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={startCamera} disabled={isScanning} className="flex-1">
                  Start Camera
                </Button>
                <Button onClick={stopCamera} disabled={!isScanning} variant="outline" className="flex-1">
                  Stop Camera
                </Button>
              </div>
              <p className="text-sm text-gray-500 text-center">Position the barcode within the camera view</p>
            </div>
          )}

          {/* Manual Mode */}
          {scanMode === "manual" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter barcode manually"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleManualScan()}
                />
                <Button onClick={handleManualScan}>
                  <Scan className="h-4 w-4 mr-2" />
                  Scan
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Try scanning: 1000000001, 1000000002, 1000000003, or any product barcode
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-900">Recent Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scanHistory.map((scan, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    scan.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${scan.success ? "bg-green-500" : "bg-red-500"}`} />
                    <span className="font-mono text-sm">{scan.barcode}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={scan.success ? "default" : "destructive"}>
                      {scan.success ? "✅ Found" : "❌ Not Found"}
                    </Badge>
                    <span className="text-xs text-gray-500">{scan.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scanner Instructions */}
      <Card className="border-blue-200 shadow-lg">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Settings className="h-5 w-5" />
            Scanner Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Usb className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <h3 className="font-medium text-blue-900">USB Scanner</h3>
              <p className="text-sm text-blue-600 mt-1">
                Connect any USB barcode scanner. Works as keyboard input device.
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Zap className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <h3 className="font-medium text-green-900">Fast Scanning</h3>
              <p className="text-sm text-green-600 mt-1">
                USB scanners can scan multiple items per second with audio feedback.
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Settings className="h-8 w-8 mx-auto text-purple-500 mb-2" />
              <h3 className="font-medium text-purple-900">Auto Settings</h3>
              <p className="text-sm text-purple-600 mt-1">
                Automatically detects scanner input and adds items to cart.
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">💡 Pro Tips:</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Most USB barcode scanners work plug-and-play</li>
              <li>• Scanner input is automatically detected by rapid key presses</li>
              <li>• Enable "Auto-add to cart" for fastest checkout experience</li>
              <li>• Audio feedback confirms successful/failed scans</li>
              <li>• Scan history shows last 10 scanned items</li>
              <li>• HTTPS required for full USB device detection</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
