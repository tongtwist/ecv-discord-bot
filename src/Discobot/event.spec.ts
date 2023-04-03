import type {ClientEvents} from "discord.js"

/**
 * Spécification de forme
 */
export type TCreationProperties = {
	name: keyof ClientEvents
	once?: boolean
	execute: (...args: any[]) => Promise<void>
}

export interface IEvent {
	readonly name: keyof ClientEvents
	readonly once: boolean
	readonly execute: (...args: any[]) => Promise<void>
}

/**
 * Spécification de comportement
 */
