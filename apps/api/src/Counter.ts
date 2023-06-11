/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Hono } from 'hono'
import { newHono } from './hono'
import { App, Bindings } from './types'
import { addCors } from './cors'
import { routes } from './routes'
import PQueue from 'p-queue'

export class Counter {
	state: DurableObjectState
	bindings: Bindings
	value: number | null
	queue: PQueue
	app: Hono<App, object, '/'>

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
		const app = newHono()
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
					this.value = (await this.state.storage.get('value')) || 0
				}
				await next()
			})

			.get(routes.v1.counter.get, async (c) => {
				const value = this.value || 0
				return c.json({ value })
			})

			.on(['get', 'post'], routes.v1.counter.inc, async (c) => {
				const existing = this.value || 0
				this.value = existing + 1
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
