export type Field = {
	index: bigint
	length: bigint
	[key: string]: bigint
}
export type JsonPermissions = Record<string, boolean | string>
export type JsonEnum = { default: string; fields: string[] }
export type JsonSchema = Record<string, boolean | JsonEnum>
export type Fields<T> = {
	[key in keyof T]: Field
}
