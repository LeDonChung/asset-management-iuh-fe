/**
 * Validate required environment variables
 */
const requiredEnvVars = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
} as const

// Validate in development
if (process.env.NODE_ENV === 'development') {
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) {
      console.warn(`⚠️  Missing environment variable: ${key}`)
    }
  })
}

export const env = {
  API_URL: requiredEnvVars.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const

export default env
