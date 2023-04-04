import type {Client, Guild} from "discord.js"
import type {IServer} from "./Discobot/Server.spec"
import type {IOpenAI} from "./OpenAI.spec"

/**
 * Spécification de forme
 */
export interface IDiscobot extends Client {
	redeployCommands(): Promise<void>
	populateServers(): Promise<void>
	logWelcome(): void
	start(): Promise<void>
	getOpenAI(userId: string, serverId?: string): IOpenAI | false
	setOpenAI(userId: string, openAI: IOpenAI | string | false, serverId?: string | Guild): Promise<IOpenAI | false>
	getOrCreateServer(server: string | Guild): Promise<IServer>
}

/**
 * Spécification de comportement
 */
