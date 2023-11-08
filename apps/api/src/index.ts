import { Hono } from 'hono'
import type { App } from './types'
import { newHono } from './hono'
import { routes } from './routes'
import { addCors } from './cors'
import { CounterConfig, flagsSchema } from 'store'
import { btnApp } from './btn'

export { Counter } from './Counter'

const app = newHono({ transaction: { op: 'http.server' } }).use(addCors)

const v1 = new Hono<App & { Variables: { config?: CounterConfig; configPath: string } }>()
	.use(routes.v1.counter.all, async (c, next) => {
		// Validate namespace/name
		const { namespace, name } = c.req.param()
		const re = /^[a-z0-9_\-.]{4,64}$/

		if (!re.test(namespace)) {
			return c.json({ error: `invalid namespace, must match ${re}` }, { status: 400 })
		}
		if (!re.test(name)) {
			return c.json({ error: 'invalid name, must match ${re}' }, { status: 400 })
		}

		// Add meta for later
		const configPath = `${namespace}/${name}`
		c.set('configPath', configPath)

		const start = new Date().getTime()
		const span = c.get('tx').startChild({ op: 'get_config', description: 'Get config from KV' })
		const metaText = await c.env.CONFIG.get(configPath, { cacheTtl: 120 })
		span.finish()
		const end = new Date().getTime()
		console.log(`got config in ${end - start}ms`)

		if (metaText) {
			const config = CounterConfig.fromJson(metaText)
			c.set('config', config)
		}
		await next()
	})

	// Reserved namespaces require special auth
	.use(routes.v1.counter.all, async (c, next) => {
		const { namespace } = c.req.param()
		const reservedNamespaces = ['auth', 'api', 'www', 'blog', 'docs', 'support', 'status', 'uuid.rocks', 'uuid-rocks', 'jacob']
		if (reservedNamespaces.includes(namespace)) {
			const token = c.req.header('x-api-key')
			const unauthorized = (): Response => c.json({ error: 'unauthorized' }, { status: 401 })

			if (!token) {
				return unauthorized()
			}

			if (token !== c.env.ADMIN_TOKEN) {
				return unauthorized()
			}
		}

		await next()
	})

	.post(routes.v1.counter.new, async (c) => {
		if (c.get('config')) {
			return c.json({ error: 'already exists' }, { status: 409 })
		}

		// Get an ID from the name so that it's consistent
		const id = c.env.COUNTER.idFromName(c.get('configPath'))
		const flags = flagsSchema.createDefault()
		// Auth is not possible right now so disable it
		flags.set(flagsSchema.fields.useAuth, false)
		const newConfig = new CounterConfig({
			v: 1,
			id: id.toString(),
			f: flags.toBase64(),
		})
		await c.env.CONFIG.put(c.get('configPath'), newConfig.toJson())
		return c.json({ result: 'created' })
	})

	// Auth rest of routes based on config
	.use(routes.v1.counter.all, async (c, next) => {
		const config = c.get('config')
		if (!config) {
			return c.json({ error: 'unauthorized' }, { status: 401 })
		}

		// TODO: Implement auth
		if (config.useAuth()) {
			return c.json({ error: 'unauthorized' }, { status: 401 })
		}
		await next()
	})

	.get(routes.v1.counter.get, async (c) => {
		const config = c.get('config')
		if (!config) {
			return c.json({ error: 'not found' }, { status: 404 })
		}
		const span = c.get('tx').startChild({ op: 'get_counter_id', description: 'Get counter DO ID' })
		const id = c.env.COUNTER.idFromString(config.id)
		span.finish()

		const span2 = c.get('tx').startChild({ op: 'get_counter_stub', description: 'Get counter DO stub' })
		const stub = c.env.COUNTER.get(id)
		span2.finish()

		const span3 = c.get('tx').startChild({ op: 'fetch_counter', description: 'Fetch counter from DO' })
		try {
			const res = await stub.fetch(c.req.raw)
			return res
		} finally {
			span3.finish()
		}
	})

	.on(['get', 'post'], routes.v1.counter.inc, async (c) => {
		const config = c.get('config')
		if (!config) {
			return c.json({ error: 'not found' }, { status: 404 })
		}

		// Go faster at the expense of not confirming
		// the write before returning
		if (c.req.query('fast') === 'true') {
			const fn = async (): Promise<void> => {
				const id = c.env.COUNTER.idFromString(config.id)
				const stub = c.env.COUNTER.get(id)
				await stub.fetch(c.req.raw)
			}
			c.executionCtx.waitUntil(fn())
			return c.json({ status: 'ok' })
		}

		// Otherwise, return the response from the DO
		const start2 = Date.now()
		const span = c.get('tx').startChild({ op: 'get_counter_id', description: 'Get counter DO ID' })
		const id = c.env.COUNTER.idFromString(config.id)
		span.finish()

		const span2 = c.get('tx').startChild({ op: 'get_counter_stub', description: 'Get counter DO stub' })
		const stub = c.env.COUNTER.get(id)
		span2.finish()

		const span3 = c.get('tx').startChild({ op: 'fetch_counter', description: 'Fetch counter from DO' })
		const res = await stub.fetch(c.req.raw)
		span3.finish()

		const end2 = Date.now()
		console.log(`fetched from do in ${end2 - start2}ms`)
		return res
	})

app.route('/v1', v1)
app.route('/auth', btnApp)

export default app
