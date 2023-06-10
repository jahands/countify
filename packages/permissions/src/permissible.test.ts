/** Tests to learn how permissible works */
import { describe, expect, it } from 'vitest'
import { Permissions, Schema } from 'permissible'

describe('permissible', () => {
	it('should allow adding new perms', () => {
		const jsonSchema = {
			sendMessage: true,
			readMessageHistory: false,
			type: {
				default: 'user',
				fields: ['_', 'user', 'admin'],
			},
		}

		const schema = new Schema(jsonSchema)

		const perms = schema.createDefault()
		expect(perms.toBase64()).toMatchInlineSnapshot('"BQAA"')
		const permsJson = {
			readMessageHistory: false,
			sendMessage: true,
			type: 'user',
		}
		expect(perms.toJson()).toStrictEqual(permsJson)
		expect(perms.is(schema.fields.sendMessage)).toBe(permsJson.sendMessage)
		expect(perms.is(schema.fields.readMessageHistory)).toBe(permsJson.readMessageHistory)
		expect(perms.is(schema.fields.type, schema.fields.type.admin)).toBe(permsJson.type === 'admin')
		expect(perms.is(schema.fields.type, schema.fields.type.user)).toBe(permsJson.type === 'user')

		// Extend the schema and try parsing
		const jsonSchema2 = {
			sendMessage: true,
			readMessageHistory: false,
			type: {
				default: 'user',
				// added a new option - for some reason the first index
				// seems unusable
				fields: ['_', 'user', 'admin', 'mod'],
			},
			// Added a new field
			deleteMessage: false,
		}

		const schema2 = new Schema(jsonSchema2)
		const perms2 = Permissions.fromBase64(perms.toBase64(), schema2)
		expect(perms2.toJson()).toStrictEqual({
			...permsJson,
			deleteMessage: false,
		})
		expect(perms2.toBase64()).toMatchInlineSnapshot('"BQAA"')

		// Make sure perms haven't changed
		expect(perms2.is(schema2.fields.sendMessage)).toBe(permsJson.sendMessage)
		expect(perms2.is(schema2.fields.readMessageHistory)).toBe(permsJson.readMessageHistory)
		expect(perms2.is(schema2.fields.type, schema2.fields.type.admin)).toBe(permsJson.type === 'admin')
		expect(perms2.is(schema2.fields.type, schema2.fields.type.user)).toBe(permsJson.type === 'user')
		const isMod = false
		expect(perms2.is(schema2.fields.type, schema2.fields.type.mod)).toBe(isMod)

		// Try setting the new fields
		perms2.set(schema2.fields.type, schema2.fields.type.mod)
		expect(perms2.is(schema2.fields.type, schema2.fields.type.mod)).toBe(true)

		perms2.set(schema2.fields.deleteMessage, true)
		expect(perms2.is(schema2.fields.deleteMessage)).toBe(true)

		// Set an original field to false
		expect(perms2.is(schema2.fields.sendMessage)).toBe(true)
		perms2.set(schema2.fields.sendMessage, false)
		expect(perms2.is(schema2.fields.sendMessage)).toBe(false)

		expect(perms2.toBase64()).toMatchInlineSnapshot('"LAAA"')
	})

	it('should be able to support lots of permissions', () => {
		const jsonSchema = {
			a1: true,
			a2: false,
			a3: false,
			a4: false,
			a5: false,
			a6: true,
			a7: false,
			a8: false,
			a9: false,
			a10: false,
			a11: true,
			a21: false,
			a31: false,
			a41: false,
			a51: false,
			a61: true,
			a71: false,
			a81: false,
			a91: false,
			a111: true,
			a211: false,
			a311: false,
			a411: false,
			a511: false,
			a611: true,
			a711: false,
			a811: false,
			a911: false,
			a1111: true,
			a2111: false,
			a3111: false,
			a4111: false,
			a5111: false,
			a6111: true,
			a7111: false,
			a8111: false,
			a9111: false,
			a11112: true,
			a21112: false,
			a31112: false,
			a41112: false,
			a51112: false,
			a61112: true,
			a71112: false,
			a81112: false,
			a91112: true,
			a111121: true,
			a211121: false,
			a311121: false,
			a411121: false,
			a511121: false,
			a611121: true,
			a711121: false,
			a811121: false,
			a911121: true,
			b1: true,
			b2: false,
			b3: false,
			b4: false,
			b5: false,
			b6: true,
			b7: false,
			b8: false,
			b9: false,
			b10: false,
			b11: true,
			b21: false,
			b31: false,
			b41: false,
			b51: false,
			b61: true,
			b71: false,
			b81: false,
			b91: false,
			b111: true,
			b211: false,
			b311: false,
			b411: false,
			b511: false,
			b611: true,
			b711: false,
			b811: false,
			b911: false,
			b1111: true,
			b2111: false,
			b3111: false,
			b4111: false,
			b5111: false,
			b6111: true,
			b7111: false,
			b8111: false,
			b9111: false,
			b11112: true,
			b21112: false,
			b31112: false,
			b41112: false,
			b51112: false,
			b61112: true,
			b71112: false,
			b81112: false,
			b91112: true,
			b111121: true,
			b211121: false,
			b311121: false,
			b411121: false,
			b511121: false,
			b611121: true,
			b711121: false,
			b811121: false,
			b911121: true,
		}

		const schema = new Schema(jsonSchema)

		const perms = schema.createDefault()
		expect(perms.toBase64()).toMatchInlineSnapshot('"IYQIESJkyBBChAgRMiQA"')
		expect(Object.entries(jsonSchema).length).toBe(110)

		expect(perms.toJson()).toStrictEqual(jsonSchema)
	})
})
