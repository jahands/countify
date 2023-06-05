import { Toucan } from 'toucan-js'

/** Workers bindings */
export type Bindings = {
	SENTRY_DSN: string
	SENTRY_RELEASE: string

	CONFIG: KVNamespace
	COUNTER: DurableObjectNamespace
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

/** Counter KV metadata */
export interface CounterMeta {
	/** Version of the meta in case we change it later */
	v: 1
	/** Durable Object ID of the counter. This saves
	 * us from having to do `c.env.COUNTER.idFromName()`
	 */
	id: string
}

export type CounterAction = 'new' | 'get' | 'inc'
