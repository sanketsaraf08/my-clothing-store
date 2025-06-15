// Code 128 Barcode Generator
export class BarcodeGenerator {
  private static readonly CODE128_PATTERNS: { [key: string]: string } = {
    // Code 128 character patterns
    "0": "11011001100",
    "1": "11001101100",
    "2": "11001100110",
    "3": "10010011000",
    "4": "10010001100",
    "5": "10001001100",
    "6": "10011001000",
    "7": "10011000100",
    "8": "10001100100",
    "9": "11001001000",
    START_B: "11010010000",
    STOP: "1100011101011",
  }

  static generateCode128(data: string): string {
    let pattern = this.CODE128_PATTERNS["START_B"]
    let checksum = 104 // Start B value

    // Add data patterns
    for (let i = 0; i < data.length; i++) {
      const char = data[i]
      if (this.CODE128_PATTERNS[char]) {
        pattern += this.CODE128_PATTERNS[char]
        checksum += (i + 1) * this.getCharValue(char)
      }
    }

    // Add checksum
    const checksumChar = String.fromCharCode(checksum % 103)
    if (this.CODE128_PATTERNS[checksumChar]) {
      pattern += this.CODE128_PATTERNS[checksumChar]
    }

    // Add stop pattern
    pattern += this.CODE128_PATTERNS["STOP"]

    return pattern
  }

  private static getCharValue(char: string): number {
    const charCode = char.charCodeAt(0)
    if (charCode >= 48 && charCode <= 57) {
      // 0-9
      return charCode - 48 + 16
    }
    return charCode - 32
  }

  static createBarcodeCanvas(data: string, width = 200, height = 50): HTMLCanvasElement {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("Could not get canvas context")
    }

    // Generate barcode pattern
    const pattern = this.generateCode128(data)
    const barWidth = Math.max(1, Math.floor(width / pattern.length))

    canvas.width = pattern.length * barWidth
    canvas.height = height

    // Fill white background
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw black bars
    ctx.fillStyle = "#000000"
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] === "1") {
        ctx.fillRect(i * barWidth, 0, barWidth, height)
      }
    }

    return canvas
  }

  static generateBarcodeDataURL(data: string, width?: number, height?: number): string {
    const canvas = this.createBarcodeCanvas(data, width, height)
    return canvas.toDataURL("image/png")
  }
}
