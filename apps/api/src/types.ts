import { Toucan } from 'toucan-js'
import { Transaction } from '@sentry/types'

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
	tx: Transaction
}

/** Top-level Hono app */
export type App = {
	Bindings: Bindings
	Variables: Variables
}

export type CounterAction = 'new' | 'get' | 'inc'
