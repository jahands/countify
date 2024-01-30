/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { instrumentDO, ResolveConfigFn } from '@microlabs/otel-cf-workers'
import { Context, Hono, Schema } from 'hono'
import { newHono } from './hono'
import { App, Bindings } from './types'
import { addCors } from './cors'
import { routes } from './routes'
import PQueue from 'p-queue'

const config: ResolveConfigFn = (env: Bindings, _trigger) => {
	return {
		exporter: {
			url: 'https://api.axiom.co/v1/traces',
			headers: {
				authorization: `Bearer ${env.AXIOM_API_KEY}`,
				'x-axiom-dataset': 'workers-otel',
			},
		},
		service: {
			name: 'countify-api-do',
			version: env.SENTRY_RELEASE,
		},
	}
}

class CounterDO implements DurableObject {
	state: DurableObjectState
	bindings: Bindings
	queue: PQueue
	app: Hono<App, Schema, '/'>

	constructor(state: DurableObjectState, bindings: Bindings) {
		this.state = state
		this.bindings = bindings
		this.queue = new PQueue({ concurrency: 1, autoStart: true })
		this.app = this.newApp()
	}

	async fetch(request: Request): Promise<Response> {
		return this.app.fetch(request, this.bindings, {
			passThroughOnException: () => {
				return
			},
			waitUntil: this.state.waitUntil.bind(this.state),
		})
	}

	newApp() {
		const app = newHono({ transaction: { op: 'http.server.durable_object' } })
			// Add cors headers to all requests
			.use(addCors)
			.route('/v1', this.newV1())

		return app
	}

	async getValue(c: Context<App>): Promise<number> {
		const span = c.get('tx').startChild({ op: 'load_value', description: 'Load value from storage' })
		const value = (await this.state.storage.get<number>('value')) || 0
		span.finish()
		return value
	}
	setValue(value: number): void {
		this.state.storage.put('value', value)
	}

	newV1() {
		const v1 = new Hono<App>()
			.get(routes.v1.counter.get, async (c) => {
				const value = await this.getValue(c)
				return c.json({ value })
			})

			.on(['get', 'post'], routes.v1.counter.inc, async (c) => {
				const existing = await this.getValue(c)

				// Optionally increment by a value
				const amt = c.req.query('amount')
				const amount = amt ? parseInt(amt) : 1

				const newValue = existing + amount
				this.setValue(newValue)
				return c.json({ value: newValue })
			})

		return v1
	}
}

const Counter = instrumentDO(CounterDO, config)

export { Counter }
