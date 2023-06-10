import { Permissions, Schema } from './index'
import { JsonPermissions } from './types'
import { describe, it, expect } from 'vitest'

describe('premissible', () => {
	const jsonSchema = {
		writeAccess: false,
		readAccess: true,
		deleteAccess: false,
		type: {
			default: 'user',
			fields: ['moderator', 'admin', 'user', 'guest'],
		},
		premium: true,
		visible: true,
	}

	const schema: Schema<typeof jsonSchema> = new Schema(jsonSchema)

	const json: JsonPermissions = {
		writeAccess: false,
		readAccess: true,
		deleteAccess: false,
		type: 'user',
		premium: true,
		visible: true,
	}

	const validBase64: string = Permissions.fromJson(json, schema).toBase64()

	it('create default', () => {
		const permissions: Permissions<typeof jsonSchema> = Permissions.fromJson(json, schema)

		expect(schema.createDefault().valueOf()).toBe(permissions.valueOf())
	})

	it('from/to json', () => {
		const permissions: Permissions<typeof jsonSchema> = Permissions.fromJson(json, schema)

		expect(permissions.toJson()).toStrictEqual(json)
	})

	it('from/to base64', () => {
		const permissions: Permissions<typeof jsonSchema> = Permissions.fromBase64(validBase64, schema)

		expect(permissions.toBase64()).toBe(validBase64)
	})

	it('is/set values', () => {
		const permissions: Permissions<typeof jsonSchema> = Permissions.fromJson(json, schema)

		expect(permissions.is(schema.fields.writeAccess)).toBe(false)
		expect(permissions.is(schema.fields.readAccess)).toBe(true)
		expect(permissions.is(schema.fields.deleteAccess)).toBe(false)
		expect(permissions.is(schema.fields.type, schema.fields.type.user)).toBe(true)
		expect(permissions.is(schema.fields.premium)).toBe(true)
		expect(permissions.is(schema.fields.visible)).toBe(true)

		permissions.set(schema.fields.type, schema.fields.type.admin)
		permissions.set(schema.fields.visible, false)
		permissions.set(schema.fields.writeAccess, true)
		permissions.set(schema.fields.deleteAccess, true)

		expect(permissions.is(schema.fields.writeAccess)).toBe(true)
		expect(permissions.is(schema.fields.readAccess)).toBe(true)
		expect(permissions.is(schema.fields.deleteAccess)).toBe(true)
		expect(permissions.is(schema.fields.type, schema.fields.type.admin)).toBe(true)
		expect(permissions.is(schema.fields.premium)).toBe(true)
		expect(permissions.is(schema.fields.visible)).toBe(false)
	})

	it('string length', () => {
		expect(() => Permissions.fromBase64('a', schema)).toThrow(
			'Invalid string input, expected string of length 4, received string of length 1.'
		)
		expect(() => Permissions.fromBase64('aadasdad', schema)).toThrow(
			'Invalid string input, expected string of length 4, received string of length 8.'
		)
	})

	it('base64', () => {
		expect(() => Permissions.fromBase64('aa?d', schema)).toThrow('Invalid base64 string')
	})
})
