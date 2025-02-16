import { Toucan } from 'toucan-js'
import { Bindings } from './types'

declare const ENVIRONMENT: string

export function initSentry(request: Request, env: Bindings, ctx: ExecutionContext): Toucan {
	return new Toucan({
		dsn: env.SENTRY_DSN,
		context: ctx,
		environment: ENVIRONMENT,
		release: env.SENTRY_RELEASE,
		request,
		tracesSampleRate: 0.001,
	})
}
