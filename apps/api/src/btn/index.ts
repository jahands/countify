import { newHono } from '../hono'

export const btnApp = newHono().post('/btn.social/webhook', async (c) => {
	const body = await c.req.json()
	console.log(body)
	return c.json({ ok: true })
})
