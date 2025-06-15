"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database, CheckCircle, AlertCircle, ExternalLink, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SupabaseSetup() {
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const { toast } = useToast()

  const testConnection = async () => {
    setConnectionStatus("testing")

    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        setConnectionStatus("success")
        toast({
          title: "Connection Successful!",
          description: "Supabase database is connected and working.",
        })
      } else {
        setConnectionStatus("error")
        toast({
          title: "Connection Failed",
          description: "Please check your Supabase configuration.",
          variant: "destructive",
        })
      }
    } catch (error) {
      setConnectionStatus("error")
      toast({
        title: "Connection Error",
        description: "Unable to connect to database.",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Environment variable copied to clipboard.",
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2 flex items-center gap-3">
          <Database className="h-8 w-8" />
          Supabase Database Setup
        </h1>
        <p className="text-blue-700">Configure your Moraya Fashion store with Supabase backend</p>
      </div>

      <div className="grid gap-6">
        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Setup Instructions</span>
              <Badge variant="outline">Required</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-2">Create Supabase Account</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Go to Supabase and create a new account if you don't have one.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Supabase
                    </a>
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-2">Create New Project</h4>
                  <p className="text-sm text-gray-600">
                    Create a new project named "Moraya Fashion" and wait for it to be ready.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-2">Run Database Setup</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Go to SQL Editor in your Supabase dashboard and run the setup script.
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-2">Copy and run this script in SQL Editor:</p>
                    <code className="text-xs text-gray-600">scripts/setup-supabase.sql</code>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-2">Get API Credentials</h4>
                  <p className="text-sm text-gray-600">
                    Go to Settings → API and copy your Project URL and anon public key.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Add these environment variables to your <code className="bg-gray-100 px-1 rounded">.env.local</code>{" "}
                file:
              </p>

              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm font-medium">NEXT_PUBLIC_SUPABASE_URL</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("NEXT_PUBLIC_SUPABASE_URL=your_project_url")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="text-xs text-gray-600 block">
                    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
                  </code>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="text-xs text-gray-600 block">NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here</code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Connection */}
        <Card>
          <CardHeader>
            <CardTitle>Test Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button onClick={testConnection} disabled={connectionStatus === "testing"}>
                {connectionStatus === "testing" ? "Testing..." : "Test Database Connection"}
              </Button>

              {connectionStatus === "success" && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Connected successfully!</span>
                </div>
              )}

              {connectionStatus === "error" && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Connection failed</span>
                </div>
              )}
            </div>

            {connectionStatus === "success" && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">🎉 Database Ready!</h4>
                <p className="text-sm text-green-700">
                  Your Moraya Fashion store is now connected to Supabase. You can start adding products and they will be
                  stored in your cloud database.
                </p>
              </div>
            )}

            {connectionStatus === "error" && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Connection Issues</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Check your environment variables are correct</li>
                  <li>• Ensure you've run the SQL setup script</li>
                  <li>• Verify your Supabase project is active</li>
                  <li>• Check browser console for detailed errors</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>What You Get with Supabase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">✅ Real Database</h4>
                <p className="text-sm text-gray-600">PostgreSQL database with ACID transactions</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">✅ Cloud Storage</h4>
                <p className="text-sm text-gray-600">Data persists across sessions and devices</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">✅ Real-time Updates</h4>
                <p className="text-sm text-gray-600">Changes sync instantly across all users</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">✅ Scalable</h4>
                <p className="text-sm text-gray-600">Handles thousands of products and customers</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">✅ Backup & Recovery</h4>
                <p className="text-sm text-gray-600">Automatic backups and point-in-time recovery</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">✅ Free Tier</h4>
                <p className="text-sm text-gray-600">Generous free tier for small businesses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
