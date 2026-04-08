import { onRequest as __api_og_ts_onRequest } from "F:\\tmp\\game_countdown\\functions\\api\\og.ts"

export const routes = [
    {
      routePath: "/api/og",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_og_ts_onRequest],
    },
  ]