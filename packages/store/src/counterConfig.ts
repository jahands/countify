/** KV Store holds data at the edge for a individual counter */
import { Permissions, Schema } from 'permissible'

export const flagsJsonSchema = {
	/** Should always be true - indicates that we stored flags correctly */
	isValid: true,
	/** Whether auth is enabled at all */
	useAuth: true,
	// TODO: useAuthInReadOnly to allow no auth for reads
}

export const flagsSchema = new Schema(flagsJsonSchema)

export interface CounterMeta {
	/** Version of the meta in case we change it later */
	v: 1
	/** Durable Object ID of the counter. This saves
	 * us from having to do `c.env.COUNTER.idFromName()`
	 */
	id: string
	/** Flags encoded as base64 */
	f: string
}

export function isCounterMeta(obj: any): obj is CounterMeta {
	return typeof obj === 'object' && typeof obj.v === 'number' && typeof obj.id === 'string' && typeof obj.f === 'string'
}

export class CounterConfig implements CounterMeta {
	v: 1
	id: string
	f: string

	private flags: Permissions<typeof flagsJsonSchema>

	constructor(meta: CounterMeta) {
		this.v = meta.v
		this.id = meta.id
		this.f = meta.f

		this.flags = Permissions.fromBase64(meta.f, flagsSchema)
		if (!this.validateFlags()) {
			throw new Error('Invalid flags!')
		}
	}

	static fromJson(json: string): CounterConfig {
		const data = JSON.parse(json)
		if (!isCounterMeta(data)) {
			throw new Error('Invalid CounterConfig meta')
		}
		return new CounterConfig(data)
	}

	valueOf(): CounterMeta {
		const meta: CounterMeta = {
			v: this.v,
			id: this.id,
			f: this.flags.toBase64(),
		}
		return meta
	}

	toJson(): string {
		return JSON.stringify(this.valueOf())
	}

	/** Validates that the loaded flags are valid */
	private validateFlags(): boolean {
		return this.isValid()
	}

	/** Flags */

	/** Indicates that the flags are valid */
	isValid(): boolean {
		return this.flags.is(flagsSchema.fields.isValid)
	}

	/** Indicates that auth is enabled */
	useAuth(): boolean {
		return this.flags.is(flagsSchema.fields.useAuth)
	}

	setUseAuth(useAuth: boolean): void {
		this.flags.set(flagsSchema.fields.useAuth, useAuth)
	}
}
