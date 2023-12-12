import { newHono } from '../hono'

export const btnApp = newHono({ transaction: { op: 'http.server' } }).post('/btn.social/webhook', async (c) => {
	const body = await c.req.json()
	console.log(body)
	return c.json({ ok: true })
})
