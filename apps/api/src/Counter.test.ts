import { unstable_dev } from 'wrangler'
import fs from 'fs/promises'
import type { UnstableDevWorker } from 'wrangler'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'

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
})
