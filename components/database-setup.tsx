"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database, Server, Cloud, HardDrive, CheckCircle, AlertCircle } from "lucide-react"

export default function DatabaseSetup() {
  const [selectedDb, setSelectedDb] = useState<string>("")
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle")

  const databases = [
    {
      id: "supabase",
      name: "Supabase",
      icon: <Cloud className="h-6 w-6" />,
      description: "PostgreSQL with real-time features",
      pros: ["Real-time updates", "Built-in auth", "Easy setup", "Free tier"],
      setup: "Create account → New project → Copy credentials",
      envVars: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    },
    {
      id: "neon",
      name: "Neon",
      icon: <Server className="h-6 w-6" />,
      description: "Serverless PostgreSQL",
      pros: ["Serverless", "Auto-scaling", "Fast queries", "PostgreSQL compatible"],
      setup: "Create account → New database → Copy connection string",
      envVars: ["DATABASE_URL"],
    },
    {
      id: "mongodb",
      name: "MongoDB",
      icon: <Database className="h-6 w-6" />,
      description: "NoSQL document database",
      pros: ["Flexible schema", "JSON-like documents", "Horizontal scaling", "Atlas cloud"],
      setup: "Create Atlas account → New cluster → Get connection string",
      envVars: ["MONGODB_URI", "MONGODB_DB_NAME"],
    },
    {
      id: "localStorage",
      name: "Local Storage",
      icon: <HardDrive className="h-6 w-6" />,
      description: "Browser-based storage (current)",
      pros: ["No setup required", "Works offline", "Fast access", "No costs"],
      setup: "Already configured - no setup needed",
      envVars: [],
    },
  ]

  const testConnection = async () => {
    setConnectionStatus("testing")

    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        setConnectionStatus("success")
      } else {
        setConnectionStatus("error")
      }
    } catch (error) {
      setConnectionStatus("error")
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Database Setup</h1>
        <p className="text-blue-700">Choose and configure your database backend</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {databases.map((db) => (
          <Card
            key={db.id}
            className={`cursor-pointer transition-all ${
              selectedDb === db.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-lg"
            }`}
            onClick={() => setSelectedDb(db.id)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {db.icon}
                <div>
                  <div className="flex items-center gap-2">
                    {db.name}
                    {db.id === "localStorage" && <Badge variant="secondary">Current</Badge>}
                  </div>
                  <p className="text-sm font-normal text-gray-600">{db.description}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Advantages:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {db.pros.map((pro, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Setup:</h4>
                  <p className="text-sm text-gray-600">{db.setup}</p>
                </div>

                {db.envVars.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Required Environment Variables:</h4>
                    <div className="space-y-1">
                      {db.envVars.map((envVar) => (
                        <code key={envVar} className="text-xs bg-gray-100 px-2 py-1 rounded block">
                          {envVar}
                        </code>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedDb && selectedDb !== "localStorage" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Environment Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Add to your .env.local file:</h4>
              <div className="space-y-2">
                <div>
                  <code className="text-sm bg-gray-800 text-green-400 p-2 rounded block">
                    DATABASE_TYPE={selectedDb}
                  </code>
                </div>
                {databases
                  .find((db) => db.id === selectedDb)
                  ?.envVars.map((envVar) => (
                    <div key={envVar}>
                      <code className="text-sm bg-gray-800 text-green-400 p-2 rounded block">
                        {envVar}=your_value_here
                      </code>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button onClick={testConnection} disabled={connectionStatus === "testing"}>
                {connectionStatus === "testing" ? "Testing..." : "Test Connection"}
              </Button>

              {connectionStatus === "success" && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Connection successful!
                </div>
              )}

              {connectionStatus === "error" && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  Connection failed. Check your configuration.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Migration Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium">Choose Database</h4>
                <p className="text-sm text-gray-600">Select your preferred database from the options above</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium">Set Environment Variables</h4>
                <p className="text-sm text-gray-600">Add the required environment variables to your .env.local file</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium">Run Database Setup</h4>
                <p className="text-sm text-gray-600">Execute the SQL scripts in the scripts folder to create tables</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                4
              </div>
              <div>
                <h4 className="font-medium">Test & Deploy</h4>
                <p className="text-sm text-gray-600">Test the connection and deploy your application</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
