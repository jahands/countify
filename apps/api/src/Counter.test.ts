import { unstable_dev } from 'wrangler'
import fs from 'fs/promises'
import type { UnstableDevWorker } from 'wrangler'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { CounterAction } from './types'

describe('Worker', () => {
	let worker: UnstableDevWorker

	beforeAll(async () => {
		await fs.rm('.wrangler/', { recursive: true, force: true })
		worker = await unstable_dev('src/index.ts', {
			experimental: { disableExperimentalWarning: true },
		})
	})

	afterAll(async () => {
		await worker.stop()
	})

	describe('counter', () => {
		const path = (action: CounterAction) => `/v1/${action}/myNamespace/myCounter`
		it('should not already have a counter', async () => {
			const res = await worker.fetch(path('get'))
			const text = await res.text()
			expect(text).toMatchInlineSnapshot('"{\\"error\\":\\"not found\\"}"')
		})

		it('should create a counter', async () => {
			const res = await worker.fetch(path('new'), { method: 'POST' })
			const text = await res.text()
			expect(text).toMatchInlineSnapshot('"{\\"result\\":\\"ok\\"}"')
		})

		it('should get a counter', async () => {
			const res = await worker.fetch(path('get'))
			const text = await res.text()
			expect(text).toMatchInlineSnapshot('"{\\"value\\":0}"')
		})

		it('should increment a counter', async () => {
			for (let i = 0; i < 10; i++) {
				const res = await worker.fetch(path('inc'), { method: 'POST' })
				const json = await res.json()
				expect(json).toEqual({ value: i + 1 })

				const res2 = await worker.fetch(path('get'))
				const json2 = await res2.json()
				expect(json2).toEqual({ value: i + 1 })
			}
		})

		it('should not create a counter if it already exists', async () => {
			const res = await worker.fetch(path('new'), { method: 'POST' })
			const text = await res.text()
			expect(text).toMatchInlineSnapshot('"{\\"error\\":\\"already exists\\"}"')

			// Make sure the value is still there
			const res2 = await worker.fetch(path('get'))
			const json2 = await res2.json()
			expect(json2).toEqual({ value: 10 })
		})
	})
})
