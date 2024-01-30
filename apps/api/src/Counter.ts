/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { instrumentDO, ResolveConfigFn } from '@microlabs/otel-cf-workers'
import { Hono, Schema } from 'hono'
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
	value: number | null
	queue: PQueue
	app: Hono<App, Schema, '/'>

	constructor(state: DurableObjectState, bindings: Bindings) {
		this.state = state
		this.bindings = bindings
		this.value = null
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

	newV1() {
		const v1 = new Hono<App>()
			.all(routes.v1.counter.all, async (c, next) => {
				// Load value from storage and set a timeout to save it
				if (this.value === null) {
					const span = c.get('tx').startChild({ op: 'load_value', description: 'Load value from storage' })
					this.value = (await this.state.storage.get('value')) || 0
					span.finish()
				}
				await next()
			})

			.get(routes.v1.counter.get, async (c) => {
				const value = this.value || 0
				return c.json({ value })
			})

			.on(['get', 'post'], routes.v1.counter.inc, async (c) => {
				const existing = this.value || 0

				// Optionally increment by a value
				const amt = c.req.query('amount')
				const amount = amt ? parseInt(amt) : 1

				this.value = existing + amount
				this.save()
				return c.json({ value: this.value })
			})

		return v1
	}

	async save(): Promise<void> {
		if (this.queue.size < 2) {
			this.queue.add(async () => {
				// save value every 4 second to storage
				await scheduler.wait(4000)
				this.state.storage.put('value', this.value)
			})
		}
	}
}

const Counter = instrumentDO(CounterDO, config)

export { Counter }
