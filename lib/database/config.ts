// Database configuration and connection management
export const DATABASE_CONFIG = {
  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  },

  // Neon Configuration
  neon: {
    connectionString: process.env.DATABASE_URL || "",
  },

  // MongoDB Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || "",
    dbName: process.env.MONGODB_DB_NAME || "clothing_store",
  },

  // Current database type - defaults to localStorage if not set or if connection fails
  type: (process.env.DATABASE_TYPE as "supabase" | "neon" | "mongodb" | "localStorage") || "localStorage",
}

export type DatabaseType = typeof DATABASE_CONFIG.type

// Validation functions
export const validateConfig = () => {
  const issues: string[] = []

  if (DATABASE_CONFIG.type === "neon") {
    if (!DATABASE_CONFIG.neon.connectionString) {
      issues.push("DATABASE_URL is required for Neon")
    } else if (!DATABASE_CONFIG.neon.connectionString.startsWith("postgresql://")) {
      issues.push("DATABASE_URL must be a valid PostgreSQL connection string")
    }
  }

  if (DATABASE_CONFIG.type === "supabase") {
    if (!DATABASE_CONFIG.supabase.url) {
      issues.push("NEXT_PUBLIC_SUPABASE_URL is required for Supabase")
    }
    if (!DATABASE_CONFIG.supabase.anonKey) {
      issues.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is required for Supabase")
    }
  }

  if (DATABASE_CONFIG.type === "mongodb") {
    if (!DATABASE_CONFIG.mongodb.uri) {
      issues.push("MONGODB_URI is required for MongoDB")
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  }
}
