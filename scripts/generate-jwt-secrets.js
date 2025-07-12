const crypto = require("crypto")
const fs = require("fs")
const path = require("path")

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString("hex")
}

const jwtSecret = generateSecret()
const jwtRefreshSecret = generateSecret()

const envContent = `# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}

# Supabase Configuration (add your actual values)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
`

const envPath = path.join(process.cwd(), ".env.local")
fs.writeFileSync(envPath, envContent)

console.log("✅ JWT secrets generated and saved to .env.local")
console.log("🔑 JWT_SECRET:", jwtSecret.substring(0, 20) + "...")
console.log("🔑 JWT_REFRESH_SECRET:", jwtRefreshSecret.substring(0, 20) + "...")
console.log("")
console.log("⚠️  Please update your Supabase configuration in .env.local")
console.log("📝 Run the SQL script in scripts/create-supabase-tables.sql in your Supabase SQL editor")
