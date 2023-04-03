import type {Client} from "discord.js"
import type {IOpenAI} from "./OpenAI.spec"

/**
 * Spécification de forme
 */
export interface IDiscobot extends Client {
	redeployCommands(): Promise<void>
	logWelcome(): void
	openAI(userId: string, openAI?: IOpenAI | string): Promise<IOpenAI | undefined>
	start(): Promise<void>
}

/**
 * Spécification de comportement
 */
