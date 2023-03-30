export type TCommand = {
	readonly revision: number
	readonly data: any
	readonly execute: (...args: any[]) => Promise<void>
}