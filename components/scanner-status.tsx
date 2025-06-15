"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Usb, Zap, AlertTriangle } from "lucide-react"

export default function ScannerStatus() {
  const [scannerStatus, setScannerStatus] = useState<"unknown" | "ready" | "scanning" | "error">("unknown")
  const [lastScan, setLastScan] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    // Check if we're in a secure context and USB API is available
    const checkUSBSupport = () => {
      try {
        if (typeof window === "undefined") {
          setScannerStatus("unknown")
          return
        }

        // Check if we're in a secure context (HTTPS or localhost)
        if (!window.isSecureContext) {
          setScannerStatus("error")
          setErrorMessage("USB requires HTTPS")
          return
        }

        // Check if USB API is available
        if (!navigator.usb) {
          setScannerStatus("error")
          setErrorMessage("USB not supported")
          return
        }

        // Set status to ready if all checks pass
        setScannerStatus("ready")
      } catch (error) {
        setScannerStatus("error")
        setErrorMessage("USB access denied")
      }
    }

    checkUSBSupport()

    // Listen for keyboard events to detect scanner activity
    let scanBuffer = ""
    let scanTimeout: NodeJS.Timeout | null = null

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only detect if we're not in an input field
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return
      }

      const currentTime = Date.now()

      if (event.key === "Enter") {
        if (scanBuffer.length > 8) {
          setLastScan(scanBuffer)
          setScannerStatus("ready")
          scanBuffer = ""
        }
        return
      }

      // Detect rapid key sequences (likely from scanner)
      if (/^[a-zA-Z0-9]$/.test(event.key)) {
        if (scanBuffer.length === 0) {
          setScannerStatus("scanning")
        }

        scanBuffer += event.key

        // Clear existing timeout
        if (scanTimeout) {
          clearTimeout(scanTimeout)
        }

        // Set timeout to reset buffer
        scanTimeout = setTimeout(() => {
          if (scanBuffer.length > 0) {
            setScannerStatus("ready")
            scanBuffer = ""
          }
        }, 100)
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      if (scanTimeout) {
        clearTimeout(scanTimeout)
      }
    }
  }, [])

  const getStatusDisplay = () => {
    switch (scannerStatus) {
      case "ready":
        return {
          variant: "default" as const,
          className: "bg-green-600 text-white",
          icon: <Usb className="h-3 w-3 mr-1" />,
          text: "Scanner Ready",
        }
      case "scanning":
        return {
          variant: "outline" as const,
          className: "animate-pulse border-blue-500 text-blue-600",
          icon: <Zap className="h-3 w-3 mr-1" />,
          text: "Scanning...",
        }
      case "error":
        return {
          variant: "secondary" as const,
          className: "bg-yellow-500 text-white",
          icon: <AlertTriangle className="h-3 w-3 mr-1" />,
          text: errorMessage || "USB Error",
        }
      default:
        return {
          variant: "secondary" as const,
          className: "bg-gray-500 text-white",
          icon: <Usb className="h-3 w-3 mr-1" />,
          text: "Checking...",
        }
    }
  }

  const status = getStatusDisplay()

  return (
    <div className="flex items-center space-x-2">
      <Badge variant={status.variant} className={status.className}>
        {status.icon}
        {status.text}
      </Badge>
      {lastScan && scannerStatus === "ready" && (
        <Badge variant="outline" className="text-xs">
          Last: {lastScan.slice(-6)}
        </Badge>
      )}
    </div>
  )
}
