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

	it('should return Hello World', async () => {
		const res = await worker.fetch('/v1/hello')
		const text = await res.text()
		expect(text).toMatchInlineSnapshot('"hello world"')
	})

	describe('config', () => {
		it('should save and retrieve config', async () => {
			const path = '/v1/config'
			// Should be nothing there initially
			const res0 = await worker.fetch(path)
			const text0 = await res0.text()
			expect(text0).toMatchInlineSnapshot('""')

			const res1 = await worker.fetch(path, { method: 'PUT' })
			const text1 = await res1.text()
			expect(text1).toMatchInlineSnapshot('"ok"')

			const res2 = await worker.fetch(path)
			const text2 = await res2.text()
			expect(text2).toMatchInlineSnapshot('"bar"')
		})
	})
})
