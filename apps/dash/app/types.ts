import type { LoaderArgs } from "@remix-run/cloudflare"

export type Env = {
	ENVIRONMENT: string
}

export type AppLoaderArgs = LoaderArgs & {
  context: Env
}
