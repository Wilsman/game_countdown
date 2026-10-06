import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { createServer, loadEnv, type Plugin, type ViteDevServer } from 'vite'
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

// Must match LIVE_COUNTDOWNS_PATH in src/lib/liveCountdowns.ts.
const LIVE_COUNTDOWNS_FILE = 'countdowns.json'

// App modules are loaded through Vite at runtime rather than imported here, so
// they stay out of the tsconfig.node.json project.
async function renderLiveCountdowns(
  loadModule: (url: string) => Promise<Record<string, any>>,
): Promise<string> {
  const data = await loadModule('/src/data/default-games.ts')
  const feed = await loadModule('/src/lib/liveCountdowns.ts')
  return JSON.stringify(feed.serializeDefaultGames(data.createDefaultGameBases('UTC')))
}

// Publishes the built-in countdowns as /countdowns.json so open pages and OBS
// overlays can pick up edits after a deploy without reloading.
function liveCountdowns(): Plugin {
  return {
    name: 'live-countdowns',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (request, response, next) => {
        if (request.method !== 'GET' || request.url?.split('?')[0] !== `/${LIVE_COUNTDOWNS_FILE}`) {
          next()
          return
        }

        try {
          // Loaded per request so edits to the data file show up immediately.
          const source = await renderLiveCountdowns((url) => server.ssrLoadModule(url))
          response.setHeader('Content-Type', 'application/json; charset=utf-8')
          response.setHeader('Cache-Control', 'no-cache')
          response.end(source)
        } catch (error) {
          next(error)
        }
      })
    },
    async generateBundle() {
      const loader = await createServer({
        configFile: false,
        logLevel: 'error',
        appType: 'custom',
        optimizeDeps: { noDiscovery: true, include: [] },
        server: { middlewareMode: true, hmr: false, watch: null },
      })

      try {
        this.emitFile({
          type: 'asset',
          fileName: LIVE_COUNTDOWNS_FILE,
          source: await renderLiveCountdowns((url) => loader.ssrLoadModule(url)),
        })
      } finally {
        await loader.close()
      }
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    igdbDevApi(process.env.NODE_ENV ?? 'development'),
    liveCountdowns(),
    vue(),
    vueJsx()
  ],
  server: {
    watch: {
      usePolling: true
    }
  }
})
