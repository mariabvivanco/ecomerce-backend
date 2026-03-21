const REQUIRED_VARS = [
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'PAYPAL_CLIENT_ID',
  'PAYPAL_SECRET',
  'FRONTEND_URL',
] as const

type EnvKey = (typeof REQUIRED_VARS)[number]

function validateEnv(): Record<EnvKey, string> {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\nCheck your .env file.`
    )
  }

  return REQUIRED_VARS.reduce(
    (acc, key) => ({ ...acc, [key]: process.env[key] as string }),
    {} as Record<EnvKey, string>
  )
}

export const env = validateEnv()
