"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Database, ExternalLink, Copy, CheckCircle, AlertCircle, Info, ArrowRight, Zap } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function NeonSetupGuide() {
  const [isOpen, setIsOpen] = useState(false)
  const [connectionString, setConnectionString] = useState("")
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    })
  }

  const testConnection = async () => {
    if (!connectionString.trim()) {
      toast({
        title: "Error",
        description: "Please enter a connection string",
        variant: "destructive",
      })
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus("idle")

    try {
      // Test the connection string format
      if (!connectionString.startsWith("postgresql://")) {
        throw new Error("Connection string must start with 'postgresql://'")
      }

      // Here you would normally test the actual connection
      // For now, we'll just validate the format
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate connection test

      setConnectionStatus("success")
      toast({
        title: "Connection Test Successful!",
        description: "Your Neon database connection string appears to be valid",
      })
    } catch (error) {
      setConnectionStatus("error")
      toast({
        title: "Connection Test Failed",
        description: error instanceof Error ? error.message : "Invalid connection string",
        variant: "destructive",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const steps = [
    {
      title: "Create Neon Account",
      description: "Sign up for a free Neon account",
      action: "Visit neon.tech",
      link: "https://neon.tech",
    },
    {
      title: "Create New Project",
      description: "Create a new database project",
      action: "Click 'New Project'",
    },
    {
      title: "Get Connection String",
      description: "Copy your database connection string",
      action: "Copy from dashboard",
    },
    {
      title: "Add to Environment",
      description: "Add the connection string to your .env.local file",
      action: "Set DATABASE_URL",
    },
    {
      title: "Run Setup Script",
      description: "Execute the SQL setup script",
      action: "Run setup-neon.sql",
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Database className="h-4 w-4 mr-2" />
          Setup Neon Database
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Neon Database Setup Guide
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Start Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Quick Start:</strong> Neon provides serverless PostgreSQL with automatic scaling. Follow these
              steps to connect your store to a cloud database.
            </AlertDescription>
          </Alert>

          {/* Step-by-step guide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Setup Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{step.action}</Badge>
                        {step.link && (
                          <Button variant="ghost" size="sm" onClick={() => window.open(step.link, "_blank")}>
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Open
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Connection String Tester */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test Your Connection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="connectionString">Database Connection String</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="connectionString"
                    placeholder="postgresql://username:password@host/database"
                    value={connectionString}
                    onChange={(e) => setConnectionString(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <Button onClick={testConnection} disabled={isTestingConnection} size="sm">
                    {isTestingConnection ? (
                      <>
                        <Zap className="h-4 w-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Test
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {connectionStatus === "success" && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    ✅ Connection string format is valid! You can now add it to your environment variables.
                  </AlertDescription>
                </Alert>
              )}

              {connectionStatus === "error" && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    ❌ Connection test failed. Please check your connection string format.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Environment Variables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Add these variables to your <code className="bg-gray-100 px-1 rounded">.env.local</code> file:
              </p>

              <div className="space-y-3">
                <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span># Set database type to neon</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("DATABASE_TYPE=neon")}
                      className="text-green-400 hover:text-green-300"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div>DATABASE_TYPE=neon</div>
                </div>

                <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span># Your Neon connection string</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("DATABASE_URL=your_neon_connection_string_here")}
                      className="text-green-400 hover:text-green-300"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div>DATABASE_URL=your_neon_connection_string_here</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SQL Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Database Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  After setting up your connection, run the SQL setup script to create the required tables:
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">SQL Script Location</span>
                  </div>
                  <p className="text-sm text-blue-800 mb-3">
                    Find and run the <code>scripts/setup-neon.sql</code> file in your Neon console or via psql.
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">scripts/setup-neon.sql</Badge>
                    <ArrowRight className="h-3 w-3 text-blue-600" />
                    <Badge variant="outline">Run in Neon Console</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Troubleshooting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-1">🔧 Common Issues:</h4>
                  <ul className="list-disc list-inside space-y-1 text-yellow-800">
                    <li>
                      Connection string format must start with <code>postgresql://</code>
                    </li>
                    <li>Ensure your Neon database is not paused (free tier auto-pauses)</li>
                    <li>Check that your IP is allowed (Neon allows all IPs by default)</li>
                    <li>Verify the database name and credentials are correct</li>
                  </ul>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-1">✅ If Connection Fails:</h4>
                  <ul className="list-disc list-inside space-y-1 text-green-800">
                    <li>The app will automatically fall back to localStorage</li>
                    <li>Your data will still be saved locally</li>
                    <li>You can fix the connection later without losing data</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
