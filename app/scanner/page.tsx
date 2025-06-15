import Navigation from "@/components/navigation"
import USBBarcodeScanner from "@/components/usb-barcode-scanner"

export default function ScannerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Professional Barcode Scanner</h1>
          <p className="text-blue-700">High-speed USB scanner integration with real-time product lookup</p>
        </div>

        <USBBarcodeScanner />
      </div>
    </div>
  )
}
