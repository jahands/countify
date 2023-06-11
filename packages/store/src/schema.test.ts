import { describe, expect, it } from 'vitest'
import { schema } from './schema'

describe('store', () => {
	it('should parse permissions', () => {
		const perms = schema.createDefault()
		expect(perms.is(schema.fields.valid)).toBe(true)
	})
})
