import { Hono } from 'hono'
import { newHono } from './hono'
import { App, Bindings } from './types'
import { defaultCors } from './cors'
import { routes } from './routes'
import PQueue from 'p-queue'

export class Counter {
	state: DurableObjectState
	bindings: Bindings
	value: number | null
	queue: PQueue
	app: Hono<App, {}, '/'>

	constructor(state: DurableObjectState, bindings: Bindings) {
		this.state = state
		this.bindings = bindings
		this.value = null
		this.queue = new PQueue({ concurrency: 1, autoStart: true })
		this.app = this.newApp()
	}

	async fetch(request: Request) {
		return this.app.fetch(request, this.bindings, {
			passThroughOnException: () => {},
			waitUntil: this.state.waitUntil.bind(this.state),
		})
	}

	newApp(): Hono<App, {}, '/'> {
		const app = newHono()
			// Add cors headers to all requests
			.use(async (c, next) => {
				for (const [k, v] of Object.entries(defaultCors)) {
					c.header(k, v)
				}
				await next()
			})

		const v1 = new Hono<App>()
			.get('/counter', async (c) => {
				const value = (await this.state.storage.get('value')) || 0
				return c.json({ value })
			})
			.put(async (c) => {
				const value = await this.state.storage.get('value')
				const newValue = typeof value === 'number' ? value + 1 : 1
				this.state.storage.put('value', newValue)
				return c.json({ value: newValue })
			})

			// Real endpoints
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

		app.route('/v1', v1)
		return app
	}

	async save() {
		if (this.queue.size < 2) {
			this.queue.add(async () => {
				// save value every 5 second to storage
				await scheduler.wait(5000)
				this.state.storage.put('value', this.value)
			})
		}
	}
}
