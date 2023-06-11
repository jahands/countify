import { Hono } from 'hono'
import { initSentry } from './sentry'
import { App } from './types'

/** Create a new root Hono app with Sentry */
export function newHono(): Hono<App, object, '/'> {
	return (
		new Hono<App>()
			// Sentry
			.use(async (c, next) => {
				c.set('sentry', initSentry(c.req.raw, c.env, c.executionCtx))
				const start = Date.now()
				await next()
				const end = Date.now()
				console.log(`TOTAL: ${end - start}ms`)
				if (c.error) {
					c.get('sentry').captureException(c.error)
				}
			})
			.onError((err, c) => {
				c.get('sentry').captureException(err)
				return c.json({ result: 'internal server error' }, 500)
			})
	)
}
