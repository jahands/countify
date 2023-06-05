import { Hono } from 'hono'
import type { App } from './types'
import { initSentry } from './sentry'

const app = new Hono<App>()
	// Sentry
	.use(async (c, next) => {
		c.set('sentry', initSentry(c.req.raw, c.env, c.executionCtx))
		await next()
		if (c.error) {
			c.get('sentry').captureException(c.error)
		}
	})
	.onError((err, c) => {
		c.get('sentry').captureException(err)
		return c.text('internal server error', 500)
	})

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

app.route('/v1', v1)

export default app
