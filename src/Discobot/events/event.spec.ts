import type { ClientEvents } from "discord.js"

export type TEvent = {
	readonly name: keyof ClientEvents
	readonly once: boolean
	readonly execute: (...args: any[]) => Promise<void>
}