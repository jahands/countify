import { Toucan } from 'toucan-js'
import { Transaction } from '@sentry/types'

/** Workers bindings */
export type Bindings = {
	SENTRY_DSN: string
	SENTRY_RELEASE: string
	AXIOM_API_KEY: string

	CONFIG: KVNamespace
	COUNTER: DurableObjectNamespace
	/** Temp admin token until I implement proper user management */
	ADMIN_TOKEN: string
}

/** Global Hono variables */
export type Variables = {
	sentry: Toucan
	tx: Transaction
}

/** Top-level Hono app */
export type App = {
	Bindings: Bindings
	Variables: Variables
}

export type CounterAction = 'new' | 'get' | 'inc'
