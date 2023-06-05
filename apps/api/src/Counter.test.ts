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

	describe('demo counter', () => {
		it('should save and retrieve counter', async () => {
			const path = '/v1/counter'
			// Should be nothing there initially
			const res0 = await worker.fetch(path)
			const text0 = await res0.text()
			expect(text0).toMatchInlineSnapshot('"{\\"value\\":0}"')

			const res1 = await worker.fetch(path, { method: 'PUT' })
			const text1 = await res1.text()
			expect(text1).toMatchInlineSnapshot('"{\\"value\\":1}"')

			const res2 = await worker.fetch(path)
			const text2 = await res2.text()
			expect(text2).toMatchInlineSnapshot('"{\\"value\\":1}"')
		})
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
	})
})