import { Hono } from 'hono'
import { initSentry } from './sentry'
import { App } from './types'

/** Create a new root Hono app with Sentry */
export function newHono(): Hono<App, {}, '/'> {
	return (
    new Hono<App>()
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
        console.log(err)
				return c.text('internal server error', 500)
			})
	)
}
