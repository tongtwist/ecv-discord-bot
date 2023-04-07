import {z} from "zod"
import type {BaseInteraction, ChatInputCommandInteraction} from "discord.js"
import type {TJSONObject} from "../utils/JSON.spec"
import type {IDiscobot} from "../Discobot.spec"
import CommandsManager from "./CommandsManager"

/************************************************************************************
 * Spécification de forme
 ***********************************************************************************/
export type TConfig = z.infer<typeof CommandsManager.configSchema>

export interface ICommandsManager {
	toJSON(): TJSONObject
	init(bot: IDiscobot): Promise<void>
	redeploy(bot: IDiscobot): Promise<boolean>
}

/************************************************************************************
 * Spécification de comportement
 ***********************************************************************************/
