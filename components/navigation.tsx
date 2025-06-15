"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingCart, Package, Settings, Scan, Receipt, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { cn } from "@/lib/utils"
import ScannerStatus from "@/components/scanner-status"

export default function Navigation() {
  const pathname = usePathname()
  const { state } = useCart()

  const navItems = [
    { href: "/", label: "Store", icon: Package },
    { href: "/scanner", label: "Scanner", icon: Scan },
    { href: "/cart", label: "Cart", icon: ShoppingCart },
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/admin", label: "Admin", icon: Settings },
    { href: "/bills", label: "Bills", icon: Receipt },
  ]

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg border-b border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              {/* Lord Ganpati Image */}
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shadow-md">
                <span className="text-orange-600 text-lg">🕉️</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">Moraya Fashion</span>
                <span className="text-xs text-blue-100">Ganpati Bappa Morya</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <ScannerStatus />
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "relative text-white hover:bg-blue-500 hover:text-white",
                      isActive && "bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700",
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                    {item.label === "Cart" && state.items.length > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {state.items.length}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
