import { Toucan } from 'toucan-js'

/** Workers bindings */
export type Bindings = {
	SENTRY_DSN: string
	SENTRY_RELEASE: string
}

/** Global Hono variables */
export type Variables = {
	sentry: Toucan
}

/** Top-level Hono app */
export type App = {
	Bindings: Bindings
	Variables: Variables
}
