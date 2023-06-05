import { Hono } from 'hono'
import type { App, CounterMeta } from './types'
import { newHono } from './hono'
import { routes } from './routes'
import { isCounterMeta } from './typeguards'
import { addCors } from './cors'

export { Counter } from './Counter'

const app = newHono().use(addCors)

const v1 = new Hono<App & { Variables: { meta?: CounterMeta; configPath: string } }>()
	.use(routes.v1.counter.all, async (c, next) => {
		// Validate namespace/name
		const { namespace, name } = c.req.param()
		const re = /^[a-zA-Z0-9_\-.]{4,64}$/

		if (!re.test(namespace)) {
			return c.json({ error: `invalid namespace, must match ${re}` }, { status: 400 })
		}
		if (!re.test(name)) {
			return c.json({ error: 'invalid name, must match ${re}' }, { status: 400 })
		}

		// Add meta for later
		const configPath = `${namespace}/${name}`
		c.set('configPath', configPath)

		const metaText = await c.env.CONFIG.get(configPath, { cacheTtl: 120 })
		if (metaText) {
			const meta = JSON.parse(metaText)
			if (!isCounterMeta(meta)) {
				return c.json({ error: 'invalid meta' }, { status: 500 })
			}
			c.set('meta', meta)
		}
		await next()
	})

	.post(routes.v1.counter.new, async (c) => {
		if (c.get('meta')) {
			return c.json({ error: 'already exists' }, { status: 409 })
		}

		// Get an ID from the name so that it's consistent
		const id = c.env.COUNTER.idFromName(c.get('configPath'))
		const newMeta: CounterMeta = {
			v: 1,
			id: id.toString(),
		}
		await c.env.CONFIG.put(c.get('configPath'), JSON.stringify(newMeta))
		return c.json({ result: 'created' })
	})

	.get(routes.v1.counter.get, async (c) => {
		const meta = c.get('meta')
		if (!meta) {
			return c.json({ error: 'not found' }, { status: 404 })
		}
		const id = c.env.COUNTER.idFromString(meta.id)
		const stub = c.env.COUNTER.get(id)
		return stub.fetch(c.req.raw)
	})

	.on(['get', 'post'], routes.v1.counter.inc, async (c) => {
		const meta = c.get('meta')
		if (!meta) {
			return c.json({ error: 'not found' }, { status: 404 })
		}
		const id = c.env.COUNTER.idFromString(meta.id)
		const stub = c.env.COUNTER.get(id)
		return stub.fetch(c.req.raw)
	})

app.route('/v1', v1)

export default app
