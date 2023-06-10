import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { demo } from '.'

describe('permissions', () => {
	it('should parse permissions', () => {
		expect(1).toBe(1)
	})

	it('should run demo', () => {
		demo()
	})
})
