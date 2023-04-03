import type {SlashCommandBuilder} from "discord.js"

/**
 * Spécifications de forme
 */
export type TCreationProperties = {
	revision: number
	data: SlashCommandBuilder
	execute: (...args: any[]) => Promise<void>
}

export interface ICommand {
	readonly revision: number
	readonly data: SlashCommandBuilder
	readonly execute: (...args: any[]) => Promise<void>
}

/**
 * Spécifications de comportement
 */
