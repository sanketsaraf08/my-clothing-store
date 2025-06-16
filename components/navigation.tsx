"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ShoppingCart, Package, Settings, Scan, Receipt, BarChart3, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { cn } from "@/lib/utils"

export default function Navigation() {
  const pathname = usePathname()
  const { state } = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Store", icon: Package },
    { href: "/scanner", label: "Scanner", icon: Scan },
    { href: "/cart", label: "Cart", icon: ShoppingCart },
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/admin", label: "Admin", icon: Settings },
    { href: "/bills", label: "Bills", icon: Receipt },
  ]

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg border-b border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center shadow-md">
                <span className="text-orange-600 text-sm sm:text-lg">🕉️</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold text-white">Moraya Fashion</span>
                <span className="text-xs text-blue-100 hidden sm:block">Ganpati Bappa Morya</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
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

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <Button variant="ghost" size="sm" onClick={toggleMobileMenu} className="text-white hover:bg-blue-500">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-blue-700 rounded-b-lg">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start relative text-white hover:bg-blue-600",
                        isActive && "bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700",
                      )}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {item.label}
                      {item.label === "Cart" && state.items.length > 0 && (
                        <Badge
                          variant="destructive"
                          className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs"
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
        )}
      </div>
    </nav>
  )
}
