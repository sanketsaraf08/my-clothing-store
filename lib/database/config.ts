// Database configuration and connection management
export const DATABASE_CONFIG = {
  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },

  // Neon Configuration
  neon: {
    connectionString: process.env.DATABASE_URL!,
  },

  // MongoDB Configuration
  mongodb: {
    uri: process.env.MONGODB_URI!,
    dbName: process.env.MONGODB_DB_NAME || "clothing_store",
  },

  // Current database type
  type: (process.env.DATABASE_TYPE as "supabase" | "neon" | "mongodb" | "localStorage") || "localStorage",
}

export type DatabaseType = typeof DATABASE_CONFIG.type
