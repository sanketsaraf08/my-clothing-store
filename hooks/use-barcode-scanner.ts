"use client"

import { useEffect, useCallback, useRef } from "react"

interface BarcodeScannerOptions {
  onScan: (barcode: string) => void
  onError?: (error: string) => void
  minLength?: number
  maxLength?: number
  timeout?: number
  preventDefault?: boolean
  stopPropagation?: boolean
  captureKeys?: boolean
}

export function useBarcodeScanner({
  onScan,
  onError,
  minLength = 8,
  maxLength = 20,
  timeout = 100,
  preventDefault = true,
  stopPropagation = true,
  captureKeys = true,
}: BarcodeScannerOptions) {
  const scannerBuffer = useRef<string>("")
  const scannerTimeout = useRef<NodeJS.Timeout | null>(null)
  const lastKeyTime = useRef<number>(0)
  const isScanning = useRef<boolean>(false)

  const resetBuffer = useCallback(() => {
    scannerBuffer.current = ""
    isScanning.current = false
    if (scannerTimeout.current) {
      clearTimeout(scannerTimeout.current)
      scannerTimeout.current = null
    }
  }, [])

  const processScan = useCallback(() => {
    const barcode = scannerBuffer.current.trim()

    if (barcode.length >= minLength && barcode.length <= maxLength) {
      // Validate barcode format (digits only for most retail barcodes)
      if (/^\d+$/.test(barcode)) {
        onScan(barcode)
      } else {
        onError?.(`Invalid barcode format: ${barcode}`)
      }
    } else if (barcode.length > 0) {
      onError?.(`Barcode length invalid: ${barcode} (${barcode.length} chars)`)
    }

    resetBuffer()
  }, [onScan, onError, minLength, maxLength, resetBuffer])

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Skip if we're in an input field and captureKeys is false
      if (
        !captureKeys &&
        (document.activeElement?.tagName === "INPUT" ||
          document.activeElement?.tagName === "TEXTAREA" ||
          document.activeElement?.getAttribute("contenteditable") === "true")
      ) {
        return
      }

      const currentTime = Date.now()
      const timeDiff = currentTime - lastKeyTime.current

      // Detect if this is likely from a barcode scanner
      // Barcode scanners typically send keys very quickly (< 50ms between keys)
      const isFromScanner = timeDiff < 50 || isScanning.current

      if (event.key === "Enter") {
        if (isScanning.current && scannerBuffer.current.length > 0) {
          if (preventDefault) event.preventDefault()
          if (stopPropagation) event.stopPropagation()
          processScan()
          return
        }
      }

      // Only capture alphanumeric keys and some special characters
      if (/^[a-zA-Z0-9\-_]$/.test(event.key)) {
        // Only process if it's from scanner or we're not in a focused input
        if (isFromScanner || document.activeElement?.tagName === "BODY") {
          if (captureKeys) {
            if (preventDefault) event.preventDefault()
            if (stopPropagation) event.stopPropagation()
          }

          isScanning.current = true
          scannerBuffer.current += event.key
          lastKeyTime.current = currentTime

          // Clear any existing timeout
          if (scannerTimeout.current) {
            clearTimeout(scannerTimeout.current)
          }

          // Set timeout to process scan if no more keys come
          scannerTimeout.current = setTimeout(() => {
            if (scannerBuffer.current.length > 0) {
              processScan()
            }
          }, timeout)
        }
      }
    },
    [preventDefault, stopPropagation, captureKeys, timeout, processScan],
  )

  useEffect(() => {
    // Only add event listener if we're in the browser
    if (typeof window === "undefined") {
      return
    }

    try {
      document.addEventListener("keydown", handleKeyPress)

      return () => {
        document.removeEventListener("keydown", handleKeyPress)
        resetBuffer()
      }
    } catch (error) {
      onError?.("Failed to initialize scanner listener")
      return () => {}
    }
  }, [handleKeyPress, resetBuffer, onError])

  return {
    isScanning: isScanning.current,
    currentBuffer: scannerBuffer.current,
    resetBuffer,
  }
}
