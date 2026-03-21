import 'dotenv/config'
import { env } from './lib/env'
import { app } from './app'

process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason)
  process.exit(1)
})

const PORT = Number(env.PORT)

app.listen(PORT, () => {
  console.info(`Server running on port ${PORT}`)
  console.info(`NODE_ENV: ${process.env.NODE_ENV}`)
  console.info(`DATABASE_URL set: ${Boolean(process.env.DATABASE_URL)}`)
  console.info(`FRONTEND_URL: ${process.env.FRONTEND_URL}`)
})
