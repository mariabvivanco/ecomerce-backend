import 'dotenv/config'
import { env } from './lib/env'
import { app } from './app'

const PORT = Number(env.PORT)

app.listen(PORT, () => {
  console.info(`Server running on port ${PORT}`)
})
