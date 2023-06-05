import { Hono } from 'hono'
import { newHono } from './hono'
import { App, Bindings } from './types'

export class Counter {
	state: DurableObjectState
	bindings: Bindings
	constructor(state: DurableObjectState, bindings: Bindings) {
		this.state = state
		this.bindings = bindings
	}

	async fetch(request: Request) {
		const app = newHono()
		const counter = new Hono<App>()
			// counter
			.get('/counter', async (c) => {
				const value = await this.state.storage.get('value') || 0
				return c.json({ value })
			})
			.put(async (c) => {
				const value = await this.state.storage.get('value')
				const newValue = typeof value === 'number' ? value + 1 : 1
				this.state.storage.put('value', newValue)
				return c.json({ value: newValue })
			})

		app.route('/v1', counter)

		return app.fetch(request, this.bindings, {
			passThroughOnException: () => {},
			waitUntil: this.state.waitUntil.bind(this.state),
		})
	}
}
