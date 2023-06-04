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

export default app
