import { Schema } from 'permissible'

export const jsonSchema = {
	/** Should always be true - indicates that we stored perms correctly */
	valid: true,
}

export const schema = new Schema(jsonSchema)
