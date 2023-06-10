export type Field = {
	index: bigint
	length: bigint
	[key: string]: bigint
}
export type JsonPermissions = Record<string, boolean | string>
export type FieldValue = boolean | { default: string; fields: string[] }
export type JsonSchema = Record<string, FieldValue>
export type Fields<T> = {
	[key in keyof T]: Field
}
