import {z} from "zod"
import type {GuildChannel, DMChannel, ChannelType} from "discord.js"
import type {TJSONObject, TJSON} from "../../../utils/JSON.spec"
import type {IOpenAI} from "../../../OpenAI.spec"
import type {IThread} from "../../ThreadsManager/Thread.spec"
import Channel from "./Channel"

/***********************************************************************************
 * Spécification de forme
 **********************************************************************************/

/**
 * Le type d'un objet de configuration d'un channel est défini par son schéma de validation
 */
export type TConfig = z.infer<typeof Channel.configSchema>

export interface IChannel {
	readonly id: string
	readonly type?: ChannelType
	readonly name?: string
	channel?: GuildChannel | DMChannel
	openAI?: IOpenAI
	toJSON(): TJSON
	getThread(id: string): IThread | undefined
	setThread(id: string, thread?: IThread): IThread | undefined
	getOrCreate(id: string): IThread
}

/***********************************************************************************
 * Spécification de comportement
 **********************************************************************************/
