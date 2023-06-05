import { unstable_dev } from 'wrangler'
import fs from 'fs/promises'
import type { UnstableDevWorker } from 'wrangler'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'

describe.skip('Worker', () => {
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
})
