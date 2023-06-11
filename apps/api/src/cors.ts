import { Context } from 'hono'
import { App } from './types'

export const defaultCors = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': '*',
	'Access-Control-Allow-Headers': '*',
}

export async function addCors(c: Context<App, never, object>, next: () => Promise<void>): Promise<void> {
	for (const [k, v] of Object.entries(defaultCors)) {
		c.header(k, v)
	}
	await next()
}
