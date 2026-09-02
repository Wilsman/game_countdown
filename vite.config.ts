import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { loadEnv, type Plugin, type ViteDevServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

import { onRequestGet } from './functions/api/igdb/releases'

function readDevVars(): Record<string, string> {
  const filePaths = [
    resolve(process.cwd(), '..', 'TwitchCultistBot', '.env'),
    resolve(process.cwd(), '.dev.vars'),
  ]
  const values: Record<string, string> = {}

  for (const filePath of filePaths) {
    try {
      Object.assign(
        values,
        Object.fromEntries(
        readFileSync(filePath, 'utf8')
          .split(/\r?\n/)
          .map((line) => line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/))
          .filter((match): match is RegExpMatchArray => Boolean(match))
          .map((match) => {
            const value = match[2].replace(/^['"]|['"]$/g, '')
            return [match[1], value]
          }),
        ),
      )
    } catch {
      continue
    }
  }

  return values
}

function igdbDevApi(mode: string): Plugin {
  return {
    name: 'igdb-dev-api',
    configureServer(server: ViteDevServer) {
      const viteEnv = loadEnv(mode, process.cwd(), '')
      const devVars = readDevVars()
      const env = {
        TWITCH_CLIENT_ID:
          devVars.TWITCH_CLIENT_ID ?? viteEnv.TWITCH_CLIENT_ID ?? process.env.TWITCH_CLIENT_ID,
        TWITCH_CLIENT_SECRET:
          devVars.TWITCH_CLIENT_SECRET ?? viteEnv.TWITCH_CLIENT_SECRET ?? process.env.TWITCH_CLIENT_SECRET,
      }

      server.middlewares.use(async (request, response, next) => {
        if (request.method !== 'GET' || !request.url?.startsWith('/api/igdb/releases')) {
          next()
          return
        }

        try {
          const apiResponse = await onRequestGet({
            request: new Request(`http://localhost${request.url}`),
            env,
          })
          apiResponse.headers.forEach((value, key) => response.setHeader(key, value))
          response.statusCode = apiResponse.status
          response.end(await apiResponse.text())
        } catch (error) {
          response.statusCode = 500
          response.setHeader('Content-Type', 'application/json; charset=utf-8')
          response.end(JSON.stringify({ error: 'Local IGDB proxy failed' }))
          console.error('Local IGDB proxy failed:', error)
        }
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    igdbDevApi(process.env.NODE_ENV ?? 'development'),
    vue(),
    vueJsx()
  ],
  server: {
    watch: {
      usePolling: true
    }
  }
})
