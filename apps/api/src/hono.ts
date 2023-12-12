import { Hono, Schema } from 'hono'
import { initSentry } from './sentry'
import '@sentry/tracing'
import { App } from './types'

/** Create a new root Hono app with Sentry */
export function newHono(args: { transaction: { op: string } }): Hono<App, Schema, '/'> {
	return (
		new Hono<App>()
			// Sentry
			.use('*', async (c, next) => {
				const sentry = initSentry(c.req.raw, c.env, c.executionCtx)
				const tx = sentry.startTransaction({
					name: c.req.path,
					op: args.transaction.op,
					tags: { urlPath: c.req.path, rootOP: args.transaction.op },
				})
				sentry.configureScope((scope) => {
					scope.setSpan(tx)
				})

				c.set('sentry', sentry)
				c.set('tx', tx)

				await next()

				c.get('tx').setName(c.req.routePath)
				c.get('tx').finish()
			})
			.onError((err, c) => {
				c.get('sentry').captureException(err)
				return c.json({ result: 'internal server error' }, 500)
			})
	)
}
