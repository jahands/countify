import { Hono } from 'hono'
import type { App } from './types'
import { initSentry } from './sentry'
import { newHono } from './hono'

export { Counter } from './Counter'

const app = newHono()

const v1 = new Hono<App>()
	// Demo routes
	.get('/hello', async (c) => {
		return c.text('hello world')
	})
	.put('/config', async (c) => {
		await c.env.CONFIG.put('foo', 'bar')
		return c.text('ok')
	})
	.get(async (c) => {
		const foo = await c.env.CONFIG.get('foo')
		return c.body(foo)
	})
	// Demo counter
	.all('/counter', async (c) => {
		const id = c.env.COUNTER.idFromName('counter')
		const stub = c.env.COUNTER.get(id)
		return stub.fetch(c.req.raw)
	})

app.route('/v1', v1)

export default app
