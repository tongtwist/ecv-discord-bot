import {z} from "zod"
import type {BaseInteraction, ChatInputCommandInteraction} from "discord.js"
import type {TJSONObject} from "../utils/JSON.spec"
import type {IDiscobot} from "../Discobot.spec"
import Commands from "./Commands"

/************************************************************************************
 * Spécification de forme
 ***********************************************************************************/
export type TConfig = z.infer<typeof Commands.configSchema>

export interface ICommands {
	toJSON(): TJSONObject
	load(): Promise<void>
	handle(interaction: BaseInteraction): Promise<void>
	executeChatInputCommandInteraction(interaction: ChatInputCommandInteraction): Promise<void>
	redeploy(bot: IDiscobot): Promise<boolean>
}

/************************************************************************************
 * Spécification de comportement
 ***********************************************************************************/
