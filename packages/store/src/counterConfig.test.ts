import { describe, expect, it } from 'vitest'
import { CounterConfig, flagsSchema } from './counterConfig'

describe('counterConfig', () => {
	it('should construct and read as-is', () => {
		const flags = flagsSchema.createDefault()
		const flags64 = flags.toBase64()
		const config = new CounterConfig({
			v: 1,
			id: 'hello',
			f: flags64,
		})

		const expected = {
			v: 1,
			id: 'hello',
			f: 'Aw',
		}
		expect(JSON.parse(config.toJson())).toStrictEqual(expected)
		expect(config.valueOf()).toStrictEqual(expected)
	})

	it('should reject invalid flags', () => {
		expect(() => {
			new CounterConfig({
				v: 1,
				id: 'hello',
				f: 'hello', // invalid
			})
		}).toThrowError()

		expect(() => {
			CounterConfig.fromJson(
				JSON.stringify({
					v: 1,
					id: 'hello',
					f: 'hello', // invalid
				})
			)
		}).toThrowError()
	})
})
